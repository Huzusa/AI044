'use client'

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-ink-800 mb-2">页面出错了</h2>
      <p className="text-ink-500 mb-6">{error.message || 'Something went wrong'}</p>
      <button
        onClick={() => reset()}
        className="btn-primary"
      >
        刷新重试
      </button>
    </div>
  )
}