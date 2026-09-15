import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { PEER_MENTOR_SYSTEM_INSTRUCTION } from './prompt.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized or standard initialized Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';

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

// Health & Status check endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    model: 'gemini-3.6-flash',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    role: 'Peer Career Advisor / Mentor',
  });
});

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];

// Peer Career Advisor letter generation endpoint
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment variables.',
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

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

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
            // Model quota or capacity reached, break to next model in cascade
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

    const outputText = response.text;
    return res.json({ text: outputText, model: successfulModel });
  } catch (error: any) {
    console.error('Gemini generation error:', error);

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
});

// Vite middleware & production static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
