import { useNavigate } from 'react-router-dom'
import './ProjectCard.css'

export default function ProjectCard({ project, onTagClick }) {
  const navigate = useNavigate()
  const { id, title, description, tags = [], screenshots = [] } = project
  const thumb = screenshots[0] || null

  const goToDetail = () => navigate(`/projects/${id}`)
  const stopProp = e => e.stopPropagation()

  return (
    <article
      className="project-card"
      onClick={goToDetail}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && goToDetail()}
      role="button"
      tabIndex={0}
      aria-label={`View ${title} case study`}
    >
      <div className="project-card__preview">
        {thumb ? (
          <img src={thumb} alt={`${title} preview`} className="project-card__img" />
        ) : (
          <div className="project-card__no-img">
            <span className="sketch">{title[0]}</span>
          </div>
        )}
      </div>

      <div className="project-card__body">
        <h3 className="project-card__title">{title}</h3>
        <p className="project-card__desc">{description}</p>
        <div className="project-card__tags">
          {tags.map(tag => (
            <span
              key={tag}
              className="tag"
              onClick={e => { stopProp(e); onTagClick?.(tag) }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
