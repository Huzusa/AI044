import Link from 'next/link'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-6xl mb-4">📭</div>
      <h2 className="text-2xl font-bold text-ink-800 mb-2">页面未找到</h2>
      <p className="text-ink-500 mb-6">您访问的页面不存在或已被删除</p>
      <Link href="/" className="btn-secondary inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>
    </div>
  )
}