// server.js
import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPEN_API_KEY, // .env からAPIキーを読み込み
  })
);

app.post('/correct', async (req, res) => {
  const { text } = req.body;
  const prompt = `Please correct the following English writing and explain the corrections:\n\n"${text}"`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ correction: completion.data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Correction failed' });
  }
});

app.listen(5002, () => console.log('✅ GPT英語添削API起動中🚀 http://127.0.0.1:5002'));