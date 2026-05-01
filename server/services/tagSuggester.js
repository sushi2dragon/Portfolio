const ALLOWED_TAGS = [
  'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C', 'C++', 'C#',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Elixir', 'Haskell', 'Scala', 'R', 'Lua',
  'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact', 'Alpine.js', 'Lit', 'Qwik',
  'Next.js', 'Nuxt', 'Remix', 'Astro', 'SvelteKit', 'Gatsby',
  'Vite', 'Webpack', 'Turbopack', 'Rollup', 'esbuild', 'Parcel',
  'TailwindCSS', 'CSS', 'SCSS', 'Sass', 'Bootstrap', 'Material UI', 'shadcn/ui',
  'Chakra UI', 'Radix UI', 'Framer Motion', 'GSAP', 'Styled Components', 'Emotion',
  'Node.js', 'Express', 'Fastify', 'Hono', 'NestJS', 'Koa',
  'FastAPI', 'Django', 'Flask', 'SQLAlchemy',
  'Rails', 'Laravel', 'Symfony', 'Spring Boot', 'Gin', 'Fiber',
  'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis', 'DynamoDB',
  'CockroachDB', 'PlanetScale', 'Turso', 'Cassandra', 'InfluxDB',
  'Prisma', 'Drizzle', 'TypeORM', 'Sequelize', 'Mongoose', 'Knex',
  'Supabase', 'Firebase', 'Appwrite', 'Convex', 'Pocketbase',
  'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify', 'Railway', 'Fly.io', 'Render', 'Heroku',
  'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'GitLab CI', 'CI/CD', 'Ansible',
  'REST', 'GraphQL', 'tRPC', 'gRPC', 'WebSocket', 'Socket.io', 'OpenAPI', 'WebRTC',
  'Auth0', 'Clerk', 'NextAuth', 'Lucia', 'JWT', 'OAuth',
  'Stripe', 'Twilio', 'SendGrid', 'Resend', 'Cloudinary', 'Uploadthing',
  'OpenAI API', 'Anthropic API',
  'Three.js', 'WebGL', 'D3.js', 'Chart.js', 'Recharts', 'Observable',
  'React Native', 'Expo', 'Flutter', 'Electron', 'Tauri',
  'Jest', 'Vitest', 'Playwright', 'Cypress', 'Testing Library', 'Storybook',
  'PWA', 'WebAssembly', 'IndexedDB', 'MDX', 'Markdown',
  'API', 'CLI', 'Git', 'Monorepo', 'Microservices', 'Serverless', 'Edge Functions',
]

const ALLOWED_TAG_LOOKUP = new Map(
  ALLOWED_TAGS.map((tag) => [normalizeTag(tag), tag])
)

const MANIFEST_FILES = new Set([
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'turbo.json',
  'tsconfig.json',
  'vite.config.js',
  'vite.config.ts',
  'next.config.js',
  'next.config.mjs',
  'nuxt.config.ts',
  'astro.config.mjs',
  'remix.config.js',
  'requirements.txt',
  'pyproject.toml',
  'poetry.lock',
  'pipfile',
  'pipfile.lock',
  'dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'go.mod',
  'go.sum',
  'cargo.toml',
  'cargo.lock',
  'composer.json',
  'pom.xml',
  'build.gradle',
  'gradle.properties',
  '.github/workflows/ci.yml',
  '.github/workflows/deploy.yml',
  '.github/workflows/release.yml',
])

const SOURCE_PREFIXES = ['src/', 'app/', 'client/', 'server/', 'api/', 'lib/', 'packages/']
const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.java', '.kt', '.php', '.rb', '.cs',
  '.swift', '.scala', '.lua', '.sql', '.css', '.scss', '.sass',
  '.html', '.mdx',
])
const IGNORED_SEGMENTS = [
  'node_modules/', 'dist/', 'build/', '.next/', '.nuxt/', '.svelte-kit/',
  'coverage/', 'vendor/', 'generated/', '.git/', 'uploads/', 'public/assets/',
]
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.pdf',
  '.zip', '.gz', '.tar', '.7z', '.mp4', '.mov', '.mp3', '.wav', '.ogg',
  '.woff', '.woff2', '.ttf', '.eot', '.exe', '.dll', '.so', '.dylib',
])

const MAX_FILES = 18
const MAX_TOTAL_CHARS = 36000
const MAX_FILE_CHARS = 4500
const HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct'

class SuggestionError extends Error {
  constructor(status, message, warnings = []) {
    super(message)
    this.status = status
    this.warnings = warnings
  }
}

function normalizeTag(value) {
  return String(value || '').trim().toLowerCase()
}

