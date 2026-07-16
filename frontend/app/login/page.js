'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Feather, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    router.push('/my/posts')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    if (result.ok) {
      router.push('/my/posts')
    } else {
      setError(result.error || '登录失败')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <Feather className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-ink-800">墨染</span>
          </Link>
          <h1 className="text-2xl font-bold text-ink-800">欢迎回来</h1>
          <p className="text-ink-500">登录你的账号，继续写作之旅</p>
        </div>

        <div className="card space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="input-base pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '登 录'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500">
            还没有账号？{' '}
            <Link href="/register" className="text-accent-600 hover:underline font-medium">
              立即注册
            </Link>
          </p>

          <div className="pt-4 border-t border-ink-100">
            <p className="text-xs text-center text-ink-400">
              演示账号：<span className="font-mono">demo</span> / <span className="font-mono">demo123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
