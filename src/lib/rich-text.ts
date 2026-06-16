import sanitizeHtml from "sanitize-html";

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
  const escapedValue = value.replace(UNSAFE_LT_PATTERN, "&lt;");

  return sanitizeHtml(escapedValue, {
    allowedTags: ALLOWED_RICH_HTML_TAGS,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading", "decoding"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  });
}
