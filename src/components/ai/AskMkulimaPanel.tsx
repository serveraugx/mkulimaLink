'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import MarkdownLite from '@/components/ui/MarkdownLite';

export interface ChatMessage {
  fromHuman: boolean;
  content: string;
}

interface Props {
  greeting: string;
  placeholder?: string;
  /** Called once on mount (and again if `historyKey` changes) to load past messages. */
  loadHistory: () => Promise<ChatMessage[]>;
  /** `historyKey` re-triggers loadHistory — e.g. when the buyer switches crop. */
  historyKey?: string;
  /** Sends the question, returns the assistant's answer. */
  ask: (question: string) => Promise<string>;
}

export default function AskMkulimaPanel({ greeting, placeholder, loadHistory, historyKey, ask }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ fromHuman: false, content: greeting }]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistoryLoaded(false);
    loadHistory()
      .then((past) => setMessages(past.length > 0 ? past : [{ fromHuman: false, content: greeting }]))
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question.trim();
    setMessages((m) => [...m, { fromHuman: true, content: q }]);
    setQuestion('');
    setLoading(true);
    try {
      const answer = await ask(q);
      setMessages((m) => [...m, { fromHuman: false, content: answer }]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { fromHuman: false, content: err.response?.data?.error ?? 'Samahani, hitilafu imetokea.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-700 bg-slate-800">
      <div className="flex items-center gap-2 border-b border-slate-700 p-4">
        <Sparkles size={18} className="text-green-400" />
        <h3 className="font-semibold text-white">Ask Mkulima</h3>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {!historyLoaded && <div className="text-sm text-slate-500">Inapakia mazungumzo…</div>}
        {historyLoaded &&
          messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                m.fromHuman ? 'ml-auto bg-green-600 text-white' : 'bg-slate-700 text-slate-100'
              }`}
            >
              {m.fromHuman ? m.content : <MarkdownLite text={m.content} className="space-y-1" />}
            </div>
          ))}
        {loading && <div className="text-sm text-slate-500">Mkulima anafikiri…</div>}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 border-t border-slate-700 p-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder ?? 'Andika swali lako...'}
          className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-500 disabled:opacity-60"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
