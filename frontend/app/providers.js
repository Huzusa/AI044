'use client'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Providers({ children }) {
  return (
    <ConfigProvider locale={zhCN}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </ConfigProvider>
  )
}
