import { Feather, Heart, Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-100 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-accent-500" />
            <span className="font-semibold text-ink-700">墨染 · AI 写作工坊</span>
          </div>
          <p className="text-sm text-ink-500 flex items-center gap-1.5">
            用 <Sparkles className="w-3.5 h-3.5 text-accent-500" /> 辅助创作，用 <Heart className="w-3.5 h-3.5 text-accent-500" /> 书写真心
          </p>
          <p className="text-xs text-ink-400">
            AI辅助编程实训项目 © 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
