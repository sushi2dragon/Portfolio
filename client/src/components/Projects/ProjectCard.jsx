import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import { resolveUrl } from '../../config'
import './ProjectCard.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

const isVideo = url => /\.(mp4|webm|ogg|mov)$/i.test(url)
const isPDF   = url => /\.pdf$/i.test(url)
const isImage = url => url && !isVideo(url) && !isPDF(url)

function PDFThumbnail({ src }) {
  const [imgSrc, setImgSrc] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function render() {
      const pdf = await pdfjsLib.getDocument(src).promise
      if (cancelled) return
      const page = await pdf.getPage(1)
      if (cancelled) return
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      if (cancelled) return
      setImgSrc(canvas.toDataURL('image/jpeg', 0.85))
    }
    render().catch(() => {})
    return () => { cancelled = true }
  }, [src])

  if (!imgSrc) {
    return (
      <div className="project-card__no-img">
        <span className="sketch">PDF</span>
      </div>
    )
  }
  return <img src={imgSrc} alt="PDF preview" className="project-card__img" />
}

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
  const pdfThumb   = !imageThumb && !videoThumb ? (resolved.find(isPDF) || null) : null

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
          <PDFThumbnail src={pdfThumb} />
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
