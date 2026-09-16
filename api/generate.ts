import { PEER_MENTOR_SYSTEM_INSTRUCTION } from './prompt';

type GeminiClient = import('@google/genai').GoogleGenAI;

function getApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    ''
  );
}

let aiClient: GeminiClient | null = null;
async function getGeminiClient(): Promise<GeminiClient> {
  if (!aiClient) {
    const { GoogleGenAI } = await import('@google/genai');
    const key = getApiKey();
    aiClient = new GoogleGenAI({
      apiKey: key,
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
  // Ensure response always has JSON content-type header
  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // use raw body
      }
    }

    const { prompt, history } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const currentKey = getApiKey();
    if (!currentKey) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your Vercel Project Settings > Environment Variables, then redeploy.',
      });
    }

    const ai = await getGeminiClient();

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

    const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

    let response: any = null;
    let lastError: any = null;
    let successfulModel = '';

    // Cascade through candidate models to absorb rate limits or model version availability differences
    for (const model of CANDIDATE_MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: PEER_MENTOR_SYSTEM_INSTRUCTION,
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
            await new Promise((r) => setTimeout(r, 600));
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
    } else if (userFriendlyMsg.includes('API_KEY_INVALID') || userFriendlyMsg.includes('401') || userFriendlyMsg.includes('403')) {
      userFriendlyMsg = 'Invalid or unauthorized GEMINI_API_KEY. Please check that your key in environment variables is valid.';
    }

    return res.status(500).json({
      error: userFriendlyMsg,
    });
  }
}
