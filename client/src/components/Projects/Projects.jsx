import { useState, useEffect, useMemo, useRef } from 'react'
import ProjectCard from './ProjectCard'
import { API_BASE } from '../../config'
import './Projects.css'

const SEARCH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CHEVRON_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const TAG_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const CATEGORIES = [
  { value: null,            label: 'All' },
  { value: 'personal',     label: 'Personal' },
  { value: 'academic',     label: 'Academic' },
  { value: 'professional', label: 'Professional' },
]

const STATUSES = [
  { value: null,             label: 'Any status' },
  { value: 'completed',      label: 'Completed' },
  { value: 'in-development', label: 'In Development' },
]

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az',     label: 'A → Z' },
  { value: 'za',     label: 'Z → A' },
]

function useDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])
  return [open, setOpen, ref]
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  const [search, setSearch]       = useState('')
  const [activeTags, setActiveTags] = useState(new Set())
  const [category, setCategory]   = useState(null)
  const [status, setStatus]       = useState(null)
  const [sortBy, setSortBy]       = useState('newest')

  const [sortOpen, setSortOpen, sortRef]   = useDropdown()
  const [tagsOpen, setTagsOpen, tagsRef]   = useDropdown()

  useEffect(() => {
    fetch(`${API_BASE}/api/projects`)
      .then(r => r.json())
      .then(data => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const allTags = useMemo(() => {
    const set = new Set()
    projects.forEach(p => (p.tags || []).forEach(t => set.add(t)))
    return [...set].sort()
  }, [projects])

  const toggleTag = tag => {
    setActiveTags(prev => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  const filtered = useMemo(() => {
    let list = projects.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      const matchTag    = activeTags.size === 0 || (p.tags || []).some(t => activeTags.has(t))
      const matchCat    = !category || p.category === category
      const matchStatus = !status   || p.status === status
      return matchSearch && matchTag && matchCat && matchStatus
    })

    list = [...list].sort((a, b) => {
      if (sortBy === 'newest') return (b.projectDate || b.createdAt).localeCompare(a.projectDate || a.createdAt)
      if (sortBy === 'oldest') return (a.projectDate || a.createdAt).localeCompare(b.projectDate || b.createdAt)
      if (sortBy === 'az')     return a.title.localeCompare(b.title)
      if (sortBy === 'za')     return b.title.localeCompare(a.title)
      return 0
    })
    return list
  }, [projects, search, activeTags, category, status, sortBy])

  const hasActiveFilters = search || activeTags.size > 0 || category || status || sortBy !== 'newest'
  const clearAll = () => {
    setSearch(''); setActiveTags(new Set()); setCategory(null); setStatus(null); setSortBy('newest')
  }

  const currentSortLabel = SORTS.find(s => s.value === sortBy)?.label ?? 'Sort'

  return (
    <section className="projects section" id="projects">
      <div className="container">
        <p className="section-label">02. work</p>
        <h2 className="section-title">Things I've <span>Built</span></h2>

        <div className="projects__controls">

          {/* Row 1: search + Sort By + Tags dropdowns */}
          <div className="controls-search-row">
            <div className="search-bar">
              <span className="search-bar__icon">{SEARCH_ICON}</span>
              <input
                type="text"
                placeholder="Search projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-bar__input"
              />
              {search && (
                <button className="search-bar__clear" onClick={() => setSearch('')} aria-label="Clear">✕</button>
              )}
            </div>

            {/* Sort By dropdown */}
            <div className="dd-wrap" ref={sortRef}>
              <button
                className={`dd-btn ${sortOpen ? 'dd-btn--open' : ''} ${sortBy !== 'newest' ? 'dd-btn--active' : ''}`}
                onClick={() => setSortOpen(v => !v)}
              >
                {CHEVRON_ICON}
                <span>Sort By</span>
              </button>
              {sortOpen && (
                <div className="dd-panel dd-panel--sort">
                  {SORTS.map(s => (
                    <button
                      key={s.value}
                      className={`dd-option ${sortBy === s.value ? 'dd-option--active' : ''}`}
                      onClick={() => { setSortBy(s.value); setSortOpen(false) }}
                    >
                      <span>{s.label}</span>
                      {sortBy === s.value && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags dropdown */}
            {allTags.length > 0 && (
              <div className="dd-wrap" ref={tagsRef}>
                <button
                  className={`dd-btn ${tagsOpen ? 'dd-btn--open' : ''} ${activeTags.size > 0 ? 'dd-btn--active' : ''}`}
                  onClick={() => setTagsOpen(v => !v)}
                >
                  {TAG_ICON}
                  <span>Tags{activeTags.size > 0 ? ` (${activeTags.size})` : ''}</span>
                  {CHEVRON_ICON}
                </button>
                {tagsOpen && (
                  <div className="dd-panel dd-panel--tags">
                    <div className="dd-tags-list">
                      {allTags.map(tag => (
                        <label key={tag} className="dd-tag-row">
                          <span className="dd-tag-name">{tag}</span>
                          <input
                            type="checkbox"
                            checked={activeTags.has(tag)}
                            onChange={() => toggleTag(tag)}
                            className="dd-checkbox"
                          />
                        </label>
                      ))}
                    </div>
                    {activeTags.size > 0 && (
                      <button className="dd-clear-tags" onClick={() => setActiveTags(new Set())}>
                        Clear tags
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 2: type + status filter pills */}
          <div className="controls-filter-row">
            {CATEGORIES.map(c => (
              <button
                key={String(c.value)}
                className={`filter-pill ${category === c.value ? 'filter-pill--active' : ''}`}
                onClick={() => setCategory(c.value)}
              >{c.label}</button>
            ))}
            <div className="filter-group-divider" />
            {STATUSES.map(s => (
              <button
                key={String(s.value)}
                className={`filter-pill ${status === s.value ? 'filter-pill--active' : ''}`}
                onClick={() => setStatus(s.value)}
              >{s.label}</button>
            ))}
            {hasActiveFilters && (
              <button className="filter-clear-all" onClick={clearAll}>clear all</button>
            )}
          </div>

        </div>

        {loading ? (
          <div className="projects__loading">
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="projects__empty">
            <p className="sketch">No projects found.</p>
            {hasActiveFilters && (
              <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={clearAll}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="projects__count mono">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' matching filters' : ''}
            </p>
            <div className="projects__grid">
              {filtered.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onTagClick={tag => toggleTag(tag)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
