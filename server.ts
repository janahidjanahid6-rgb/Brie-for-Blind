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
      model: 'gemini-2.5-flash',
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