function dedupeTags(tags) {
  const seen = new Set()
  const result = []
  for (const tag of tags) {
    const normalized = normalizeTag(tag)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(tag)
  }
  return result
}

function ensureConfig() {
  if (!process.env.GITHUB_TOKEN) {
    throw new SuggestionError(500, 'Server is missing GITHUB_TOKEN for repository analysis.')
  }
  if (!process.env.HF_API_TOKEN) {
    throw new SuggestionError(500, 'Server is missing HF_API_TOKEN for tag generation.')
  }
}

function parseGitHubUrl(input) {
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`)
    if (!['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return null

    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length < 2) return null

    const owner = segments[0]
    const repo = segments[1].replace(/\.git$/i, '')
    let ref = null

    if ((segments[2] === 'tree' || segments[2] === 'blob') && segments[3]) {
      ref = segments[3]
    }

    return { owner, repo, ref }
  } catch {
    return null
  }
}

function buildGitHubHeaders(raw = false) {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
    'User-Agent': 'portfolio-tag-suggester',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function fetchGitHubJson(url) {
  const response = await fetch(url, { headers: buildGitHubHeaders(false) })
  if (!response.ok) {
    const text = await response.text()
    throw new SuggestionError(
      response.status === 404 || response.status === 403 ? 400 : 502,
      `GitHub request failed: ${text || response.statusText}`
    )
  }
  return response.json()
}

async function fetchGitHubText(url) {
  const response = await fetch(url, { headers: buildGitHubHeaders(true) })
  if (!response.ok) {
    const text = await response.text()
    throw new SuggestionError(
      response.status === 404 || response.status === 403 ? 400 : 502,
      `GitHub request failed: ${text || response.statusText}`
    )
  }
  return response.text()
}

function isIgnoredPath(filePath) {
  const lower = filePath.toLowerCase()
  if (IGNORED_SEGMENTS.some((segment) => lower.includes(segment))) return true

  const extension = lower.includes('.') ? lower.slice(lower.lastIndexOf('.')) : ''
  if (BINARY_EXTENSIONS.has(extension)) return true

  return false
}

function scoreFile(entry) {
  const filePath = entry.path
  const lower = filePath.toLowerCase()
  const fileName = lower.split('/').pop() || lower

  if (isIgnoredPath(filePath)) return Number.NEGATIVE_INFINITY

  let score = 0

  if (/^readme(\.[a-z0-9]+)?$/i.test(fileName)) score += 95
  if (MANIFEST_FILES.has(fileName)) score += 100
  if (SOURCE_PREFIXES.some((prefix) => lower.startsWith(prefix))) score += 60
  if (lower.includes('/components/') || lower.includes('/pages/') || lower.includes('/routes/')) score += 20
  if (lower.endsWith('dockerfile')) score += 80
  if (lower.includes('.github/workflows/')) score += 70

  const extension = lower.includes('.') ? lower.slice(lower.lastIndexOf('.')) : ''
  if (SOURCE_EXTENSIONS.has(extension)) score += 25

  score -= lower.split('/').length
  score -= Math.min(entry.size || 0, 50000) / 25000

  return score
}

function truncate(text, limit) {
  if (!text) return ''
  return text.length > limit ? `${text.slice(0, limit)}\n...` : text
}

async function collectRepoContext(parsed) {
  const warnings = []
  const repoMeta = await fetchGitHubJson(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`)

  let ref = parsed.ref || repoMeta.default_branch
  let tree

  try {
    tree = await fetchGitHubJson(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`)
  } catch (error) {
    if (parsed.ref && parsed.ref !== repoMeta.default_branch) {
      warnings.push(`Could not inspect branch "${parsed.ref}", so the default branch "${repoMeta.default_branch}" was used instead.`)
      ref = repoMeta.default_branch
      tree = await fetchGitHubJson(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`)
    } else {
      throw error
    }
  }

  const entries = Array.isArray(tree.tree) ? tree.tree.filter((entry) => entry.type === 'blob') : []
  const ranked = entries
    .map((entry) => ({ ...entry, score: scoreFile(entry) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))

  const selectedPaths = []
  const selectedSet = new Set()

  for (const entry of ranked) {
    if (selectedPaths.length >= MAX_FILES) break
    if (selectedSet.has(entry.path)) continue
    selectedPaths.push(entry.path)
    selectedSet.add(entry.path)
  }

  let readme = ''
  try {
    readme = await fetchGitHubText(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme?ref=${encodeURIComponent(ref)}`)
  } catch {
    warnings.push('README could not be fetched, so suggestions rely more heavily on code and metadata.')
  }

  const files = []
  let totalChars = readme ? Math.min(readme.length, 6000) : 0

  for (const filePath of selectedPaths) {
    if (totalChars >= MAX_TOTAL_CHARS) break

    try {
      const contents = await fetchGitHubText(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`
      )

      const trimmed = truncate(contents, MAX_FILE_CHARS)
      if (!trimmed.trim()) continue

      totalChars += trimmed.length
      files.push({ path: filePath, content: trimmed })
    } catch {
      warnings.push(`Skipped ${filePath} during repository sampling.`)
    }
  }

  if (files.length === 0 && !readme) {
    throw new SuggestionError(400, 'The GitHub repository did not expose any readable files for tag generation.', warnings)
  }

  const repoSummary = [
    `Repository: ${repoMeta.full_name}`,
    `Visibility: ${repoMeta.private ? 'private' : 'public'}`,
    `Branch analyzed: ${ref}`,
    `Primary language: ${repoMeta.language || 'unknown'}`,
    `Description: ${repoMeta.description || 'none'}`,
    `Topics: ${(repoMeta.topics || []).join(', ') || 'none'}`,
    `Sampled files: ${files.map((file) => file.path).join(', ') || 'none'}`,
  ].join('\n')

  const contextSections = [repoSummary]

  if (readme) {
    contextSections.push(`README\n${truncate(readme, 6000)}`)
  }

  for (const file of files) {
    contextSections.push(`FILE: ${file.path}\n${file.content}`)
  }

  return {
    repoSummary,
    context: contextSections.join('\n\n'),
    warnings,
  }
}

