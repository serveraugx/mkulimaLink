'use client';

import api from '@/lib/api';
import AskMkulimaPanel, { type ChatMessage } from '@/components/ai/AskMkulimaPanel';
import type { CropType } from '@/types/farm';

export default function BuyerAIChatPanel({ crop }: { crop: CropType }) {
  return (
    <AskMkulimaPanel
      greeting='Habari! Niulize kuhusu bei za soko au wakulima wanaouza — mfano: "Soko gani lina bei nzuri zaidi?"'
      placeholder="Uliza kuhusu bei za soko..."
      historyKey={crop}
      loadHistory={async () => {
        const res = await api.get(`/buyer/ai/messages?crop=${crop}`);
        return res.data.data.map(
          (m: { role: string; content: string }): ChatMessage => ({
            fromHuman: m.role === 'BUYER',
            content: m.content,
          })
        );
      }}
      ask={async (question) => {
        const res = await api.post('/buyer/ai/ask', { crop, question }, { timeout: 45_000 });
        return res.data.data.answer;
      }}
    />
  );
}
