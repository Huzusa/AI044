'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Feather, PenLine, Home, BookOpen, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

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
              href="/my/posts"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              我的文章
            </Link>
            <Link
              href="/my/bookshelf"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              我的书架
            </Link>
            <Link
              href="/write"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50 hover:text-ink-800 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              开始写作
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-ink-50 transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-600" />
                  </div>
                  <span className="text-sm font-medium text-ink-700 hidden sm:inline">
                    {user.username}
                  </span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-ink-600 hover:text-accent-600 transition-colors">
                  登录
                </Link>
                <Link href="/register" className="btn-primary !px-4 !py-2 text-sm">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-ink-100 pt-4">
            <nav className="flex flex-col gap-2">
              {user && (
                <>
                  <Link
                    href="/my/posts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50"
                  >
                    <BookOpen className="w-4 h-4" /> 我的文章
                  </Link>
                  <Link
                    href="/my/bookshelf"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50"
                  >
                    <BookOpen className="w-4 h-4" /> 我的书架
                  </Link>
                  <Link
                    href="/write"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-600 hover:bg-ink-50"
                  >
                    <PenLine className="w-4 h-4" /> 开始写作
                  </Link>
                  <hr className="border-ink-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> 退出登录
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
