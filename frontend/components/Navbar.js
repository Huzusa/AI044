'use client'

import Link from 'next/link'
import { Menu, Button } from 'antd'
import { Feather, PenLine, Home, BookOpen, User } from '@ant-design/icons'

export default function Navbar() {
  const menuItems = [
    {
      key: '/',
      icon: <PenLine className="w-4 h-4" />,
      label: '写作工作台',
    },
    {
      key: '/my/posts',
      icon: <User className="w-4 h-4" />,
      label: '我的文章',
    },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
              <Feather className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">墨染</span>
            <span className="text-xs text-gray-400 hidden sm:inline">AI 写作工坊</span>
          </Link>

          <Menu
            mode="horizontal"
            items={menuItems}
            className="hidden md:flex flex-1 justify-center"
            style={{ border: 'none' }}
          />

          <Link href="/my/posts" passHref>
            <Button type="primary" icon={<BookOpen className="w-4 h-4" />}>
              <span className="hidden sm:inline">我的文章</span>
            </Button>
          </Link>
        </div>

        <Menu
          mode="horizontal"
          items={menuItems}
          className="md:hidden"
          style={{ border: 'none' }}
        />
      </div>
    </header>
  )
}
