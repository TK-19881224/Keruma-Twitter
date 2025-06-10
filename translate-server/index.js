import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/translate', async (req, res) => {
  const { q, source = 'auto', target = 'en', format = 'text' } = req.body;

  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, source, target, format }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '翻訳APIエラー');

    res.json({ translatedText: data.translatedText });
  } catch (err) {
    console.error('翻訳失敗:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ 翻訳サーバー起動中: http://localhost:${PORT}`);
});