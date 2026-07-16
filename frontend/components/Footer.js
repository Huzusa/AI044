'use client'

import { Typography } from 'antd'
import { Feather, Heart, Sparkles } from '@ant-design/icons'

const { Text } = Typography

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-blue-500" />
            <Text strong className="text-gray-700">墨染 · AI 写作工坊</Text>
          </div>
          <Text type="secondary" className="text-sm flex items-center gap-1.5">
            用 <Sparkles className="w-3.5 h-3.5 text-blue-500" /> 辅助创作，用 <Heart className="w-3.5 h-3.5 text-red-500" /> 书写真心
          </Text>
          <Text type="secondary" className="text-xs">
            AI辅助编程实训项目 © 2026
          </Text>
        </div>
      </div>
    </footer>
  )
}
