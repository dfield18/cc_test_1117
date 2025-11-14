# Credit Card Recommendation Chatbot

A Next.js web application that provides personalized credit card recommendations using RAG (Retrieval-Augmented Generation) with OpenAI embeddings and GPT models.

## Overview

This app uses a public Google Sheet as a database of credit cards and implements a RAG pipeline to:
1. Generate embeddings for each credit card based on their attributes
2. Find the most relevant cards for user queries using semantic search
3. Use GPT to generate personalized recommendations with explanations

## How It Works

### RAG Pipeline

1. **Data Loading**: Fetches credit card data from a public Google Sheet (CSV export)
2. **Embedding Generation**: Creates vector embeddings for each card using OpenAI's `text-embedding-3-small` model
3. **Query Processing**: When a user asks a question:
   - The query is embedded using the same model
   - Cosine similarity is computed to find the top N most relevant cards
   - These candidate cards are passed as context to GPT-4o-mini
4. **Recommendation Generation**: GPT analyzes the candidates and returns the best 3-5 matches with explanations

### Architecture

- **Frontend**: Next.js App Router with React, Tailwind CSS
- **Backend**: Next.js API routes (serverless)
- **LLM**: OpenAI GPT-4o-mini for chat
- **Embeddings**: OpenAI text-embedding-3-small
- **Data Source**: Google Sheets (public CSV export)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Local Development

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local` and add your OpenAI API key:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Optionally customize:
   ```
   GOOGLE_SHEET_ID=your_sheet_id
   CARD_NAME_COLUMN=credit_card_name
   CARD_URL_COLUMN=url_application
   ```

4. **Generate embeddings (first time only):**
   ```bash
   npm run generate-embeddings
   ```
   
   This will:
   - Fetch data from Google Sheets
   - Generate embeddings for all cards
   - Save them to `data/embeddings.json` for faster subsequent loads

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Embeddings

- Embeddings are cached in memory and optionally saved to `data/embeddings.json`
- On first API call, if no embeddings file exists, they will be generated automatically
- To regenerate embeddings (e.g., after updating the Google Sheet), run:
  ```bash
  npm run generate-embeddings
  ```

## Deployment to Vercel

### Step 1: Push to GitHub

1. Initialize a git repository (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key (required)
   - `GOOGLE_SHEET_ID`: (optional, defaults to the provided sheet)
   - `CARD_NAME_COLUMN`: (optional, defaults to `credit_card_name`)
   - `CARD_URL_COLUMN`: (optional, defaults to `url_application`)

5. Click "Deploy"

### Step 3: Generate Embeddings on Vercel

After deployment, you have two options:

**Option A: Generate embeddings on first request**
- The app will automatically generate embeddings on the first API call
- This may take a minute or two, but subsequent requests will be fast

**Option B: Pre-generate embeddings (recommended)**
- Use Vercel's CLI or a one-time script to generate embeddings
- Or manually trigger the API endpoint after deployment

### Important Notes for Vercel

- Vercel has a 10-second timeout for Hobby plans and 60 seconds for Pro
- Embedding generation can take time for large datasets
- Consider pre-generating embeddings or using a background job for production
- The app uses in-memory caching, which resets on each serverless function invocation
- For production, consider using a persistent storage solution (e.g., Vercel KV, Supabase, or a vector database)

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── recommendations/
│   │       └── route.ts          # API endpoint for recommendations
│   ├── globals.css               # Tailwind CSS styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main chat UI
├── lib/
│   ├── data.ts                   # Google Sheets data fetching
│   ├── embeddings.ts              # Embedding generation and storage
│   └── rag.ts                    # RAG pipeline and LLM calls
├── scripts/
│   └── generateEmbeddings.ts     # Script to generate embeddings
├── types/
│   └── index.ts                  # TypeScript type definitions
├── data/
│   └── embeddings.json           # Cached embeddings (gitignored)
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## Configuration

### Google Sheet Format

Your Google Sheet should have:
- A header row with column names
- At least two columns: one for card name and one for application URL
- Default column names: `credit_card_name` and `url_application`
- Any additional columns will be included in the card data and used for embeddings

### Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `GOOGLE_SHEET_ID` (optional): Google Sheet ID (defaults to provided sheet)
- `CARD_NAME_COLUMN` (optional): Column name for card names (default: `credit_card_name`)
- `CARD_URL_COLUMN` (optional): Column name for application URLs (default: `url_application`)

## Features

- ✅ Real-time chat interface
- ✅ Suggested questions for quick start
- ✅ Semantic search using embeddings
- ✅ AI-powered recommendations with explanations
- ✅ Structured recommendation cards
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Error handling and loading states

## Troubleshooting

### "OpenAI API key not configured"
- Make sure you've set `OPENAI_API_KEY` in your `.env.local` file (local) or Vercel environment variables (production)

### "Failed to fetch Google Sheet"
- Verify the Google Sheet is public and the ID is correct
- Check that the sheet has data and proper headers

### Slow first request
- The first request may be slow if embeddings need to be generated
- Pre-generate embeddings using `npm run generate-embeddings` before deploying

### Embeddings not found
- Run `npm run generate-embeddings` to generate them
- Check that the `data/` directory exists and is writable

## License

MIT

