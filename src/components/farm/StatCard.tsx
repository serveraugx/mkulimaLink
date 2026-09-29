import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'good' | 'warning' | 'danger';
}

const TONE_CLASSES: Record<NonNullable<Props['tone']>, string> = {
  default: 'text-white',
  good: 'text-green-400',
  warning: 'text-yellow-400',
  danger: 'text-red-400',
};

export default function StatCard({ icon: Icon, label, value, sub, tone = 'default' }: Props) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        <Icon size={16} />
        <span className="text-sm">{label}</span>
      </div>
      <p className={clsx('text-2xl font-bold', TONE_CLASSES[tone])}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
