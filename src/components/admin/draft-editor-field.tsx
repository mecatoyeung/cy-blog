"use client";

import "draft-js/dist/Draft.css";

import {
  CharacterMetadata,
  ContentState,
  Editor,
  EditorState,
  type RawDraftContentState,
  RichUtils,
  convertFromHTML,
  convertFromRaw,
  convertToRaw,
} from "draft-js";
import { useMemo, useState } from "react";

import { looksLikeHtml } from "@/lib/rich-text";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DraftEditorFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function tryParseRaw(value: string): RawDraftContentState | null {
  if (!value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const candidate = parsed as {
      blocks?: unknown;
      entityMap?: unknown;
    };

    if (!Array.isArray(candidate.blocks) || typeof candidate.entityMap !== "object" || candidate.entityMap === null) {
      return null;
    }

    return candidate as RawDraftContentState;
  } catch {
    return null;
  }
}

function buildEditorState(value: string) {
  const parsed = tryParseRaw(value);

  if (parsed) {
    try {
      return EditorState.createWithContent(convertFromRaw(parsed));
    } catch {
      // Fallback to plain text when raw content is structurally invalid.
    }
  }

  if (looksLikeHtml(value)) {
    return htmlToEditorState(value);
  }

  return EditorState.createWithContent(ContentState.createFromText(value));
}

function containsImageTag(value: string): boolean {
  return /<img\b/i.test(value);
}

const INLINE_TAGS: Record<string, string> = {
  BOLD: "strong",
  ITALIC: "em",
  UNDERLINE: "u",
  CODE: "code",
};

const INLINE_STYLE_ORDER = ["BOLD", "ITALIC", "UNDERLINE", "CODE"];

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTextWithInlineStyles(text: string, characters: CharacterMetadata[]): string {
  if (!text) {
    return "";
  }

  const starts = new Map<number, string[]>();
  const ends = new Map<number, string[]>();

  const pushAt = (map: Map<number, string[]>, index: number, style: string) => {
    const existing = map.get(index) ?? [];
    existing.push(style);
    map.set(index, existing);
  };

  for (const style of INLINE_STYLE_ORDER) {
    const tag = INLINE_TAGS[style];
    if (!tag) {
      continue;
    }

    let activeStart = -1;

    for (let index = 0; index < characters.length; index += 1) {
      const hasStyle = characters[index]?.getStyle().has(style) ?? false;

      if (hasStyle && activeStart === -1) {
        activeStart = index;
      }

      if (!hasStyle && activeStart !== -1) {
        pushAt(starts, activeStart, style);
        pushAt(ends, index, style);
        activeStart = -1;
      }
    }

    if (activeStart !== -1) {
      pushAt(starts, activeStart, style);
      pushAt(ends, characters.length, style);
    }
  }

  let html = "";

  for (let index = 0; index < text.length; index += 1) {
    const endingStyles = ends.get(index) ?? [];
    for (const style of [...endingStyles].reverse()) {
      html += `</${INLINE_TAGS[style]}>`;
    }

    const startingStyles = starts.get(index) ?? [];
    for (const style of startingStyles) {
      html += `<${INLINE_TAGS[style]}>`;
    }

    html += escapeHtml(text[index]);
  }

  const endingStyles = ends.get(text.length) ?? [];
  for (const style of [...endingStyles].reverse()) {
    html += `</${INLINE_TAGS[style]}>`;
  }

  return html;
}

function contentStateToHtml(contentState: ContentState): string {
  const blocks = contentState.getBlocksAsArray();

  const lines: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      lines.push("</ul>");
      inList = false;
    }
  };

  for (const block of blocks) {
    const text = renderTextWithInlineStyles(block.getText(), block.getCharacterList().toArray());
    const trimmedText = text.trim();

    if (block.getType() === "unordered-list-item") {
      if (!inList) {
        lines.push("<ul>");
        inList = true;
      }

      lines.push(`<li>${trimmedText || "<br />"}</li>`);
      continue;
    }

    closeList();

    if (!trimmedText) {
      lines.push("<p><br /></p>");
      continue;
    }

    if (block.getType() === "header-one") {
      lines.push(`<h2>${trimmedText}</h2>`);
      continue;
    }

    if (block.getType() === "header-two") {
      lines.push(`<h3>${trimmedText}</h3>`);
      continue;
    }

    if (block.getType() === "blockquote") {
      lines.push(`<blockquote>${trimmedText}</blockquote>`);
      continue;
    }

    lines.push(`<p>${trimmedText}</p>`);
  }

  closeList();

  return lines.join("\n");
}

