'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, Button, Input, Row, Col, Tag, Typography, Space,
  Collapse, Spin, Alert, message, Progress, Select
} from 'antd'
import {
  Sparkles, Lightbulb, ListChecks, BookMarked, MessageSquareQuote,
  Copy, Save, Eye, TagOutlined, FileText, BookOpen, BrainCircuit,
  Puzzle, Shapes, Check, ClockCircle, Download, Timer, Palette, Link2,
  Zap
} from '@ant-design/icons'
import RichTextEditor from '@/components/RichTextEditor'

const { Title, Text } = Typography
const { Panel } = Collapse
const { Option } = Select

const STRATEGIES = [
  { value: 'draft', label: '自由草稿', color: 'default' },
  { value: 'focus', label: '专注模式', color: 'blue' },
  { value: 'goal', label: '目标写作', color: 'green' },
]

const stripHtml = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default function WritePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [topicInput, setTopicInput] = useState('')
  const [expressInput, setExpressInput] = useState('')
  const [inspirationInput, setInspirationInput] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [savedTags, setSavedTags] = useState([])
  const [savedSummary, setSavedSummary] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [strategy, setStrategy] = useState('draft')
  const [wordGoal, setWordGoal] = useState(1000)
  const [timer, setTimer] = useState(25)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)

  const [sections, setSections] = useState({
    outline: { loading: false, result: null },
    materials: { loading: false, result: null },
    expression: { loading: false, result: null },
    questions: { loading: false, result: null },
    inspiration: { loading: false, result: null },
    analyze: { loading: false, result: null },
    tone: { loading: false, result: null },
    logic: { loading: false, result: null },
    vocabulary: { loading: false, result: null },
    openClose: { loading: false, result: null },
  })

  useEffect(() => {
    const handleSelection = (e) => {
      setSelectedSection(e.detail)
    }
    window.addEventListener('editor-text-selected', handleSelection)
    return () => window.removeEventListener('editor-text-selected', handleSelection)
  }, [])

  useEffect(() => {
    const autoSave = localStorage.getItem('inkscribe-draft')
    if (autoSave) {
      try {
        const draft = JSON.parse(autoSave)
        setTitle(draft.title || '')
        setContent(draft.content || '')
        setAuthor(draft.author || '')
      } catch (e) {
        console.error('Failed to load draft')
      }
    }
  }, [])

  useEffect(() => {
    const saveDraft = () => {
      localStorage.setItem('inkscribe-draft', JSON.stringify({
        title,
        content,
        author,
        savedAt: new Date().toISOString()
      }))
    }
    const timer = setTimeout(saveDraft, 2000)
    return () => clearTimeout(timer)
  }, [title, content, author])

  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerRunning(false)
          message.info('专注时间结束！休息一下吧')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  const textContent = stripHtml(content)
  const wordCount = textContent.length
  const progress = Math.min(100, Math.round((wordCount / wordGoal) * 100))

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const updateSection = (type, updates) => {
    setSections(prev => ({
      ...prev,
      [type]: { ...prev[type], ...updates }
    }))
  }

  const copyResult = (text) => {
    navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  }

  const exportMarkdown = () => {
    let md = `# ${title || '未命名文章'}\n\n`
    md += `> ${author || '匿名作者'}\n\n`
    md += stripHtml(content).replace(/\n/g, '\n\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'article'}.md`
    a.click()
    URL.revokeObjectURL(url)
    message.success('已导出为 Markdown 文件')
  }

  const generateOutline = async () => {
    if (!keywordInput.trim()) return
    updateSection('outline', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywordInput }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('outline', { loading: false, result: data.outline })
      } else {
        updateSection('outline', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch (e) {
      updateSection('outline', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const fetchMaterials = async () => {
    if (!topicInput.trim()) return
    updateSection('materials', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/find-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicInput }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('materials', { loading: false, result: data.materials })
      } else {
        updateSection('materials', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('materials', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const fetchExpressionRefs = async () => {
    const target = expressInput.trim() || selectedSection
    if (!target) return
    updateSection('expression', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/expression-refs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meaning: target }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('expression', { loading: false, result: data.references })
      } else {
        updateSection('expression', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('expression', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const fetchDeepQuestions = async () => {
    const target = selectedSection || textContent
    if (!target.trim()) return
    updateSection('questions', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/deep-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: target, context: textContent }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('questions', { loading: false, result: data.questions })
      } else {
        updateSection('questions', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('questions', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const fetchInspirationFragments = async () => {
    const theme = inspirationInput.trim() || keywordInput.trim() || title || textContent.slice(0, 50)
    if (!theme.trim()) {
      message.warning('请先输入主题关键词，让灵感骰子有方向可掷')
      return
    }
    updateSection('inspiration', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/inspiration-fragments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('inspiration', { loading: false, result: data.fragments })
      } else {
        updateSection('inspiration', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('inspiration', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const analyzeArticle = async () => {
    if (!title || !textContent.trim()) return
    updateSection('analyze', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/analyze-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: textContent }),
      })
      const data = await res.json()
      if (data.ok) {
        const result = data.analysis
        updateSection('analyze', { loading: false, result })
        setSavedTags(result.tags || [])
        setSavedSummary(result.summary || '')
      } else {
        updateSection('analyze', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('analyze', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const analyzeTone = async () => {
    if (!textContent.trim()) return
    updateSection('tone', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/analyze-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textContent }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('tone', { loading: false, result: data.tone })
      } else {
        updateSection('tone', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('tone', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const checkLogic = async () => {
    if (!textContent.trim()) return
    updateSection('logic', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/check-logic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textContent }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('logic', { loading: false, result: data.logic })
      } else {
        updateSection('logic', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('logic', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const vocabularyUpgrade = async () => {
    const target = selectedSection || textContent
    if (!target.trim()) return
    updateSection('vocabulary', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/vocabulary-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: target }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('vocabulary', { loading: false, result: data.upgrade })
      } else {
        updateSection('vocabulary', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('vocabulary', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const suggestOpenClose = async () => {
    if (!title || !textContent.trim()) return
    updateSection('openClose', { loading: true, result: null })
    try {
      const res = await fetch('/api/ai/suggest-open-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: textContent }),
      })
      const data = await res.json()
      if (data.ok) {
        updateSection('openClose', { loading: false, result: data.result })
      } else {
        updateSection('openClose', { loading: false, result: null })
        message.error('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('openClose', { loading: false, result: null })
      message.error('网络错误：无法连接到后端服务')
    }
  }

  const publishArticle = async () => {
    if (!title.trim() || !textContent.trim()) {
      message.warning('请填写标题和正文内容')
      return
    }
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          author: author || '匿名作者',
          ai_summary: savedSummary,
          ai_tags: savedTags,
        }),
      })
      const data = await res.json()
      const id = data.article?.id || Date.now()
      message.success('发布成功！')
      localStorage.removeItem('inkscribe-draft')
      router.push(`/my/posts`)
    } catch {
      message.success('发布成功（模拟模式）！')
      localStorage.removeItem('inkscribe-draft')
      router.push(`/my/posts`)
    }
  }

  const renderOutlineResult = (result) => (
    <div className="space-y-2">
      {result.map((item, i) => (
        <div key={i} className="border-l-2 border-blue-400 pl-3">
          <Text strong>{i + 1}. {item.title}</Text>
          <Text type="secondary" className="block text-sm mt-1">{item.hint}</Text>
        </div>
      ))}
    </div>
  )

  const renderMaterialsResult = (result) => (
    <div className="space-y-3">
      {result.background && (
        <Card size="small" title={<span><BookOpen style={{ marginRight: 8 }} />背景常识</span>}>
          <ul className="space-y-1">
            {result.background.map((b, i) => <li key={i} className="text-sm">• {b}</li>)}
          </ul>
        </Card>
      )}
      {result.quotes && (
        <Card size="small" title={<span><MessageSquareQuote style={{ marginRight: 8 }} />可引用观点</span>}>
          <ul className="space-y-2">
            {result.quotes.map((q, i) => (
              <li key={i} className="text-sm italic text-gray-600">"{q.text}" — {q.source}</li>
            ))}
          </ul>
        </Card>
      )}
      {result.data_points && (
        <Card size="small" title={<span><TagOutlined style={{ marginRight: 8 }} />关键数据</span>}>
          <ul className="space-y-1">
            {result.data_points.map((d, i) => (
              <li key={i} className="text-sm"><Text strong>{d.value}</Text> — {d.desc}</li>
            ))}
          </ul>
        </Card>
      )}
      {result.references && result.references.length > 0 && (
        <Card size="small" title={<span><Link2 style={{ marginRight: 8 }} />参考来源</span>}>
          <ul className="space-y-2">
            {result.references.slice(0, 5).map((r, i) => (
              <li key={i} className="text-sm">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {r.title}
                </a>
                {r.summary && <Text type="secondary" className="block">{r.summary}</Text>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )

  const renderExpressionResult = (result) => (
    <div className="space-y-2">
      <Alert
        message="结构参考，不是可复制的成品句"
        type="info"
        showIcon
        size="small"
        className="mb-3"
      />
      {result.map((ref, i) => (
        <Card size="small" key={i}>
          <div className="flex items-center gap-2 mb-2">
            <Tag color="blue">角度 {i + 1}</Tag>
            <Text strong>{ref.angle}</Text>
          </div>
          <Text type="secondary" className="block text-sm mb-1">思路：{ref.structure}</Text>
          <Text type="secondary" className="text-sm">关键词：{ref.keywords.join('、')}</Text>
        </Card>
      ))}
    </div>
  )

  const renderQuestionsResult = (result) => (
    <ul className="space-y-2">
      {result.map((q, i) => (
        <li key={i} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
          <Text strong className="block">Q{i + 1}. {q.text}</Text>
          <Text type="secondary" className="text-sm mt-1">💡 {q.why}</Text>
        </li>
      ))}
    </ul>
  )

  const renderInspirationResult = (result) => (
    <div className="space-y-3">
      <Card size="small" title="👁 感官细节" className="bg-purple-50">
        <ul className="space-y-1">
          {result.sensory.map((s, i) => <li key={i} className="text-sm">• {s}</li>)}
        </ul>
      </Card>
      <Card size="small" title="🎞 微场景" className="bg-blue-50">
        <ul className="space-y-1">
          {result.scenes.map((s, i) => <li key={i} className="text-sm">• {s}</li>)}
        </ul>
      </Card>
      <Card size="small" title="⚡ 微小冲突" className="bg-red-50">
        <ul className="space-y-1">
          {result.conflicts.map((s, i) => <li key={i} className="text-sm">• {s}</li>)}
        </ul>
      </Card>
    </div>
  )

  const renderAnalyzeResult = (result) => (
    <div className="space-y-4">
      <div>
        <Text type="secondary" className="block mb-1">📝 AI 提炼的摘要</Text>
        <Card size="small">{result.summary}</Card>
        <Button type="link" size="small" onClick={() => setSavedSummary(result.summary)} className="mt-1">
          + 采纳此摘要
        </Button>
      </div>
      <div>
        <Text type="secondary" className="block mb-1">🏷 推荐标签</Text>
        <Space wrap>
          {result.tags.map((t) => (
            <Tag
              key={t}
              color={savedTags.includes(t) ? 'blue' : 'default'}
              onClick={() => setSavedTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
              style={{ cursor: 'pointer' }}
            >
              {savedTags.includes(t) && <Check style={{ marginRight: 4 }} />}
              {t}
            </Tag>
          ))}
        </Space>
      </div>
      <div>
        <Text type="secondary" className="block mb-1">✍️ 修改建议</Text>
        <div className="space-y-2">
          {result.suggestions.map((s, i) => (
            <Card size="small" key={i} className="border-l-4 border-amber-400">
              <Text strong className="text-amber-700">{s.title}</Text>
              <Text type="secondary" className="block text-sm mt-1">{s.detail}</Text>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderToneResult = (result) => (
    <div className="space-y-4">
      <Card size="small" className="bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-purple-500" />
          <div>
            <Text strong className="text-lg">{result.tone}</Text>
            <div className="flex gap-2 mt-1">
              {result.emotion.map((e, i) => (
                <Tag key={i} color="purple">{e}</Tag>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Text type="secondary" className="block text-sm mb-1">情绪强度</Text>
          <Progress percent={result.intensity * 10} showInfo={false} strokeColor="#a855f7" />
        </div>
      </Card>
      {result.examples && result.examples.length > 0 && (
        <div>
          <Text type="secondary" className="block mb-2">当前语气示例</Text>
          <Card size="small">
            {result.examples.map((e, i) => (
              <p key={i} className="text-sm italic text-gray-600">"{e}"</p>
            ))}
          </Card>
        </div>
      )}
      <div>
        <Text type="secondary" className="block mb-2">风格建议</Text>
        <div className="space-y-2">
          {result.suggestions.map((s, i) => (
            <Card size="small" key={i}>
              <Text strong>{s.title}</Text>
              <Text type="secondary" className="block text-sm mt-1">{s.detail}</Text>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderLogicResult = (result) => (
    <div className="space-y-4">
      <Card size="small">
        <div className="flex items-center justify-between">
          <span>
            <Text strong>逻辑评分</Text>
            <Text type="secondary" className="ml-2">（{result.structure}）</Text>
          </span>
          <Tag color={result.overall_score >= 7 ? 'green' : result.overall_score >= 4 ? 'orange' : 'red'}>
            {result.overall_score}/10
          </Tag>
        </div>
      </Card>
      {result.strong_points && result.strong_points.length > 0 && (
        <div>
          <Text type="secondary" className="block mb-2">✅ 逻辑亮点</Text>
          <ul className="space-y-1">
            {result.strong_points.map((p, i) => (
              <li key={i} className="text-sm">• {p}</li>
            ))}
          </ul>
        </div>
      )}
      {result.issues && result.issues.length > 0 && (
        <div>
          <Text type="secondary" className="block mb-2">⚠️ 逻辑问题</Text>
          <div className="space-y-2">
            {result.issues.map((issue, i) => (
              <Card size="small" key={i} className="border-l-4 border-red-400">
                <Text strong className="text-red-600">{issue.location}</Text>
                <Text type="secondary" className="block text-sm mt-1">问题：{issue.problem}</Text>
                <Text className="block text-sm mt-1">建议：{issue.suggestion}</Text>
              </Card>
            ))}
          </div>
        </div>
      )}
      {result.transitions && result.transitions.length > 0 && (
        <div>
          <Text type="secondary" className="block mb-2">🔗 过渡建议</Text>
          <ul className="space-y-1">
            {result.transitions.map((t, i) => (
              <li key={i} className="text-sm">• {t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderVocabularyResult = (result) => (
    <div className="space-y-4">
      {result.replacements && result.replacements.length > 0 && (
        <div>
          <Text type="secondary" className="block mb-2">📚 词汇替换建议</Text>
          <div className="space-y-3">
            {result.replacements.map((r, i) => (
              <Card size="small" key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <Tag color="green" className="font-mono">{r.original}</Tag>
                  <Text type="secondary" className="text-sm">→</Text>
                  <Space>
                    {r.suggestions.map((s, j) => (
                      <Tag key={j} color="blue">{s}</Tag>
                    ))}
                  </Space>
                </div>
                <Text type="secondary" className="text-sm mb-1">上下文：{r.context}</Text>
                <Text type="secondary" className="text-sm">理由：{r.reason}</Text>
              </Card>
            ))}
          </div>
        </div>
      )}
      {result.patterns && result.patterns.length > 0 && (
        <div>
          <Text type="secondary" className="block mb-2">🔄 过度使用的词汇模式</Text>
          <ul className="space-y-1">
            {result.patterns.map((p, i) => (
              <li key={i} className="text-sm">• {p}</li>
            ))}
          </ul>
        </div>
      )}
      {result.enhancements && result.enhancements.length > 0 && (
        <div>
          <Text type="secondary" className="block mb-2">✨ 表达技巧建议</Text>
          <ul className="space-y-1">
            {result.enhancements.map((e, i) => (
              <li key={i} className="text-sm">• {e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderOpenCloseResult = (result) => (
    <div className="space-y-4">
      <Card size="small" title="🚪 开头建议">
        <Text type="secondary" className="block mb-3">当前分析：{result.opening.current_analysis}</Text>
        <div className="space-y-3">
          {result.opening.suggestions.map((s, i) => (
            <div key={i} className="border-l-2 border-blue-400 pl-3">
              <Text strong>{s.type}</Text>
              <Text type="secondary" className="block text-sm mt-1 italic">"{s.example}"</Text>
            </div>
          ))}
        </div>
      </Card>
      <Card size="small" title="🏁 结尾建议">
        <Text type="secondary" className="block mb-3">当前分析：{result.closing.current_analysis}</Text>
        <div className="space-y-3">
          {result.closing.suggestions.map((s, i) => (
            <div key={i} className="border-l-2 border-green-400 pl-3">
              <Text strong>{s.type}</Text>
              <Text type="secondary" className="block text-sm mt-1 italic">"{s.example}"</Text>
            </div>
          ))}
        </div>
      </Card>
      {result.connections && result.connections.length > 0 && (
        <Card size="small" title="🔗 首尾呼应建议">
          <ul className="space-y-1">
            {result.connections.map((c, i) => (
              <li key={i} className="text-sm">• {c}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )

  const renderResult = (type, section) => {
    if (!section.result) return null

    const renderers = {
      outline: renderOutlineResult,
      materials: renderMaterialsResult,
      expression: renderExpressionResult,
      questions: renderQuestionsResult,
      inspiration: renderInspirationResult,
      analyze: renderAnalyzeResult,
      tone: renderToneResult,
      logic: renderLogicResult,
      vocabulary: renderVocabularyResult,
      openClose: renderOpenCloseResult,
    }

    const titles = {
      outline: '结构参考方向',
      materials: '相关资料卡片',
      expression: '表达角度参考',
      questions: '深度问题',
      inspiration: '灵感碎片',
      analyze: '内容归纳分析',
      tone: '语气风格分析',
      logic: '逻辑连贯性检查',
      vocabulary: '词汇升级建议',
      openClose: '开头结尾优化',
    }

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Text strong className="text-blue-600">
            <Sparkles style={{ marginRight: 4 }} />
            {titles[type]}
          </Text>
          <Button
            type="text"
            size="small"
            onClick={() => copyResult(JSON.stringify(section.result, null, 2))}
            icon={<Copy />}
          >
            复制
          </Button>
        </div>
        {renderers[type] && renderers[type](section.result)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Alert
        message={<span><Sparkles style={{ marginRight: 8 }} />创作原则 · 请遵守</span>}
        description="AI 仅提供素材、参考、引导，不直接生成可粘贴的文章段落。本文的每一个字都应由你亲手书写。拒绝一键成文，保留真实思考的痕迹。"
        type="info"
        showIcon
      />

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Title level={2} className="flex items-center gap-2 mb-0">
              <Sparkles />
              AI 写作工作台
            </Title>
          </div>
          <Space wrap>
            <Select
              value={strategy}
              onChange={setStrategy}
              style={{ width: 140 }}
              options={STRATEGIES}
              size="small"
            />
            {strategy === 'goal' && (
              <Input
                type="number"
                placeholder="目标字数"
                value={wordGoal}
                onChange={(e) => setWordGoal(parseInt(e.target.value) || 1000)}
                style={{ width: 120 }}
                size="small"
              />
            )}
            {strategy === 'focus' && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="时长(分钟)"
                  value={timer}
                  onChange={(e) => setTimer(parseInt(e.target.value) || 25)}
                  disabled={timerRunning}
                  style={{ width: 100 }}
                  size="small"
                />
                <Button
                  icon={timerRunning ? <ClockCircle /> : <Timer />}
                  onClick={() => {
                    if (timerRunning) {
                      setTimerRunning(false)
                    } else {
                      setTimeLeft(timer * 60)
                      setTimerRunning(true)
                    }
                  }}
                  size="small"
                  type={timerRunning ? 'danger' : 'primary'}
                >
                  {timerRunning ? '暂停' : '开始'}
                </Button>
                <Text strong className="text-lg" style={{ color: timerRunning ? '#1677ff' : '#666' }}>
                  {formatTime(timeLeft)}
                </Text>
              </div>
            )}
            <Button onClick={() => setShowPreview(!showPreview)} icon={<Eye />}>
              {showPreview ? '编辑' : '预览'}
            </Button>
            <Button onClick={exportMarkdown} icon={<Download />} size="small">
              导出 MD
            </Button>
            <Button type="primary" onClick={publishArticle} icon={<Save />}>
              保存文章
            </Button>
          </Space>
        </div>
      </Card>

      {strategy === 'goal' && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">写作进度</span>
            <span className="text-sm font-semibold">
              {wordCount} / {wordGoal} 字
            </span>
          </div>
          <Progress percent={progress} strokeColor="#1677ff" />
          {progress >= 100 && (
            <Text type="success" className="mt-2 block">🎉 恭喜！已达成写作目标</Text>
          )}
        </Card>
      )}

      <Row gutter={[24, 24]}>
        <Col lg={16}>
          <Card>
            <div className="space-y-6">
              <div>
                <Text type="secondary" className="block mb-2">
                  <FileText style={{ marginRight: 4 }} />文章标题
                </Text>
                <Input
                  placeholder="给你的文章取个好标题..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size="large"
                  style={{ fontSize: '24px', fontWeight: 'bold', border: 'none', borderBottom: '1px dashed #d9d9d9' }}
                />
              </div>

              <div>
                <Text type="secondary" className="block mb-2">
                  <BookMarked style={{ marginRight: 4 }} />作者署名
                </Text>
                <Input
                  placeholder="作者署名（可选，留空为匿名）"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div>
                <Text type="secondary" className="block mb-3">
                  <BookOpen style={{ marginRight: 4 }} />
                  正文内容（富文本编辑）
                  <span className="ml-2 text-xs">· 共 {wordCount} 字</span>
                </Text>

                {showPreview ? (
                  <Card size="small" style={{ minHeight: '300px' }}>
                    {content ? (
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                      <Text type="secondary">还没有内容，开始写吧</Text>
                    )}
                  </Card>
                ) : (
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="在这里亲手书写你的故事... 选中文本后可使用上方工具栏设置格式。"
                  />
                )}

                {selectedSection && (
                  <Text type="success" className="block mt-2 text-sm">
                    <Check />
                    已选中 {selectedSection.length} 字，右侧可使用「深度反问」「表达参考」「词汇升级」
                  </Text>
                )}
              </div>

              {(savedTags.length > 0 || savedSummary) && (
                <Card size="small" className="mt-4">
                  <Text type="secondary" className="block mb-3">
                    <FileText style={{ marginRight: 4 }} />
                    AI 归纳的文章信息（随文章一同保存）
                  </Text>
                  {savedSummary && (
                    <div className="mb-3">
                      <Text type="secondary" className="block mb-1">内容摘要：</Text>
                      <Text>{savedSummary}</Text>
                    </div>
                  )}
                  {savedTags.length > 0 && (
                    <Space wrap>
                      {savedTags.map((t) => (
                        <Tag key={t} color="blue">
                          <TagOutlined style={{ marginRight: 4 }} />{t}
                        </Tag>
                      ))}
                    </Space>
                  )}
                </Card>
              )}
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Collapse
            defaultActiveKey={[]}
            ghost
            className="space-y-3"
          >
            <Panel
              header={
                <div className="flex items-center gap-2">
                  <Lightbulb />
                  <Text strong>① 结构参考</Text>
                </div>
              }
              key="outline"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">输入关键词，AI 给出文章结构的参考方向</Text>
                <Input
                  placeholder="例：夏日、毕业、告别"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onPressEnter={generateOutline}
                />
                <Button
                  block
                  onClick={generateOutline}
                  disabled={sections.outline.loading || !keywordInput.trim()}
                  icon={sections.outline.loading ? <Spin size="small" /> : <ListChecks />}
                >
                  梳理结构方向
                </Button>
              </Space>
              {renderResult('outline', sections.outline)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <BookOpen />
                  <Text strong>② 联网查资料</Text>
                </div>
              }
              key="materials"
            >
              <Space direction="vertical" className="w-full">
                <Alert
                  message="🔍 联网搜索"
                  description="AI 将搜索真实网络信息，返回背景资料、名言、数据和参考链接"
                  type="info"
                  showIcon
                  size="small"
                />
                <Input
                  placeholder="例：90年代的下岗潮、胡同文化..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onPressEnter={fetchMaterials}
                />
                <Button
                  block
                  onClick={fetchMaterials}
                  disabled={sections.materials.loading || !topicInput.trim()}
                  icon={sections.materials.loading ? <Spin size="small" /> : <Zap />}
                  type="primary"
                >
                  搜索真实资料
                </Button>
              </Space>
              {renderResult('materials', sections.materials)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <Shapes />
                  <Text strong>③ 表达参考</Text>
                </div>
              }
              key="expression"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">输入你想表达的意思（大白话），AI 给 3 种表达角度的句型/词汇搭配参考</Text>
                <Input
                  placeholder="例：我很怀念小时候的夏天"
                  value={expressInput}
                  onChange={(e) => setExpressInput(e.target.value)}
                  onPressEnter={fetchExpressionRefs}
                />
                {selectedSection && !expressInput && (
                  <Text type="secondary" className="text-sm">
                    留空时使用上方选中的 {selectedSection.length} 字内容
                  </Text>
                )}
                <Button
                  block
                  onClick={fetchExpressionRefs}
                  disabled={sections.expression.loading || (!expressInput.trim() && !selectedSection)}
                  icon={sections.expression.loading ? <Spin size="small" /> : <Shapes />}
                >
                  获取表达参考
                </Button>
              </Space>
              {renderResult('expression', sections.expression)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <BrainCircuit />
                  <Text strong>④ 深度反问</Text>
                </div>
              }
              key="questions"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">针对已写内容，AI 提出引导性问题帮你想深想细</Text>
                <Card size="small">
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>❓ 主角此刻的五感（眼耳鼻舌身）分别感受到什么？</li>
                    <li>❓ 如果反方向想，会得出什么结论？</li>
                    <li>❓ 有没有一个具体的小事可以支撑你的观点？</li>
                  </ul>
                </Card>
                <Button
                  block
                  onClick={fetchDeepQuestions}
                  disabled={sections.questions.loading || (!textContent.trim() && !selectedSection)}
                  icon={sections.questions.loading ? <Spin size="small" /> : <BrainCircuit />}
                >
                  向我提问
                </Button>
              </Space>
              {renderResult('questions', sections.questions)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <Puzzle />
                  <Text strong>⑤ 灵感碎片</Text>
                </div>
              }
              key="inspiration"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">卡住了？输入主题，AI 抛出一堆感官细节/微小冲突/场景元素</Text>
                <Input
                  placeholder="例：遗憾、离别、夏天..."
                  value={inspirationInput}
                  onChange={(e) => setInspirationInput(e.target.value)}
                  onPressEnter={fetchInspirationFragments}
                />
                <Button
                  block
                  onClick={fetchInspirationFragments}
                  disabled={sections.inspiration.loading}
                  icon={sections.inspiration.loading ? <Spin size="small" /> : <Puzzle />}
                >
                  掷一把灵感骰子
                </Button>
              </Space>
              {renderResult('inspiration', sections.inspiration)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <Palette />
                  <Text strong>⑥ 语气分析</Text>
                </div>
              }
              key="tone"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">分析文章的语气风格和情绪基调，给出风格优化建议</Text>
                <Button
                  block
                  onClick={analyzeTone}
                  disabled={sections.tone.loading || !textContent.trim()}
                  icon={sections.tone.loading ? <Spin size="small" /> : <Palette />}
                >
                  分析语气风格
                </Button>
              </Space>
              {renderResult('tone', sections.tone)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <Link2 />
                  <Text strong>⑦ 逻辑检查</Text>
                </div>
              }
              key="logic"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">检查文章段落间的逻辑连贯性，找出逻辑断裂点</Text>
                <Button
                  block
                  onClick={checkLogic}
                  disabled={sections.logic.loading || !textContent.trim()}
                  icon={sections.logic.loading ? <Spin size="small" /> : <Link2 />}
                >
                  检查逻辑连贯
                </Button>
              </Space>
              {renderResult('logic', sections.logic)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <BookOpen />
                  <Text strong>⑧ 词汇升级</Text>
                </div>
              }
              key="vocabulary"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">分析文章中的词汇使用，提供更精准、更有表现力的替换建议</Text>
                <Button
                  block
                  onClick={vocabularyUpgrade}
                  disabled={sections.vocabulary.loading || (!textContent.trim() && !selectedSection)}
                  icon={sections.vocabulary.loading ? <Spin size="small" /> : <BookOpen />}
                >
                  词汇升级建议
                </Button>
              </Space>
              {renderResult('vocabulary', sections.vocabulary)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <BookMarked />
                  <Text strong>⑨ 开头结尾</Text>
                </div>
              }
              key="openClose"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">分析当前开头结尾，提供多种优化方向和示例</Text>
                <Button
                  block
                  onClick={suggestOpenClose}
                  disabled={sections.openClose.loading || !textContent.trim() || !title.trim()}
                  icon={sections.openClose.loading ? <Spin size="small" /> : <MessageSquareQuote />}
                >
                  优化开头结尾
                </Button>
              </Space>
              {renderResult('openClose', sections.openClose)}
            </Panel>

            <Panel
              header={
                <div className="flex items-center gap-2">
                  <MessageSquareQuote />
                  <Text strong>⑩ 归纳分析</Text>
                </div>
              }
              key="analyze"
            >
              <Space direction="vertical" className="w-full">
                <Text type="secondary">写完后，AI 基于你写的内容提炼摘要、归纳标签，并给出修改建议</Text>
                <Button
                  block
                  onClick={analyzeArticle}
                  disabled={sections.analyze.loading || !textContent.trim() || !title.trim()}
                  icon={sections.analyze.loading ? <Spin size="small" /> : <MessageSquareQuote />}
                >
                  分析我写的内容
                </Button>
              </Space>
              {renderResult('analyze', sections.analyze)}
            </Panel>
          </Collapse>
        </Col>
      </Row>
    </div>
  )
}
