'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button, Input, Tag, Typography, Spin, Row, Col, Space } from 'antd'
import { FileText, PenLine, Eye, CalendarDays, Search, Plus } from '@ant-design/icons'

const { Title, Text } = Typography

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
      const res = await fetch('/api/articles')
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
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch {
      console.error('删除失败')
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
            <Title level={2} className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              我的文章
            </Title>
            <Text type="secondary">管理你创作过的所有内容</Text>
          </div>
          <Link href="/write" passHref>
            <Button type="primary" icon={<Plus />}>
              写新文章
            </Button>
          </Link>
        </div>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card className="!p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <Text type="secondary" className="block text-xs">创作总数</Text>
                <Text strong className="text-2xl">{stats.total} 篇</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="!p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <PenLine className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <Text type="secondary" className="block text-xs">AI 辅助</Text>
                <Text strong className="text-2xl">{stats.withAI} 篇</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="!p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <PenLine className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <Text type="secondary" className="block text-xs">累计字数</Text>
                <Text strong className="text-2xl">{stats.totalWords.toLocaleString()} 字</Text>
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="!p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'all', label: '全部' },
                { id: 'with-ai', label: 'AI 辅助过' },
                { id: 'without-ai', label: '纯手写' },
              ].map((f) => (
                <Tag
                  key={f.id}
                  color={filter === f.id ? 'blue' : 'default'}
                  onClick={() => setFilter(f.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {f.label}
                </Tag>
              ))}
            </div>
            <Input
              placeholder="搜索文章标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<Search />}
              className="w-full sm:w-64"
            />
          </div>
        </Card>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <Text type="secondary">
            {posts.length === 0
              ? '开始你的第一篇创作吧！AI 会在每一步为你提供灵感与建议'
              : '试试切换筛选条件或清空搜索'}
          </Text>
          <Link href="/write" passHref className="ml-4">
            <Button type="primary">开始创作</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <Card key={post.id} className="hover:border-blue-200 transition-colors">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1.5">
                    <Link
                      href={`/article/${post.id}`}
                      passHref
                      className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors truncate"
                    >
                      {post.title}
                    </Link>
                    {(post.ai_summary || post.ai_tags?.length > 0) && (
                      <Tag color="blue">AI 辅助</Tag>
                    )}
                  </div>
                  {post.ai_summary ? (
                    <Text type="secondary" className="text-sm line-clamp-2">
                      {post.ai_summary}
                    </Text>
                  ) : (
                    <Text type="secondary" className="text-sm line-clamp-2">
                      {post.content?.replace(/[#>*\-\n]/g, ' ').slice(0, 120) || '（无内容预览）'}
                    </Text>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(post.created_at).toLocaleDateString('zh-CN')}
                    </span>
                    <span>{post.content?.length || 0} 字</span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Link href={`/article/${post.id}`} passHref>
                    <Button icon={<Eye />}>查看</Button>
                  </Link>
                  <Button
                    danger
                    icon={<PenLine />}
                    onClick={() => deletePost(post.id, post.title)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </Card>
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
    content: '午后三点的阳光穿过梧桐叶，在课桌上投下斑驳的光影...',
    created_at: '2026-07-10T08:30:00Z',
    ai_summary: '作者以十个生活碎片串联起对夏日的细腻观察，从阳光、蝉鸣到冰西瓜的甜，用克制的笔触写出了藏在平凡日常里的温柔。',
    ai_tags: ['生活随笔', '散文诗歌'],
  },
  {
    id: 2,
    title: '读完《百年孤独》后的三天三夜',
    content: '合上书的那个晚上，我做了一个很长的梦...',
    created_at: '2026-07-05T21:10:00Z',
    ai_summary: null,
    ai_tags: [],
  },
  {
    id: 3,
    title: '我为什么开始每天写 300 字',
    content: '三个月前的某个深夜，我突然意识到自己已经很久没有"认真地表达"了...',
    created_at: '2026-06-28T23:45:00Z',
    ai_summary: '作者分享了自己坚持每日写作三个月的真实感受，从"不知道写什么"到"在文字里重新认识自己"。',
    ai_tags: ['生活随笔', '个人成长'],
  },
]
