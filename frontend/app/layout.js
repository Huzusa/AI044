import './globals.css'
import Providers from './providers'

export const metadata = {
  title: '墨染 · AI 写作工坊',
  description: 'AI辅助的全流程写作工具，从构思到完成，AI全程陪伴',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