function buildPrompt({ description, longDescription, screenshots, existingTags, repoContext }) {
  return [
    'You assign technology tags to software projects.',
    'Return strict JSON only in the shape {"suggestions":["tag1","tag2"]}.',
    'Choose only tags that exist in the allowed tag list.',
    'Do not invent technologies that are not evidenced by the project description or repository sample.',
    'Prefer concrete languages, frameworks, databases, infrastructure, deployment, and tooling.',
    'Avoid repeating the existing tags.',
    '',
    `Allowed tags: ${ALLOWED_TAGS.join(', ')}`,
    `Existing tags: ${(existingTags || []).join(', ') || 'none'}`,
    `Screenshot count: ${screenshots.length}`,
    '',
    'Project description:',
    description,
    '',
    longDescription ? `Project case study:\n${longDescription}\n` : '',
    'Repository context:',
    repoContext,
  ].filter(Boolean).join('\n')
}

function extractJsonObject(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

async function generateSuggestions(prompt) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 220,
        return_full_text: false,
        temperature: 0.2,
      },
      options: {
        wait_for_model: true,
        use_cache: false,
      },
    }),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.error || payload?.message || response.statusText
    throw new SuggestionError(502, `Tag generation failed: ${message}`)
  }

  const generatedText = Array.isArray(payload)
    ? payload[0]?.generated_text
    : payload?.generated_text

  if (!generatedText) {
    throw new SuggestionError(502, 'Tag generation returned an empty response.')
  }

  const parsed = extractJsonObject(generatedText)
  if (!parsed || !Array.isArray(parsed.suggestions)) {
    throw new SuggestionError(502, 'Tag generation returned an invalid format.')
  }

  const mapped = parsed.suggestions
    .map((tag) => ALLOWED_TAG_LOOKUP.get(normalizeTag(tag)))
    .filter(Boolean)

  return dedupeTags(mapped).slice(0, 12)
}

async function suggestTagsForProject({ description, longDescription, github, screenshots, existingTags = [] }) {
  ensureConfig()

  if (!description || !description.trim()) {
    throw new SuggestionError(400, 'A project description is required before tags can be generated.')
  }
  if (!github || !github.trim()) {
    throw new SuggestionError(400, 'A GitHub repository URL is required before tags can be generated.')
  }
  if (!Array.isArray(screenshots) || screenshots.length === 0) {
    throw new SuggestionError(400, 'At least one screenshot is required before tags can be generated.')
  }

  const parsed = parseGitHubUrl(github.trim())
  if (!parsed) {
    throw new SuggestionError(400, 'The GitHub URL is invalid or not supported.')
  }

  const { repoSummary, context, warnings } = await collectRepoContext(parsed)
  const prompt = buildPrompt({
    description: description.trim(),
    longDescription: (longDescription || '').trim(),
    screenshots,
    existingTags,
    repoContext: context,
  })

  const suggestions = await generateSuggestions(prompt)

  return {
    suggestions,
    repoSummary,
    warnings,
  }
}

module.exports = {
  ALLOWED_TAGS,
  SuggestionError,
  suggestTagsForProject,
}
