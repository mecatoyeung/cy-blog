function normalizeBasePath(value: string): string {
  if (!value) {
    return "";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

export function getBasePath(): string {
  return normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
}

export function withBasePath(url: string): string {
  if (!url || !url.startsWith("/") || url.startsWith("//")) {
    return url;
  }

  const basePath = getBasePath();
  if (!basePath || url === basePath || url.startsWith(`${basePath}/`)) {
    return url;
  }

  return `${basePath}${url}`;
}