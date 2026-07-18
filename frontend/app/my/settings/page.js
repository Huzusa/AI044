'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Lock, Save, ArrowLeft, Check, Calendar, 
  FileText, PenLine, Award, BookOpen
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiRequest, getArticles } from '@/utils/api'

const stripHtml = (html) => {
  if (typeof window === 'undefined') return html || ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState({
    articleCount: 0,
    totalWords: 0,
    aiArticles: 0,
    joinDate: '',
  })

  useEffect(() => {
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      const data = await getArticles({ limit: 1000 })
      if (data.ok && data.articles) {
        const articles = data.articles
        const totalWords = articles.reduce((sum, a) => {
          const text = stripHtml(a.content).replace(/\s/g, '')
          return sum + text.length
        }, 0)
        const aiArticles = articles.filter(a => a.ai_summary || a.ai_tags?.length > 0).length
        
        setStats({
          articleCount: articles.length,
          totalWords,
          aiArticles,
          joinDate: user?.created_at || '',
        })
      }
    } catch {
      console.error('获取统计数据失败')
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({ username, email }),
      })
      if (data.ok) {
        setMessage('个人信息更新成功！')
        setSuccess(true)
        setTimeout(() => {
          setMessage('')
          setSuccess(false)
        }, 3000)
      } else {
        setMessage(data.error || '更新失败')
        setSuccess(false)
      }
    } catch {
      setMessage('网络错误')
      setSuccess(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage('两次输入的密码不一致')
      setSuccess(false)
      return
    }
    if (newPassword.length < 6) {
      setMessage('密码长度至少6位')
      setSuccess(false)
      return
    }
    try {
      const { data } = await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (data.ok) {
        setMessage('密码修改成功！请重新登录')
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          logout()
          router.push('/login')
        }, 2000)
      } else {
        setMessage(data.error || '修改失败')
        setSuccess(false)
      }
    } catch {
      setMessage('网络错误')
      setSuccess(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '未知'
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatNumber = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.push('/my/posts')}
          className="flex items-center gap-1 text-ink-500 hover:text-ink-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <div className="h-4 w-px bg-ink-200" />
        <h1 className="text-xl font-bold text-ink-800">个人中心</h1>
      </header>

      {message && (
        <div className={`p-4 rounded-lg border ${success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink-800">{username}</h2>
                <p className="text-sm text-ink-500">{email || '未绑定邮箱'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-ink-50 text-center">
                <FileText className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-ink-800">{stats.articleCount}</p>
                <p className="text-xs text-ink-500">文章总数</p>
              </div>
              <div className="p-4 rounded-lg bg-ink-50 text-center">
                <PenLine className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-ink-800">{formatNumber(stats.totalWords)}</p>
                <p className="text-xs text-ink-500">累计字数</p>
              </div>
              <div className="p-4 rounded-lg bg-ink-50 text-center">
                <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-ink-800">{stats.aiArticles}</p>
                <p className="text-xs text-ink-500">AI 辅助</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-100">
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <Calendar className="w-4 h-4" />
                <span>加入时间：{formatDate(stats.joinDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-accent-500" />
              基本信息
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="请输入邮箱（选填）"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 w-full">
                <Save className="w-4 h-4" />
                保存更改
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent-500" />
              修改密码
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1">当前密码</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="请输入当前密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-1">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="请再次输入新密码"
                />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 w-full">
                <Save className="w-4 h-4" />
                修改密码
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-800 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/my/posts')}
            className="p-4 rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="font-medium text-ink-800">我的文章</p>
              <p className="text-xs text-ink-500">查看和管理所有文章</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/my/bookshelf')}
            className="p-4 rounded-lg border border-ink-200 hover:bg-ink-50 transition-colors flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-ink-800">我的书架</p>
              <p className="text-xs text-ink-500">卡片式浏览文章</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/write')}
            className="p-4 rounded-lg border border-accent-200 hover:bg-accent-50 transition-colors flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-accent-500 flex items-center justify-center">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-accent-700">开始创作</p>
              <p className="text-xs text-accent-600">写一篇新文章</p>
            </div>
          </button>
        </div>
      </div>

      <div className="card p-6">
        <button
          onClick={() => {
            logout()
            router.push('/')
          }}
          className="w-full p-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </div>
  )
}