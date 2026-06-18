import { draftRawToBlocks, looksLikeHtml, sanitizeRichHtml } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type RichTextContentProps = {
  value: string;
  className?: string;
};

export function RichTextContent({ value, className }: RichTextContentProps) {
  const blocks = draftRawToBlocks(value);

  if (!blocks && looksLikeHtml(value)) {
    return (
      <div
        className={cn(
          className,
          "[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_img]:object-contain [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-md [&_iframe]:border"
        )}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(value) }}
      />
    );
  }

  if (!blocks) {
    return (
      <div className={className}>
        {value.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {blocks.map((block) => {
        if (!block.text.trim()) {
          return <div key={block.key} className="h-3" aria-hidden />;
        }

        if (block.type === "header-one") {
          return (
            <h2 key={block.key} className="text-2xl font-semibold tracking-tight">
              {block.text}
            </h2>
          );
        }

        if (block.type === "header-two") {
          return (
            <h3 key={block.key} className="text-xl font-semibold tracking-tight">
              {block.text}
            </h3>
          );
        }

        if (block.type === "unordered-list-item") {
          return (
            <p key={block.key} className="pl-3 before:mr-2 before:content-['•']">
              {block.text}
            </p>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote key={block.key} className="border-l-2 border-border pl-4 text-muted-foreground italic">
              {block.text}
            </blockquote>
          );
        }

        return <p key={block.key}>{block.text}</p>;
      })}
    </div>
  );
}
