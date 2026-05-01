import { useState, useRef, useEffect } from 'react'
import './TagInput.css'

// Comprehensive tech tag list for autocomplete suggestions
const TECH_TAGS = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C', 'C++', 'C#',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Elixir', 'Haskell', 'Scala', 'R', 'Lua',
  // Frontend frameworks
  'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact', 'Alpine.js', 'Lit', 'Qwik',
  // Meta-frameworks
  'Next.js', 'Nuxt', 'Remix', 'Astro', 'SvelteKit', 'Gatsby',
  // Build tools
  'Vite', 'Webpack', 'Turbopack', 'Rollup', 'esbuild', 'Parcel',
  // Styling
  'TailwindCSS', 'CSS', 'SCSS', 'Sass', 'Bootstrap', 'Material UI', 'shadcn/ui',
  'Chakra UI', 'Radix UI', 'Framer Motion', 'GSAP', 'Styled Components', 'Emotion',
  // Backend
  'Node.js', 'Express', 'Fastify', 'Hono', 'NestJS', 'Koa',
  'FastAPI', 'Django', 'Flask', 'SQLAlchemy',
  'Rails', 'Laravel', 'Symfony', 'Spring Boot', 'Gin', 'Fiber',
  // Databases
  'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis', 'DynamoDB',
  'CockroachDB', 'PlanetScale', 'Turso', 'Cassandra', 'InfluxDB',
  // ORMs / query builders
  'Prisma', 'Drizzle', 'TypeORM', 'Sequelize', 'Mongoose', 'Knex',
  // BaaS / hosted
  'Supabase', 'Firebase', 'Appwrite', 'Convex', 'Pocketbase',
  // Cloud / hosting
  'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify', 'Railway', 'Fly.io', 'Render', 'Heroku',
  // DevOps
  'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'GitLab CI', 'CI/CD', 'Ansible',
  // APIs / protocols
  'REST', 'GraphQL', 'tRPC', 'gRPC', 'WebSocket', 'Socket.io', 'OpenAPI', 'WebRTC',
  // Auth
  'Auth0', 'Clerk', 'NextAuth', 'Lucia', 'JWT', 'OAuth',
  // Payments / services
  'Stripe', 'Twilio', 'SendGrid', 'Resend', 'Cloudinary', 'Uploadthing',
  'OpenAI API', 'Anthropic API',
  // Data viz
  'Three.js', 'WebGL', 'D3.js', 'Chart.js', 'Recharts', 'Observable',
  // Mobile / desktop
  'React Native', 'Expo', 'Flutter', 'Electron', 'Tauri',
  // Testing
  'Jest', 'Vitest', 'Playwright', 'Cypress', 'Testing Library', 'Storybook',
  // Other
  'PWA', 'WebAssembly', 'IndexedDB', 'MDX', 'Markdown',
  'API', 'CLI', 'Git', 'Monorepo', 'Microservices', 'Serverless', 'Edge Functions',
]

export default function TagInput({ value = [], onChange, placeholder = 'Add technology…', suggestionsSource = TECH_TAGS }) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const suggestions = input.trim()
    ? suggestionsSource
        .filter(t => t.toLowerCase().includes(input.toLowerCase()) && !value.includes(t))
        .slice(0, 8)
    : suggestionsSource
        .filter(t => !value.includes(t))
        .slice(0, 8)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && e.target !== inputRef.current) {
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

  const removeTag = (tag) => onChange(value.filter(t => t !== tag))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (highlighted >= 0 && suggestions[highlighted]) {
        addTag(suggestions[highlighted])
      } else if (input.trim()) {
        addTag(input.trim())
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(i => Math.max(i - 1, -1))
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  return (
    <div className="tag-input">
      <div
        className="tag-input__container"
        onClick={() => { inputRef.current?.focus(); setOpen(true) }}
      >
        {value.map(tag => (
          <span key={tag} className="tag-input__chip">
            {tag}
            <button
              type="button"
              className="tag-input__chip-remove"
              onClick={e => { e.stopPropagation(); removeTag(tag) }}
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-input__field"
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); setHighlighted(-1) }}
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
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              className={`tag-input__suggestion ${i === highlighted ? 'tag-input__suggestion--active' : ''}`}
              onMouseDown={e => { e.preventDefault(); addTag(s) }}
              onMouseEnter={() => setHighlighted(i)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
