import sanitizeHtml from "sanitize-html";
import { withBasePath } from "@/lib/base-path";

export type DraftRawInlineStyleRange = {
  offset: number;
  length: number;
  style: string;
};

export type DraftRawEntityRange = {
  offset: number;
  length: number;
  key: number;
};

export type DraftRawBlock = {
  key: string;
  text: string;
  type: string;
  depth: number;
  inlineStyleRanges: DraftRawInlineStyleRange[];
  entityRanges: DraftRawEntityRange[];
  data: Record<string, unknown>;
};

export type DraftRawContent = {
  blocks: DraftRawBlock[];
  entityMap: Record<string, unknown>;
};

export type RichTextImage = {
  src: string;
  alt: string;
};

export function parseDraftRawContent(value: string): DraftRawContent | null {
  if (!value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as DraftRawContent;

    if (!Array.isArray(parsed.blocks) || typeof parsed.entityMap !== "object" || parsed.entityMap === null) {
      return null;
    }

    for (const block of parsed.blocks) {
      if (!block || typeof block !== "object") {
        return null;
      }

      if (typeof block.key !== "string" || typeof block.text !== "string" || typeof block.type !== "string") {
        return null;
      }

      if (!Array.isArray(block.inlineStyleRanges) || !Array.isArray(block.entityRanges)) {
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export function toDraftRawStorageValue(value: string): string {
  const parsed = parseDraftRawContent(value);
  if (!parsed) {
    return value;
  }

  return JSON.stringify(parsed);
}

export function draftRawToBlocks(value: string): DraftRawBlock[] | null {
  const parsed = parseDraftRawContent(value);
  if (!parsed) {
    return null;
  }

  return parsed.blocks;
}

export function draftRawToPlainText(value: string): string | null {
  const blocks = draftRawToBlocks(value);
  if (!blocks) {
    return null;
  }

  return blocks
    .map((block) => block.text)
    .join("\n")
    .trim();
}

const EXTRA_ALLOWED_RICH_HTML_TAGS = [
  "img",
  "iframe",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "figure",
  "figcaption",
  "span",
];

const ALLOWED_RICH_HTML_TAGS = Array.from(
  new Set([...sanitizeHtml.defaults.allowedTags, ...EXTRA_ALLOWED_RICH_HTML_TAGS])
);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const RICH_HTML_TAG_PATTERN = ALLOWED_RICH_HTML_TAGS.map(escapeRegex).join("|");

const HTML_LIKE_PATTERN = new RegExp(`<\\/?(?:${RICH_HTML_TAG_PATTERN})(?:\\s[^>]*)?>`, "i");
const UNSAFE_LT_PATTERN = new RegExp(
  `<(?!(?:/?(?:${RICH_HTML_TAG_PATTERN})(?:\\s|>|/))|!--)`,
  "gi"
);

export function looksLikeHtml(value: string): boolean {
  return HTML_LIKE_PATTERN.test(value);
}

export function sanitizeRichHtml(value: string): string {
  // Never render executable scripts from user-authored rich text.
  const withoutScripts = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/?>/gi, "");

  const escapedValue = withoutScripts.replace(UNSAFE_LT_PATTERN, "&lt;");

  return sanitizeHtml(escapedValue, {
    allowedTags: ALLOWED_RICH_HTML_TAGS,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading", "decoding"],
      iframe: [
        "src",
        "title",
        "width",
        "height",
        "loading",
        "allow",
        "allowfullscreen",
        "referrerpolicy",
        "sandbox",
      ],
    },
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          src: attribs.src ? withBasePath(attribs.src) : attribs.src,
        },
      }),
    },
  });
}

export function richTextToPlainText(value: string): string {
  const draftText = draftRawToPlainText(value);
  if (draftText !== null) {
    return draftText.replace(/\s+/g, " ").trim();
  }

  if (looksLikeHtml(value)) {
    const htmlWithoutTags = sanitizeRichHtml(value).replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ");
    return htmlWithoutTags.replace(/\s+/g, " ").trim();
  }

  return value.replace(/\s+/g, " ").trim();
}

function getAttributeValue(tag: string, attribute: string): string | null {
  const match = tag.match(new RegExp(`${attribute}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  if (!match) {
    return null;
  }

  return (match[2] ?? match[3] ?? match[4] ?? "").trim() || null;
}

function extractFirstImageFromDraftRaw(value: string): RichTextImage | null {
  const parsed = parseDraftRawContent(value);
  if (!parsed) {
    return null;
  }

  for (const block of parsed.blocks) {
    for (const range of block.entityRanges) {
      const entity = parsed.entityMap[String(range.key)];
      if (!entity || typeof entity !== "object") {
        continue;
      }

      const candidate = entity as {
        type?: unknown;
        data?: unknown;
      };

      const type = typeof candidate.type === "string" ? candidate.type.toUpperCase() : "";
      if (!type.includes("IMAGE")) {
        continue;
      }

      const data =
        candidate.data && typeof candidate.data === "object"
          ? (candidate.data as Record<string, unknown>)
          : null;

      const srcCandidate = data?.src ?? data?.url ?? data?.imageSrc;
      const altCandidate = data?.alt ?? data?.title;

      if (typeof srcCandidate === "string" && srcCandidate.trim()) {
        return {
          src: srcCandidate.trim(),
          alt: typeof altCandidate === "string" ? altCandidate.trim() : "",
        };
      }
    }
  }

  return null;
}

function extractFirstImageFromHtml(value: string): RichTextImage | null {
  if (!looksLikeHtml(value)) {
    return null;
  }

  const sanitized = sanitizeRichHtml(value);
  const imgTag = sanitized.match(/<img\b[^>]*>/i)?.[0];
  if (!imgTag) {
    return null;
  }

  const src = getAttributeValue(imgTag, "src");
  if (!src) {
    return null;
  }

  return {
    src,
    alt: getAttributeValue(imgTag, "alt") ?? "",
  };
}

export function richTextFirstImage(value: string): RichTextImage | null {
  const draftRawImage = extractFirstImageFromDraftRaw(value);
  if (draftRawImage) {
    return draftRawImage;
  }

  return extractFirstImageFromHtml(value);
}

export function truncateWords(value: string, maxWords: number): string {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return words.join(" ");
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}
