import { Fragment } from 'react';

/**
 * Renders the light markdown the AI providers actually produce (bold via
 * **text**, and `*`/`-` bullet lines) without pulling in a full markdown
 * dependency — line breaks are preserved as separate paragraphs/list items.
 */
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
    )
  );
}

export default function MarkdownLite({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n').filter((l) => l.trim() !== '');

  return (
    <div className={className}>
      {lines.map((line, i) => {
        const bullet = line.match(/^\s*[*-]\s+(.*)$/);
        if (bullet) {
          return (
            <p key={i} className="pl-3">
              • {renderInline(bullet[1], String(i))}
            </p>
          );
        }
        return <p key={i}>{renderInline(line, String(i))}</p>;
      })}
    </div>
  );
}
