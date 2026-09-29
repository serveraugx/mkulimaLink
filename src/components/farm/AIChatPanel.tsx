'use client';

import api from '@/lib/api';
import AskMkulimaPanel, { type ChatMessage } from '@/components/ai/AskMkulimaPanel';

export default function AIChatPanel({ farmId }: { farmId: string }) {
  return (
    <AskMkulimaPanel
      greeting='Habari! Niulize chochote kuhusu shamba lako — mfano: "Nifanye nini leo?"'
      historyKey={farmId}
      loadHistory={async () => {
        const res = await api.get(`/farms/${farmId}/messages`);
        return res.data.data.map(
          (m: { role: string; content: string }): ChatMessage => ({
            fromHuman: m.role === 'FARMER',
            content: m.content,
          })
        );
      }}
      ask={async (question) => {
        // Worst case the server tries Gemini, then Groq, then a local LLM in
        // sequence before giving up (~38s) — the default 10s client timeout
        // would abort well before that.
        const res = await api.post('/ai/ask', { farmId, question }, { timeout: 45_000 });
        return res.data.data.answer;
      }}
    />
  );
}
