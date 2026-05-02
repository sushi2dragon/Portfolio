import { useNavigate } from 'react-router-dom'
import { resolveUrl } from '../../config'
import './ProjectCard.css'

const isVideo = url => /\.(mp4|webm|ogg|mov)$/i.test(url)
const isPDF = url => /\.pdf$/i.test(url)
const isImage = url => url && !isVideo(url) && !isPDF(url)

function MediaPlaceholder({ label, symbol }) {
  return (
    <div className="project-card__no-img">
      <span className="project-card__placeholder-symbol sketch">{symbol}</span>
      <span className="project-card__placeholder-label mono">{label}</span>
    </div>
  )
}

export default function ProjectCard({ project, onTagClick }) {
  const navigate = useNavigate()
  const { id, title, description, tags = [], screenshots = [] } = project

  const resolved = screenshots.map(resolveUrl)
  const imageThumb = resolved.find(isImage) || null
  const videoThumb = !imageThumb ? (resolved.find(isVideo) || null) : null
  const pdfThumb = !imageThumb && !videoThumb ? (resolved.find(isPDF) || null) : null

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
        {imageThumb ? (
          <img
            src={imageThumb}
            alt={`${title} preview`}
            className="project-card__img"
            loading="lazy"
            decoding="async"
          />
        ) : videoThumb ? (
          <MediaPlaceholder label="Video" symbol=">" />
        ) : pdfThumb ? (
          <MediaPlaceholder label="PDF" symbol="PDF" />
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
