'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, PenLine, Eye, CalendarDays,
  Search, Loader2, Sparkles, Plus, AlertTriangle, Grid3X3, List
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getArticles } from '@/utils/api'

const accentColors = [
  'bg-red-50 border-red-200 text-red-700',
  'bg-orange-50 border-orange-200 text-orange-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-yellow-50 border-yellow-200 text-yellow-700',
  'bg-lime-50 border-lime-200 text-lime-700',
  'bg-green-50 border-green-200 text-green-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-teal-50 border-teal-200 text-teal-700',
  'bg-cyan-50 border-cyan-200 text-cyan-700',
  'bg-sky-50 border-sky-200 text-sky-700',
  'bg-blue-50 border-blue-200 text-blue-700',
  'bg-indigo-50 border-indigo-200 text-indigo-700',
  'bg-violet-50 border-violet-200 text-violet-700',
  'bg-purple-50 border-purple-200 text-purple-700',
  'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
  'bg-pink-50 border-pink-200 text-pink-700',
  'bg-rose-50 border-rose-200 text-rose-700',
]

const getAccentColor = (title) => {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return accentColors[Math.abs(hash) % accentColors.length]
}

export default function BookshelfPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await getArticles()
      setPosts(data.articles || [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: posts.length,
    withAI: posts.filter((p) => p.ai_summary || p.ai_tags?.length > 0).length,
    totalWords: posts.reduce((s, p) => s + (p.content?.length || 0), 0),
  }

  const filtered = posts.filter((p) => {
    return !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="space-y-5">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-accent-500" />
              我的书架
            </h1>
            <p className="text-ink-500 text-sm mt-1">浏览你所有保存的文章</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/my/posts" className="btn-secondary">
              <List className="w-4 h-4" />
              列表视图
            </Link>
            <Link href="/write" className="btn-primary">
              <Plus className="w-4 h-4" />
              写新文章
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card !p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-ink-600" />
            </div>
            <div>
              <p className="text-xs text-ink-500">文章总数</p>
              <p className="text-2xl font-bold text-ink-800">{stats.total} 篇</p>
            </div>
          </div>
          <div className="card !p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <p className="text-xs text-ink-500">AI 辅助</p>
              <p className="text-2xl font-bold text-ink-800">{stats.withAI} 篇</p>
            </div>
          </div>
          <div className="card !p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center shrink-0">
              <PenLine className="w-6 h-6 text-ink-600" />
            </div>
            <div>
              <p className="text-xs text-ink-500">累计字数</p>
              <p className="text-2xl font-bold text-ink-800">{stats.totalWords.toLocaleString()} 字</p>
            </div>
          </div>
        </div>

        <div className="card !p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10 !py-2"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-full bg-ink-50 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-ink-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink-700">书架还是空的</h3>
            <p className="text-ink-500 text-sm mt-1">
              开始你的第一篇创作吧！
            </p>
          </div>
          <Link href="/write" className="btn-primary inline-flex">
            <PenLine className="w-4 h-4" />
            开始创作
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((post, i) => {
            const accentColor = getAccentColor(post.title)
            return (
              <Link
                key={post.id}
                href={`/article/${post.id}`}
                className="group"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className={`relative aspect-[3/4] rounded-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${accentColor}`}>
                  <div className="absolute inset-0 flex flex-col p-4">
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-sm font-bold leading-tight line-clamp-4">
                        {post.title}
                      </h3>
                    </div>

                    <div className="mt-3 pt-3 border-t border-current/20">
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="mt-1 text-xs opacity-60">
                        {post.content?.length || 0} 字
                      </div>
                    </div>

                    {(post.ai_summary || post.ai_tags?.length > 0) && (
                      <div className="absolute top-3 right-3">
                        <Sparkles className="w-4 h-4 opacity-60" />
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
