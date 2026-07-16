'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, PenLine, BookOpen, BrainCircuit, Puzzle, MessageSquareQuote } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  if (user) {
    router.push('/my/posts')
    return null
  }

  const features = [
    {
      icon: BrainCircuit,
      title: 'AI 结构参考',
      desc: '输入关键词，AI 帮你梳理文章结构方向',
    },
    {
      icon: Puzzle,
      title: '灵感骰子',
      desc: '感官细节、微场景、微小冲突，帮你打破写作僵局',
    },
    {
      icon: MessageSquareQuote,
      title: '深度反问',
      desc: '针对已写内容，AI 提出引导性问题帮你想深想细',
    },
  ]

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-50 via-white to-ink-50 p-8 md:p-12 border border-ink-100 text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-ink-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-accent-200 text-accent-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI 辅助 · 灵感加持
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink-900 mb-6 leading-tight">
            用文字记录思考，<br />
            <span className="text-accent-600">让 AI 成为你的写作副驾</span>
          </h1>
          <p className="text-lg text-ink-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            从构思大纲到润色定稿，AI 在每一步为你提供建议与灵感。
            但故事的主角永远是你 —— 你书写内容，AI 辅助你写得更好。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="btn-primary text-lg">
              <PenLine className="w-5 h-5" />
              开始创作
            </Link>
            <Link href="/register" className="btn-secondary text-lg">
              免费注册
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="card text-center hover:border-accent-200 transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-accent-50 flex items-center justify-center mx-auto mb-4">
              <feature.icon className="w-7 h-7 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-ink-800 mb-2">{feature.title}</h3>
            <p className="text-ink-500 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      <section className="card text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="w-6 h-6 text-accent-500" />
          <h2 className="text-xl font-bold text-ink-800">创作原则</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-lg bg-ink-50">
            <p className="font-medium text-ink-800 mb-1">✍️ 亲手书写</p>
            <p className="text-sm text-ink-500">AI 不直接生成文章段落，每一个字都应由你亲手书写</p>
          </div>
          <div className="p-4 rounded-lg bg-ink-50">
            <p className="font-medium text-ink-800 mb-1">💡 灵感引导</p>
            <p className="text-sm text-ink-500">AI 提供素材、参考、引导，帮你找到自己的表达</p>
          </div>
          <div className="p-4 rounded-lg bg-ink-50">
            <p className="font-medium text-ink-800 mb-1">🔒 数据安全</p>
            <p className="text-sm text-ink-500">你的文章只属于你，自动保存到个人空间</p>
          </div>
        </div>
      </section>
    </div>
  )
}