function htmlToEditorState(html: string): EditorState {
  const normalizedHtml = html.trim() ? html : "<p></p>";
  const parsed = convertFromHTML(normalizedHtml);

  if (!parsed.contentBlocks || parsed.contentBlocks.length === 0) {
    return EditorState.createWithContent(ContentState.createFromText(""));
  }

  return EditorState.createWithContent(
    ContentState.createFromBlockArray(parsed.contentBlocks, parsed.entityMap)
  );
}

export function DraftEditorField({ id, label, value, onChange }: DraftEditorFieldProps) {
  const startsInHtmlMode = useMemo(() => !tryParseRaw(value) && looksLikeHtml(value), [value]);
  const initialState = useMemo(() => buildEditorState(value), [value]);
  const [editorState, setEditorState] = useState(initialState);
  const [mode, setMode] = useState<"visual" | "html">(startsInHtmlMode ? "html" : "visual");
  const [htmlDraft, setHtmlDraft] = useState(
    startsInHtmlMode
      ? value
      : contentStateToHtml(initialState.getCurrentContent())
  );
  const [error, setError] = useState<string | null>(null);

  const updateVisual = (nextState: EditorState) => {
    setEditorState(nextState);
    const serialized = JSON.stringify(convertToRaw(nextState.getCurrentContent()));
    setHtmlDraft(contentStateToHtml(nextState.getCurrentContent()));
    onChange(serialized);
    setError(null);
  };

  const toggleMode = (nextMode: "visual" | "html") => {
    if (nextMode === mode) {
      return;
    }

    if (nextMode === "visual") {
      if (containsImageTag(htmlDraft)) {
        setError("Visual mode does not support <img> tags. Keep editing in HTML mode to preserve images.");
        return;
      }

      try {
        const nextState = htmlToEditorState(htmlDraft);
        setEditorState(nextState);
        onChange(JSON.stringify(convertToRaw(nextState.getCurrentContent())));
        setError(null);
      } catch {
        setError("HTML source could not be converted into an editor state.");
        return;
      }
    } else {
      setHtmlDraft(contentStateToHtml(editorState.getCurrentContent()));
    }

    setMode(nextMode);
  };

  const handleHtmlChange = (nextHtml: string) => {
    setHtmlDraft(nextHtml);
    onChange(nextHtml);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant={mode === "visual" ? "default" : "secondary"} onClick={() => toggleMode("visual")}>Visual</Button>
          <Button type="button" size="sm" variant={mode === "html" ? "default" : "secondary"} onClick={() => toggleMode("html")}>HTML</Button>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="rounded-md border bg-background px-3 py-2">
          <div className="mb-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => updateVisual(RichUtils.toggleInlineStyle(editorState, "BOLD"))}>Bold</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => updateVisual(RichUtils.toggleInlineStyle(editorState, "ITALIC"))}>Italic</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => updateVisual(RichUtils.toggleBlockType(editorState, "unordered-list-item"))}>Bullets</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => updateVisual(RichUtils.toggleBlockType(editorState, "header-two"))}>H2</Button>
          </div>
          <div
            id={id}
            className={cn(
              "min-h-28 cursor-text rounded border border-dashed border-border px-3 py-2",
              "[&_.public-DraftEditor-content]:min-h-20"
            )}
          >
            <Editor
              editorKey={`${id}-editor`}
              editorState={editorState}
              onChange={updateVisual}
              placeholder="Write your content..."
            />
          </div>
        </div>
      ) : (
        <Textarea
          id={id}
          value={htmlDraft}
          onChange={(event) => handleHtmlChange(event.target.value)}
          className="min-h-56 font-mono text-xs"
          spellCheck={false}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
