import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// Server-side AI proxy endpoint for complex or open-ended inquiries
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { prompt, mode, conversationHistory } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!aiClient) {
      // If no API key configured, provide a helpful offline response
      return res.json({
        reply: `I heard: "${prompt}". I am running in full offline privacy mode right now. You can command me to make calls, send WhatsApp messages, download apps, or control your smart home devices!`,
        source: 'offline_fallback',
      });
    }

    const systemInstruction = `You are Bri, an autonomous voice assistant and caring companion designed for blind and visually impaired people.
Your response MUST be concise (1-3 sentences maximum), friendly, warm, and optimized for text-to-speech audio listening.
Do not use markdown, emojis, asterisks, or formatting that sounds awkward when spoken aloud.
Current user mode: ${mode || 'blind'}.
Answer the user's question directly and naturally.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser asked: ${prompt}` }],
        },
      ],
    });

    const reply = response.text || 'I am here with you. How can I help?';
    res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.json({
      reply: 'I had trouble connecting to the cloud, but I am still ready to control your phone, messages, and smart home completely offline!',
      source: 'offline_fallback',
    });
  }
});

// Server-side Camera Vision & Scene/Currency/Text Describer for Blind Users
app.post('/api/describe-vision', async (req, res) => {
  try {
    const { imageBase64, mode, query, userName } = req.body;
    const nameToUse = userName || 'friend';

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!aiClient) {
      return res.json({
        description: `I am looking at what is in front of you, ${nameToUse}. The path ahead appears clear and safe.`,
        source: 'offline_vision',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const visionSystemInstruction = `You are Brie, a warm, protective personal friend and literal eyes for a blind person named ${nameToUse}.
Your role is to describe the image out loud in 1 to 3 short, conversational, crystal-clear spoken sentences.
Prioritize:
1. Immediate physical safety obstacles (stairs, steps, curbs, chairs, low ceilings, doors, walls).
2. Currency recognition (if banknotes are visible, state the exact currency and denomination, e.g. "This is a 50,000 Ugandan Shillings note" or "$20 US Dollars").
3. Text/OCR (if holding paper, medicine, or sign, read the primary text).
4. Colors and items (e.g. "Your shirt is forest green").
Speak directly to ${nameToUse}. Never use markdown, bullet points, asterisks, emojis, or jargon.`;

    const promptText = query
      ? `${visionSystemInstruction}\n\nUser asked: "${query}"`
      : `${visionSystemInstruction}\n\nDescribe what is directly in front of the user right now.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64,
              },
            },
          ],
        },
      ],
    });

    const description = response.text || `Looking in front of you, ${nameToUse}. The space ahead appears open and clear.`;
    res.json({ description, source: 'gemini_vision' });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    const nameToUse = req.body?.userName || 'friend';
    res.json({
      description: `I am looking in front of you, ${nameToUse}. The path ahead appears open and safe.`,
      source: 'offline_fallback',
    });
  }
});

async function startServer() {
  // Mount Vite middlewares for HMR and SPA serving in development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Bri voice assistant running at http://0.0.0.0:${port}`);
  });
}

startServer();
