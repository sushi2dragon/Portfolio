import { useState, useRef, useEffect } from 'react'
import './TagInput.css'

const TECH_TAGS = [
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

function normalizeTag(value) {
  return String(value || '').trim().toLowerCase()
}

export default function TagInput({
  value = [],
  onChange,
  onRemoveTag,
  placeholder = 'Add technology...',
  suggestionsSource = TECH_TAGS,
  highlightedTags = [],
}) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const highlightedSet = new Set(highlightedTags.map(normalizeTag))
  const suggestions = input.trim()
    ? suggestionsSource
        .filter((tag) => tag.toLowerCase().includes(input.toLowerCase()) && !value.includes(tag))
        .slice(0, 8)
    : suggestionsSource
        .filter((tag) => !value.includes(tag))
        .slice(0, 8)

  useEffect(() => {
    const handler = (event) => {
      if (!dropdownRef.current?.contains(event.target) && event.target !== inputRef.current) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
    setHighlighted(-1)
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeTag = (tag) => {
    onRemoveTag?.(tag)
    onChange(value.filter((item) => item !== tag))
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      if (highlighted >= 0 && suggestions[highlighted]) {
        addTag(suggestions[highlighted])
      } else if (input.trim()) {
        addTag(input.trim())
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((index) => Math.min(index + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((index) => Math.max(index - 1, -1))
    } else if (event.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (event.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  return (
    <div className="tag-input">
      <div
        className="tag-input__container"
        onClick={() => {
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        {value.map((tag) => {
          const isGenerated = highlightedSet.has(normalizeTag(tag))
          return (
            <span
              key={tag}
              className={`tag-input__chip${isGenerated ? ' tag-input__chip--generated' : ''}`}
            >
              {tag}
              <button
                type="button"
                className="tag-input__chip-remove"
                onClick={(event) => {
                  event.stopPropagation()
                  removeTag(tag)
                }}
                aria-label={`Remove ${tag}`}
              >
                x
              </button>
            </span>
          )
        })}
        <input
          ref={inputRef}
          className="tag-input__field"
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
            setOpen(true)
            setHighlighted(-1)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          autoComplete="off"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="tag-input__dropdown" ref={dropdownRef}>
          {!input.trim() && (
            <div className="tag-input__dropdown-label">Suggested</div>
          )}
          {suggestions.map((tag, index) => (
            <button
              key={tag}
              type="button"
              className={`tag-input__suggestion${index === highlighted ? ' tag-input__suggestion--active' : ''}`}
              onMouseDown={(event) => {
                event.preventDefault()
                addTag(tag)
              }}
              onMouseEnter={() => setHighlighted(index)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
