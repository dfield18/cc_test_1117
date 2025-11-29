import { NextRequest, NextResponse } from 'next/server';

/**
 * Detects if the request is from a mobile device based on User-Agent
 */
function isMobileDevice(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}

/**
 * Fetches a random cartoon from a GitHub repository or URL
 * Supports:
 * - GitHub repository with images
 * - Direct image URLs
 * - JSON files with cartoon metadata
 */
export async function GET(request: NextRequest) {
  try {
    // Get already shown cartoons from query parameter
    const { searchParams } = new URL(request.url);
    const shownCartoonsParam = searchParams.get('shown');
    let shownCartoons: string[] = [];
    
    if (shownCartoonsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(shownCartoonsParam));
        shownCartoons = Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        console.error('Error parsing shown cartoons parameter:', parseError);
        shownCartoons = [];
      }
    }
    
    // Detect device type - prefer query parameter, fallback to User-Agent
    const deviceParam = searchParams.get('device');
    let deviceFolder: string;
    
    if (deviceParam === 'mobile' || deviceParam === 'desktop') {
      deviceFolder = deviceParam;
    } else {
      // Fallback to User-Agent detection
      const userAgent = request.headers.get('user-agent');
      const isMobile = isMobileDevice(userAgent);
      deviceFolder = isMobile ? 'mobile' : 'desktop';
    }
    
    // Configuration - can be moved to environment variables
    const CARTOON_SOURCE = process.env.CARTOON_SOURCE || 'github';
    const GITHUB_REPO = process.env.CARTOON_GITHUB_REPO || 'dfield18/cartoons';
    const CARTOON_URL = process.env.CARTOON_URL || '';
    
    let imageUrl: string;
    
    if (CARTOON_SOURCE === 'github' && GITHUB_REPO) {
      // Fetch from GitHub repository
      // Maps GitHub tree URLs to API paths:
      // https://github.com/dfield18/cartoons/tree/main/desktop -> api.github.com/repos/dfield18/cartoons/contents/desktop?ref=main
      // https://github.com/dfield18/cartoons/tree/main/mobile -> api.github.com/repos/dfield18/cartoons/contents/mobile?ref=main
      // Format: owner/repo or owner/repo/path/to/folder
      const parts = GITHUB_REPO.split('/');
      const owner = parts[0];
      const repo = parts[1];
      const existingSubfolder = parts.slice(2).join('/'); // Handle subfolders like "owner/repo/images"
      
      // Append device-specific folder (desktop or mobile) to the path
      const subfolder = existingSubfolder 
        ? `${existingSubfolder}/${deviceFolder}`
        : deviceFolder;
      
      if (!owner || !repo) {
        throw new Error('Invalid GitHub repository format. Use owner/repo or owner/repo/path/to/folder');
      }
      
      // Helper function to fetch and process images from a GitHub path
      const fetchImagesFromPath = async (path: string): Promise<{ imageFiles: any[], success: boolean }> => {
        // Explicitly use 'main' branch to match the GitHub tree URLs
        const githubApiUrl = path 
          ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main`
          : `https://api.github.com/repos/${owner}/${repo}/contents?ref=main`;
        
        console.log(`Fetching from GitHub API: ${githubApiUrl}`);
        
        try {
          const response = await fetch(githubApiUrl, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`GitHub API error (${response.status}) for path ${path}:`, errorText);
            return { imageFiles: [], success: false };
          }
          
          const files = await response.json();
          
          // Check if response is an error message
          if (files && files.message) {
            return { imageFiles: [], success: false };
          }
          
          // Handle both single file and array responses
          const fileList = Array.isArray(files) ? files : [files];
          
          // Recursively collect all image files (including from subdirectories)
          const imageFiles: any[] = [];
          
          const collectImages = async (items: any[]) => {
            for (const item of items) {
              if (item.type === 'file' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.name)) {
                imageFiles.push(item);
              } else if (item.type === 'dir') {
                // Fetch subdirectory contents
                try {
                  const dirResponse = await fetch(item.url, {
                    headers: {
                      'Accept': 'application/vnd.github.v3+json',
                    },
                  });
                  if (dirResponse.ok) {
                    const dirFiles = await dirResponse.json();
                    await collectImages(Array.isArray(dirFiles) ? dirFiles : [dirFiles]);
                  }
                } catch (err) {
                  // Skip subdirectories that fail to load
                  console.warn(`Failed to load subdirectory ${item.path}:`, err);
                }
              }
            }
          };
          
          await collectImages(fileList);
          return { imageFiles, success: true };
        } catch (error) {
          console.error(`Error fetching from path ${path}:`, error);
          return { imageFiles: [], success: false };
        }
      };
      
      // Try device-specific folder first, then fallback to root if it doesn't exist
      let imageFiles: any[] = [];
      let usedPath = subfolder;
      
      const deviceResult = await fetchImagesFromPath(subfolder);
      if (deviceResult.success && deviceResult.imageFiles.length > 0) {
        imageFiles = deviceResult.imageFiles;
      } else {
        // Fallback to root folder if device folder doesn't exist or is empty
        console.warn(`Device folder ${subfolder} not found or empty, trying root folder`);
        const rootResult = await fetchImagesFromPath(existingSubfolder || '');
        if (rootResult.success && rootResult.imageFiles.length > 0) {
          imageFiles = rootResult.imageFiles;
          usedPath = existingSubfolder || 'root';
        }
      }
      
      if (imageFiles.length > 0) {
        // Filter out already shown cartoons
        const availableFiles = imageFiles.filter((file) => {
          const fileUrl = file.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/main/${encodeURIComponent(file.path)}`;
          return !shownCartoons.includes(fileUrl);
        });
        
        // If all cartoons have been shown, reset and use all files
        const filesToChooseFrom = availableFiles.length > 0 ? availableFiles : imageFiles;
        
        // Pick a random image from available ones
        const randomFile = filesToChooseFrom[Math.floor(Math.random() * filesToChooseFrom.length)];
        // Use download_url for raw file access (GitHub provides this in the API response)
        imageUrl = randomFile.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/main/${encodeURIComponent(randomFile.path)}`;
        console.log(`Selected cartoon: ${randomFile.name} from ${GITHUB_REPO}/${usedPath}${availableFiles.length === 0 ? ' (all shown, resetting)' : ''}`);
      } else {
        console.warn(`No image files found in ${GITHUB_REPO}/${subfolder} or root folder`);
        // Fallback: use a placeholder or default cartoon
        imageUrl = getDefaultCartoon();
      }
    } else if (CARTOON_URL) {
      // Use direct URL
      imageUrl = CARTOON_URL;
    } else {
      // Default: use a fun placeholder or random cartoon service
      imageUrl = getDefaultCartoon();
    }
    
    return NextResponse.json({
      imageUrl,
      source: CARTOON_SOURCE,
    });
  } catch (error) {
    console.error('Error fetching cartoon:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cartoon',
        imageUrl: getDefaultCartoon(),
      },
      { status: 500 }
    );
  }
}

/**
 * Returns a default cartoon URL
 * Can be a placeholder service or a static image
 */
function getDefaultCartoon(): string {
  // Using a placeholder service that provides random images
  // You can replace this with your own cartoon service
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/400/300?random=${randomId}`;
  
  // Alternative: Use a specific cartoon service
  // return 'https://api.placeholder.com/400/300?text=Cartoon+Loading';
}

