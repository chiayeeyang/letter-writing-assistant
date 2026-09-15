import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { PEER_MENTOR_SYSTEM_INSTRUCTION } from '../prompt.ts';

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { prompt, history } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your Vercel Environment Variables.',
      });
    }

    const ai = getGeminiClient();

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        if (msg.role && msg.content) {
          contents.push({
            role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const CANDIDATE_MODELS = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ];

    let response: any = null;
    let lastError: any = null;
    let successfulModel = '';

    // Cascade through candidate models to absorb 429 quota exhaustion or 503 temporary spikes
    for (const model of CANDIDATE_MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: PEER_MENTOR_SYSTEM_INSTRUCTION,
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          });
          if (response?.text) {
            successfulModel = model;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const isRateOrQuota =
            err?.status === 429 ||
            err?.status === 503 ||
            err?.message?.includes('429') ||
            err?.message?.includes('503') ||
            err?.message?.includes('RESOURCE_EXHAUSTED') ||
            err?.message?.includes('quota');

          if (isRateOrQuota) {
            break;
          }
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 800));
            continue;
          }
        }
      }
      if (response?.text) break;
    }

    if (!response?.text) {
      throw lastError || new Error('Unable to generate response from Gemini API.');
    }

    return res.status(200).json({ text: response.text, model: successfulModel });
  } catch (error: any) {
    console.error('Gemini generation error on Vercel:', error);

    let userFriendlyMsg = error?.message || 'An error occurred during letter generation.';
    if (
      userFriendlyMsg.includes('429') ||
      userFriendlyMsg.includes('RESOURCE_EXHAUSTED') ||
      userFriendlyMsg.includes('quota')
    ) {
      userFriendlyMsg = 'The AI service has temporarily reached its rate limit. Please wait a few moments and retry.';
    } else if (userFriendlyMsg.includes('503')) {
      userFriendlyMsg = 'The AI service is experiencing high temporary demand. Please retry in a few moments.';
    }

    return res.status(500).json({
      error: userFriendlyMsg,
    });
  }
}
