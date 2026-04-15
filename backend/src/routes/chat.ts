import { Router } from 'express';
import { z } from 'zod';
import { ok, fail } from '../lib/responses.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
});

function getGroqKey(): string {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) throw new Error('GROQ_API_KEY is not set');
  return key;
}

function getGroqModel(): string {
  return (process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant');
}

router.post('/', validateBody(chatSchema), async (req, res, next) => {
  try {
    const { messages } = req.body as z.infer<typeof chatSchema>;

    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getGroqKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: getGroqModel(),
        messages,
        temperature: 0.7,
        max_tokens: 300,
        stream: false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return res.status(502).json(
        fail('Groq request failed', {
          code: 'GROQ_ERROR',
          details: { status: resp.status, body: text.slice(0, 500) },
        }),
      );
    }

    const data = (await resp.json()) as any;
    const reply: string | undefined = data?.choices?.[0]?.message?.content;
    if (!reply) return res.status(502).json(fail('Groq returned no reply', { code: 'GROQ_EMPTY' }));

    return res.json(ok({ reply }));
  } catch (err) {
    return next(err);
  }
});

export default router;

