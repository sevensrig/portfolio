// Prepares and uploads project media to the S3-compatible media bucket.
//
//   npm run media -- <file> <project-slug> [name] [--keep-audio] [--poster-at=SECONDS] [--to=SECONDS]
//
// Videos (.mov .mp4 .m4v .webm .mkv) are compressed with ffmpeg to MP4 (H.264)
// and WebM (VP9), at most 1280 px on the long side, audio stripped unless --keep-audio. A poster
// frame (1 s in, or --poster-at) is saved next to the project's index.mdx so
// Astro can optimize it.
// Images are uploaded as they are. Settings come from .env (see .env.example).
import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, existsSync } from "node:fs"
import { basename, extname, join } from "node:path"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const args = process.argv.slice(2)
const keepAudio = args.includes("--keep-audio")
const trimTo = args.find((a) => a.startsWith("--to="))?.split("=")[1]
const posterAt = args.find((a) => a.startsWith("--poster-at="))?.split("=")[1] ?? "1"
const [file, slug, nameArg] = args.filter((a) => !a.startsWith("--"))
if (!file || !slug) {
  console.error("Usage: npm run media -- <file> <project-slug> [name] [--keep-audio] [--poster-at=SECONDS] [--to=SECONDS]")
  process.exit(1)
}
if (!existsSync(file)) throw new Error(`No such file: ${file}`)
const projectDir = join("src/content/projects", slug)
if (!existsSync(projectDir)) throw new Error(`No project folder: ${projectDir}`)

const env = (key) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key} in .env (see .env.example)`)
  return value
}
const s3 = new S3Client({
  endpoint: env("MEDIA_S3_ENDPOINT"),
  region: process.env.MEDIA_S3_REGION || "auto",
  credentials: { accessKeyId: env("MEDIA_S3_ACCESS_KEY_ID"), secretAccessKey: env("MEDIA_S3_SECRET_ACCESS_KEY") },
})
const bucket = env("MEDIA_S3_BUCKET")

const ext = extname(file).toLowerCase()
const name = (nameArg ?? basename(file, ext)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const TYPES = { ".mp4": "video/mp4", ".webm": "video/webm", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif" }

async function upload(path, key) {
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: readFileSync(path),
    ContentType: TYPES[extname(path).toLowerCase()] ?? "application/octet-stream",
    // File names never change once published, so browsers and the CDN can cache forever.
    CacheControl: "public, max-age=31536000, immutable",
  }))
  console.log(`  uploaded ${key}`)
}

const ffmpeg = (...a) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" })

if ([".mov", ".mp4", ".m4v", ".webm", ".mkv"].includes(ext)) {
  const out = join(".media", slug)
  mkdirSync(out, { recursive: true })
  // Fit inside 1280×1280 without upscaling, so portrait clips shrink too.
  const scale = ["-vf", "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2"]
  const audio = keepAudio ? [] : ["-an"]
  const trim = trimTo ? ["-to", trimTo] : [] // cut the clip off at this time
  console.log(`Compressing ${file} …`)
  ffmpeg("-i", file, ...trim, ...scale, "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", ...audio, join(out, `${name}.mp4`))
  ffmpeg("-i", file, ...trim, ...scale, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", ...audio, join(out, `${name}.webm`))
  ffmpeg("-ss", posterAt, "-i", file, "-frames:v", "1", "-q:v", "3", ...scale, join(projectDir, `${name}-poster.jpg`))
  await upload(join(out, `${name}.webm`), `${slug}/${name}.webm`)
  await upload(join(out, `${name}.mp4`), `${slug}/${name}.mp4`)
  console.log(`\nPoster saved: ${join(projectDir, `${name}-poster.jpg`)}`)
  console.log(`In index.mdx:\n  import ${name.replace(/-(.)/g, (_, c) => c.toUpperCase())}Poster from "./${name}-poster.jpg"`)
  console.log(`  <Video src="r2:${slug}/${name}" poster={…Poster} caption="…" />`)
  console.log(`Or as the looping cover, in frontmatter:\n  media:\n    loop: { src: "r2:${slug}/${name}", poster: ./${name}-poster.jpg }`)
} else if (TYPES[ext]) {
  await upload(file, `${slug}/${name}${ext}`)
  console.log(`\nURL: ${process.env.PUBLIC_MEDIA_BASE ?? "<PUBLIC_MEDIA_BASE>"}/${slug}/${name}${ext}`)
} else {
  throw new Error(`Unsupported file type: ${ext}`)
}
