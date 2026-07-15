'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, PenLine, Trash2, Eye, CalendarDays,
  Search, Loader2, Sparkles, Plus, AlertTriangle
} from 'lucide-react'

export default function MyPostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/articles?author=me')
      const data = await res.json()
      setPosts(data.articles || mockPosts)
    } catch {
      setPosts(mockPosts)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (id, title) => {
    if (!confirm(`确定要删除《${title}》吗？此操作不可撤销。`)) return
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    } finally {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const stats = {
    total: posts.length,
    withAI: posts.filter((p) => p.ai_summary || p.ai_tags?.length > 0).length,
    totalWords: posts.reduce((s, p) => s + (p.content?.length || 0), 0),
  }

  const filtered = posts.filter((p) => {
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = filter === 'all' ||
      (filter === 'with-ai' && (p.ai_summary || p.ai_tags?.length > 0)) ||
      (filter === 'without-ai' && !p.ai_summary && !p.ai_tags?.length)
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="space-y-5">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-accent-500" />
              我的文章
            </h1>
            <p className="text-ink-500 text-sm mt-1">管理你创作过的所有内容</p>
          </div>
          <Link href="/write" className="btn-primary">
            <Plus className="w-4 h-4" />
            写新文章
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card !p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-ink-600" />
            </div>
            <div>
              <p className="text-xs text-ink-500">创作总数</p>
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

        <div className="card !p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: 'all', label: '全部' },
              { id: 'with-ai', label: 'AI 辅助过' },
              { id: 'without-ai', label: '纯手写' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-accent-500 text-white'
                    : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10 !py-2 text-sm"
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
            <h3 className="text-lg font-semibold text-ink-700">还没有符合条件的文章</h3>
            <p className="text-ink-500 text-sm mt-1">
              {posts.length === 0
                ? '开始你的第一篇创作吧！AI 会在每一步为你提供灵感与建议'
                : '试试切换筛选条件或清空搜索'}
            </p>
          </div>
          <Link href="/write" className="btn-primary inline-flex">
            <PenLine className="w-4 h-4" />
            开始创作
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <div
              key={post.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="card !p-4 md:!p-5 animate-fade-in flex flex-col sm:flex-row gap-4 sm:items-center hover:border-accent-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap mb-1.5">
                  <Link
                    href={`/article/${post.id}`}
                    className="text-lg font-semibold text-ink-800 hover:text-accent-600 transition-colors truncate"
                  >
                    {post.title}
                  </Link>
                  {(post.ai_summary || post.ai_tags?.length > 0) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-50 text-accent-700 shrink-0">
                      <Sparkles className="w-3 h-3" />
                      AI 辅助
                    </span>
                  )}
                </div>
                {post.ai_summary ? (
                  <p className="text-sm text-ink-600 line-clamp-2 leading-relaxed">
                    {post.ai_summary}
                  </p>
                ) : (
                  <p className="text-sm text-ink-500 line-clamp-2">
                    {post.content?.replace(/[#>*\-\n]/g, ' ').slice(0, 120) || '（无内容预览）'}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-ink-400">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <span>{post.content?.length || 0} 字</span>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <Link
                  href={`/article/${post.id}`}
                  className="btn-secondary !px-3 !py-2 text-sm flex-1 sm:w-full justify-center"
                >
                  <Eye className="w-4 h-4 sm:mr-1" />
                  <span className="sm:inline">查看</span>
                </Link>
                <button
                  onClick={() => deletePost(post.id, post.title)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex-1 sm:w-full"
                >
                  <Trash2 className="w-4 h-4 sm:mr-1" />
                  <span className="sm:inline">删除</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const mockPosts = [
  {
    id: 1,
    title: '关于夏天的十个碎片记忆',
    content: '午后三点的阳光穿过梧桐叶，在课桌上投下斑驳的光影。电风扇吱呀地转着，粉笔灰在光柱里缓缓浮动...',
    created_at: '2026-07-10T08:30:00Z',
    ai_summary: '作者以十个生活碎片串联起对夏日的细腻观察，从阳光、蝉鸣到冰西瓜的甜，用克制的笔触写出了藏在平凡日常里的温柔。',
    ai_tags: ['生活随笔', '散文诗歌'],
  },
  {
    id: 2,
    title: '读完《百年孤独》后的三天三夜',
    content: '合上书的那个晚上，我做了一个很长的梦。梦里是马孔多的雨季，黄色的蝴蝶绕着海棠花飞...',
    created_at: '2026-07-05T21:10:00Z',
    ai_summary: null,
    ai_tags: [],
  },
  {
    id: 3,
    title: '我为什么开始每天写 300 字',
    content: '三个月前的某个深夜，我突然意识到自己已经很久没有"认真地表达"了。聊天框里的碎片语言...',
    created_at: '2026-06-28T23:45:00Z',
    ai_summary: '作者分享了自己坚持每日写作三个月的真实感受，从"不知道写什么"到"在文字里重新认识自己"，这是一个关于与自我对话的故事。',
    ai_tags: ['生活随笔', '个人成长'],
  },
]
