import OpenAI from 'openai';
import { Recommendation, RecommendationsResponse, CardEmbedding } from '@/types';
import { embedQuery, findSimilarCards } from './embeddings';
import { cardToText } from './data';

/**
 * Lazy-loaded OpenAI client to ensure environment variables are loaded first
 */
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Please check your .env.local file.');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Use gpt-3.5-turbo for faster inference (can switch to gpt-4o-mini for better quality)
const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-3.5-turbo';
const TOP_N_CARDS = parseInt(process.env.TOP_N_CARDS || '12', 10); // Reduced from 20 for speed

/**
 * Formats candidate cards for the LLM context
 * Optimized for speed: more concise format
 */
function formatCardsForContext(cards: CardEmbedding[]): string {
  return cards
    .map((cardEmbedding) => {
      const card = cardEmbedding.card;
      const text = cardToText(card);
      return `${card.credit_card_name} | ${text} | URL: ${card.url_application}`;
    })
    .join('\n');
}

/**
 * Generates credit card recommendations using RAG
 */
export async function generateRecommendations(
  userQuery: string,
  topN: number = TOP_N_CARDS
): Promise<RecommendationsResponse> {
  try {
    // Step 1: Embed the user query
    console.log('Embedding user query...');
    const queryEmbedding = await embedQuery(userQuery);
    
    // Step 2: Find similar cards
    console.log(`Finding top ${topN} similar cards...`);
    const similarCards = await findSimilarCards(queryEmbedding, topN);
    
    if (similarCards.length === 0) {
      return {
        recommendations: [],
        rawModelAnswer: 'No matching cards found.',
      };
    }
    
    // Step 3: Format context for LLM
    const context = formatCardsForContext(similarCards);
    
    // Step 4: Call LLM with RAG context
    console.log('Calling LLM for recommendations...');
    // Shorter, more focused prompt for faster inference
    const systemPrompt = `Recommend 3-5 credit cards from the candidate list. Return JSON:
{
  "cards": [
    {
      "credit_card_name": "exact name from candidate",
      "apply_url": "exact URL from candidate",
      "reason": "2-3 sentence explanation"
    }
  ]
}`;

    const userPrompt = `Question: ${userQuery}

Candidates:
${context}

Return JSON with best matches.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for faster, more deterministic responses
      max_tokens: 500, // Limit response length for speed
      response_format: { type: 'json_object' },
    });
    
    const rawAnswer = completion.choices[0]?.message?.content || '';
    console.log('LLM response received');
    
    // Step 5: Parse LLM response
    try {
      const parsed = JSON.parse(rawAnswer);
      const recommendations: Recommendation[] = parsed.cards || [];
      
      // Validate and filter recommendations
      const validRecommendations = recommendations.filter(
        (rec: any) =>
          rec.credit_card_name &&
          rec.apply_url &&
          rec.reason &&
          similarCards.some(
            card => card.card.credit_card_name === rec.credit_card_name
          )
      );
      
      return {
        recommendations: validRecommendations,
        rawModelAnswer: rawAnswer,
      };
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      // Try to extract recommendations from text if JSON parsing fails
      return {
        recommendations: [],
        rawModelAnswer: rawAnswer,
      };
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

