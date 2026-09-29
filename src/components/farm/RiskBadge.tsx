import { clsx } from 'clsx';

const STYLES: Record<string, string> = {
  low: 'bg-green-500/15 text-green-400 border-green-500/30',
  good: 'bg-green-500/15 text-green-400 border-green-500/30',
  favorable: 'bg-green-500/15 text-green-400 border-green-500/30',
  normal: 'bg-green-500/15 text-green-400 border-green-500/30',

  moderate: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  attention_required: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  below_normal: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  above_normal: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',

  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
  drought: 'bg-red-500/15 text-red-400 border-red-500/30',
  excessive: 'bg-red-500/15 text-red-400 border-red-500/30',
  unfavorable: 'bg-red-500/15 text-red-400 border-red-500/30',

  unknown: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function RiskBadge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        STYLES[value] ?? STYLES.unknown
      )}
    >
      {(label ?? value).replace(/_/g, ' ')}
    </span>
  );
}
