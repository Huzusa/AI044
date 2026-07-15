import Link from 'next/link'
import { Feather, PenLine, Home, BookOpen, User } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <Feather className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-ink-800">墨染</span>
            <span className="text-xs text-ink-400 hidden sm:inline">AI 写作工坊</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              文章广场
            </Link>
            <Link
              href="/write"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              开始写作
            </Link>
            <Link
              href="/my/posts"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors"
            >
              <User className="w-4 h-4" />
              我的文章
            </Link>
          </nav>

          <Link href="/write" className="btn-primary !px-4 !py-2 text-sm">
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">写文章</span>
          </Link>
        </div>

        <nav className="md:hidden flex items-center gap-1 pb-3 -mt-1">
          <Link href="/" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-ink-600 hover:bg-ink-50 text-sm">
            <Home className="w-4 h-4" /> 广场
          </Link>
          <Link href="/write" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-ink-600 hover:bg-ink-50 text-sm">
            <PenLine className="w-4 h-4" /> 写作
          </Link>
          <Link href="/my/posts" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-ink-600 hover:bg-ink-50 text-sm">
            <BookOpen className="w-4 h-4" /> 我的
          </Link>
        </nav>
      </div>
    </header>
  )
}
