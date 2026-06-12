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

const HTML_LIKE_PATTERN = /<\/?[a-z][^>]*>/i;

export function looksLikeHtml(value: string): boolean {
  return HTML_LIKE_PATTERN.test(value);
}

export function sanitizeRichHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
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
    ],
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
