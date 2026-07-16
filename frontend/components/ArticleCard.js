'use client'

import Link from 'next/link'
import { Card, Tag, Typography } from 'antd'
import { CalendarDays, User, ChevronRight } from '@ant-design/icons'

const { Text, Title } = Typography

export default function ArticleCard({ article }) {
  const date = new Date(article.created_at).toLocaleDateString('zh-CN')

  return (
    <Link href={`/article/${article.id}`} passHref>
      <Card hoverable className="cursor-pointer group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Title level={4} className="flex-1 line-clamp-2 mb-0">
            {article.title}
          </Title>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
        </div>

        {article.ai_summary && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <Text type="secondary" className="text-xs font-medium text-blue-600 block mb-1">
              AI 摘要
            </Text>
            <Text className="text-sm text-gray-700 line-clamp-2">{article.ai_summary}</Text>
          </div>
        )}

        {!article.ai_summary && (
          <Text type="secondary" className="text-sm line-clamp-3 mb-4 block">
            {article.content.replace(/[#>*\-\n]/g, ' ').slice(0, 150)}...
          </Text>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {date}
          </span>
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {article.author || '匿名作者'}
          </span>
        </div>

        {article.ai_tags && article.ai_tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {article.ai_tags.slice(0, 4).map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </Card>
    </Link>
  )
}
