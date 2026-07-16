'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, Button, Tag, Typography, Spin, Space } from 'antd'
import { ArrowLeft, CalendarDays, User, Share2 } from '@ant-design/icons'

const { Title, Text } = Typography

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticle()
  }, [params.id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/articles/${params.id}`)
      const data = await res.json()
      setArticle(data.article || mockArticle)
    } catch {
      setArticle(mockArticle)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin size="large" />
      </div>
    )
  }

  if (!article) {
    return (
      <Card className="text-center py-16">
        <Text type="secondary">文章不存在或已被删除</Text>
        <Link href="/" passHref className="ml-4">
          <Button type="primary">返回广场</Button>
        </Link>
      </Card>
    )
  }

  const date = new Date(article.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Button type="text" onClick={() => router.back()} icon={<ArrowLeft />}>
        返回
      </Button>

      <Card className="!p-8 md:!p-12">
        <header className="space-y-5">
          <Title level={1}>{article.title}</Title>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 pb-5 border-b border-gray-100">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {article.author || '匿名作者'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {date}
            </span>
            <Button type="text" icon={<Share2 />} className="ml-auto">
              分享
            </Button>
          </div>
        </header>

        {article.ai_summary && (
          <Card size="small" className="bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-blue-500" />
              <Text strong className="text-blue-600">AI 内容摘要</Text>
              <Text type="secondary" className="text-xs ml-auto">30 秒读完</Text>
            </div>
            <Text className="text-gray-700 leading-relaxed">{article.ai_summary}</Text>
          </Card>
        )}

        <div className="article-content prose prose-lg max-w-none text-gray-800 leading-relaxed mt-6">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <div className="space-y-4">
              <p>
                午后三点的阳光穿过梧桐叶，在课桌上投下斑驳的光影。电风扇吱呀地转着，粉笔灰在光柱里缓缓浮动。
                我趴在桌上，盯着黑板右上角倒计时牌上的数字，心里有一种说不清道不明的情绪——
                既盼着快点结束，又怕结束得太快。
              </p>
              <p>
                同桌用笔戳了戳我，递过来一张纸条，上面写着："毕业那天，你最想做什么？"
                我拿着笔愣了很久，最后在纸条背面写下：<em>"想认真地、一个一个地，记住这些人的脸。"</em>
              </p>
              <Title level={2}>那个夏天的味道</Title>
              <p>
                很多年以后，我还是会在某个瞬间闻到夏天的味道。不是具体的什么气味，
                而是一种混合着冰棒汽水、晒烫的塑胶跑道、和洗完澡后香皂的记忆。
                那个味道一出现，我就知道，自己又回到了十七岁。
              </p>
              <blockquote>
                后来我才明白，那一年我们不是在最好的时光遇见了彼此，而是遇见了彼此，才给了我们最好的时光。
              </blockquote>
              <p>
                毕业典礼那天，我终于认真地看了每一个人的脸。有人笑着笑着就哭了，有人哭着哭着又笑了。
                我没有哭，我只是觉得，好像有什么东西，在我还没准备好的时候，就已经永远地留在了那个夏天。
              </p>
              <Title level={2}>写在十年后</Title>
              <p>
                现在再回头看，当年觉得天大的事，大多已经模糊。反而记得的，都是一些无关紧要的小事：
                早读课上传的小纸条、午休时偷偷看的小说、放学后一起绕远路回家的夕阳。
              </p>
              <p>
                原来青春最珍贵的，从来不是什么惊天动地的大事，而是那些我们以为稀松平常、
                却再也回不去的每一个"今天"。
              </p>
            </div>
          )}
        </div>

        {article.ai_tags && article.ai_tags.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <Text type="secondary" className="block mb-3">AI 分类标签</Text>
            <Space wrap>
              {article.ai_tags.map((tag) => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Link href="/" passHref>
          <Button>继续阅读</Button>
        </Link>
        <Link href="/write" passHref>
          <Button type="primary">我也想写一篇</Button>
        </Link>
      </div>
    </div>
  )
}

const mockArticle = {
  id: 1,
  title: '关于夏天的十个碎片记忆',
  content: '',
  author: '盛夏光年',
  created_at: '2026-07-10T08:30:00Z',
  ai_summary: '作者以细腻的笔触回忆了学生时代最后一个夏天的点点滴滴，从课桌上的阳光、同桌的纸条，到毕业典礼上每个人的脸。文字克制而温柔，在平凡的细节里写出了青春最动人的模样。',
  ai_tags: ['生活随笔', '散文诗歌', '青春回忆'],
}
