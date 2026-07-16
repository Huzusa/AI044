import Link from 'next/link'
import { CalendarDays, User, Tag, ChevronRight, Sparkles } from 'lucide-react'

export default function ArticleCard({ article }) {
  const date = new Date(article.created_at).toLocaleDateString('zh-CN')

  return (
    <Link
      href={`/article/${article.id}`}
      className="card block animate-fade-in group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-ink-800 group-hover:text-accent-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <ChevronRight className="w-5 h-5 text-ink-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
      </div>

      {article.ai_summary && (
        <div className="mb-4 p-3 rounded-lg bg-accent-50 border border-accent-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span className="text-xs font-medium text-accent-700">AI 摘要</span>
          </div>
          <p className="text-sm text-accent-800/80 line-clamp-2">{article.ai_summary}</p>
        </div>
      )}

      {!article.ai_summary && (
        <p className="text-ink-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {article.content.replace(/[#>*\-\n]/g, ' ').slice(0, 150)}...
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" />
          {date}
        </span>
        <span className="inline-flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          {article.author || '匿名作者'}
        </span>
      </div>

      {article.ai_tags && article.ai_tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {article.ai_tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag-chip">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
