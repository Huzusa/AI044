'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Eye, Tag, Sparkles, Loader2, AlertCircle, PenLine } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getArticle } from '@/utils/api'

export default function ArticlePage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchArticle()
    }
  }, [user, params.id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const data = await getArticle(params.id)
      if (data.ok) {
        setArticle(data.article)
        setError('')
      } else {
        setError(data.error || '文章不存在')
      }
    } catch {
      setError('无法获取文章内容')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="card text-center py-16 space-y-4 max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink-700">文章不存在或已删除</h3>
          <p className="text-ink-500 text-sm mt-1">{error}</p>
        </div>
        <Link href="/my/posts" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          返回我的文章
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link
          href="/my/posts"
          className="flex items-center gap-1 text-ink-500 hover:text-ink-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </Link>
        <div className="h-4 w-px bg-ink-200" />
        <Link href="/write" className="btn-secondary !px-4 !py-1.5 text-sm">
          <PenLine className="w-4 h-4" />
          写新文章
        </Link>
        <Link href={`/write?id=${article.id}`} className="btn-primary !px-4 !py-1.5 text-sm">
          <PenLine className="w-4 h-4" />
          编辑文章
        </Link>
      </header>

      <article className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-ink-900 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 flex-wrap text-sm text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-600 font-medium">
                {article.author?.charAt(0) || '?'}
              </span>
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              {new Date(article.created_at).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.view_count || 0}
            </span>
          </div>

          {(article.ai_tags && article.ai_tags.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {article.ai_tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {(article.ai_summary || article.ai_reader_comments?.length > 0) && (
          <section className="p-5 rounded-xl bg-accent-50 border border-accent-200 space-y-4">
            <div className="flex items-center gap-2 text-accent-700">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-semibold">AI 分析</h2>
            </div>

            {article.ai_summary && (
              <div>
                <p className="text-xs font-medium text-accent-600 mb-1">内容摘要</p>
                <p className="text-ink-800 leading-relaxed">{article.ai_summary}</p>
              </div>
            )}

            {article.ai_reader_comments && article.ai_reader_comments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-accent-600 mb-2">读者视角建议</p>
                <ul className="space-y-2">
                  {article.ai_reader_comments.map((comment, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-white border border-accent-300 flex items-center justify-center text-xs text-accent-600 shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-ink-700">{comment}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <div className="article-content text-ink-800 leading-relaxed">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p className="text-ink-400 italic">暂无内容</p>
          )}
        </div>
      </article>

      <footer className="pt-6 border-t border-ink-100 flex items-center justify-between">
        <p className="text-xs text-ink-400">
          最后更新：{new Date(article.updated_at).toLocaleString('zh-CN')}
        </p>
        <Link href="/write" className="btn-secondary !px-4 !py-1.5 text-sm">
          <PenLine className="w-4 h-4" />
          开始创作
        </Link>
      </footer>
    </div>
  )
}
