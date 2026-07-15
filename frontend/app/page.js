'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Sparkles, TrendingUp, PenLine, Loader2 } from 'lucide-react'
import ArticleCard from '@/components/ArticleCard'

export default function HomePage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  const allTags = [
    '生活随笔', '技术笔记', '读书笔记', '旅行游记',
    '散文诗歌', '职场思考', '影评书评', '故事创作',
  ]

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/articles?limit=20')
      const data = await res.json()
      setArticles(data.articles || mockArticles)
    } catch {
      setArticles(mockArticles)
    } finally {
      setLoading(false)
    }
  }

  const filtered = articles.filter((a) => {
    const matchSearch = !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTag = !tagFilter ||
      (a.ai_tags && a.ai_tags.some((t) => t.includes(tagFilter) || tagFilter.includes(t)))
    return matchSearch && matchTag
  })

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-50 via-white to-ink-50 p-8 md:p-12 border border-ink-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-accent-200 text-accent-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI 辅助 · 灵感加持
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-4 leading-tight">
            用文字记录思考，<br />让 AI 成为你的写作副驾
          </h1>
          <p className="text-ink-600 mb-6 leading-relaxed">
            从构思大纲到润色定稿，AI 在每一步为你提供建议与灵感。
            但故事的主角永远是你 —— 你书写内容，AI 辅助你写得更好。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/write" className="btn-primary">
              <PenLine className="w-4 h-4" />
              开始创作
            </Link>
            <a href="#articles" className="btn-secondary">
              逛逛广场
            </a>
          </div>
        </div>
      </section>

      <section id="articles" className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent-500" />
              文章广场
            </h2>
            <p className="text-ink-500 mt-1 text-sm">发现来自创作者的优秀文字</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="搜索标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTagFilter('')}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              !tagFilter
                ? 'bg-accent-500 text-white'
                : 'bg-white text-ink-600 border border-ink-200 hover:border-accent-300'
            }`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                tagFilter === tag
                  ? 'bg-accent-500 text-white'
                  : 'bg-white text-ink-600 border border-ink-200 hover:border-accent-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 card">
            <p className="text-ink-500 mb-4">还没有符合条件的文章</p>
            <Link href="/write" className="btn-primary inline-flex">
              <PenLine className="w-4 h-4" />
              写第一篇
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article, i) => (
              <div key={article.id} style={{ animationDelay: `${i * 50}ms` }}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const mockArticles = [
  {
    id: 1,
    title: '关于夏天的十个碎片记忆',
    content: '午后三点的阳光穿过梧桐叶，在课桌上投下斑驳的光影。电风扇吱呀地转着，粉笔灰在光...',
    author: '盛夏光年',
    created_at: '2026-07-10T08:30:00Z',
    ai_summary: '作者以十个生活碎片串联起对夏日的细腻观察，从阳光、蝉鸣到冰西瓜的甜，用克制的笔触写出了藏在平凡日常里的温柔。',
    ai_tags: ['生活随笔', '散文诗歌'],
  },
  {
    id: 2,
    title: 'Next.js 14 App Router 实战踩坑记录',
    content: '最近在重构项目时全面转向了 App Router，相较于 Pages Router 确实有很多理念上的不同...',
    author: '代码笔记君',
    created_at: '2026-07-08T14:20:00Z',
    ai_summary: '本文详细记录了从 Pages Router 迁移到 App Router 过程中遇到的 8 个典型问题，包括服务端组件通信、缓存策略、动态路由等，并给出了实际解决方案。',
    ai_tags: ['技术笔记'],
  },
  {
    id: 3,
    title: '读《被讨厌的勇气》：课题分离不是冷漠',
    content: '初读阿德勒心理学，最震撼的概念就是"课题分离"。很多人误解这是教人变得冷漠...',
    author: '夜读人',
    created_at: '2026-07-05T22:10:00Z',
    ai_summary: '作者结合自身经历，重新解读了"课题分离"这一概念，认为它的本质是尊重而非冷漠，并分享了在亲子关系和职场中实践的心得。',
    ai_tags: ['读书笔记', '职场思考'],
  },
  {
    id: 4,
    title: '大理五日：在洱海边学会慢下来',
    content: '逃离城市的那一周，每天的节奏是被阳光而不是闹钟叫醒的。清晨沿着洱海骑行...',
    author: '风的方向',
    created_at: '2026-07-01T10:00:00Z',
    ai_summary: '这篇游记不写景点打卡清单，而是细腻地记录了在大理"慢生活"的真实感受：骑行的风、偶遇的人、咖啡馆里一下午的发呆，以及重新理解"旅行的意义"。',
    ai_tags: ['旅行游记', '生活随笔'],
  },
]
