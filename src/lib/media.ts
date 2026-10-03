// Videos live on Cloudflare R2, referenced in frontmatter as "r2:<path>".
// PUBLIC_MEDIA_BASE is the bucket's public URL (set in .env and in Vercel).

export function mediaUrl(src: string): string | undefined {
  if (!src.startsWith("r2:")) return src
  const base = import.meta.env.PUBLIC_MEDIA_BASE
  return base ? `${base.replace(/\/$/, "")}/${src.slice(3)}` : undefined
}
