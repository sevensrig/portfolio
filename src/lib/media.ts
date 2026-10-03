// Media files live in the R2 bucket, referenced as "r2:<path>".
// PUBLIC_MEDIA_BASE is the bucket's public URL (set in .env and in Vercel).

export function mediaUrl(src: string): string | undefined {
  if (!src.startsWith("r2:")) return src
  const base = import.meta.env.PUBLIC_MEDIA_BASE
  if (!base) {
    // On Vercel a missing base would silently turn every video into its
    // poster, so fail the build with a clear message instead. Locally, fall
    // back to the poster so the site still runs without a .env.
    if (process.env.VERCEL) {
      throw new Error(
        "PUBLIC_MEDIA_BASE is not set for this Vercel build. Add it under Project → Settings → Environment Variables (Production), then redeploy.",
      )
    }
    return undefined
  }
  return `${base.replace(/\/$/, "")}/${src.slice(3)}`
}
