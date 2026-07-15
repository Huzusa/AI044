'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Loader2, Lightbulb, ListChecks,
  BookMarked, MessageSquareQuote, Copy, Check,
  Save, Eye, Tag, FileText, BookOpen,
  BrainCircuit, Puzzle, Shapes, AlertCircle, Hand, ChevronDown, ChevronUp
} from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

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
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [sections, setSections] = useState({
    outline: { loading: false, result: null, expanded: false },
    materials: { loading: false, result: null, expanded: false },
    expression: { loading: false, result: null, expanded: false },
    questions: { loading: false, result: null, expanded: false },
    inspiration: { loading: false, result: null, expanded: false },
    analyze: { loading: false, result: null, expanded: false },
  })

  useEffect(() => {
    const handleSelection = (e) => {
      setSelectedSection(e.detail)
    }
    window.addEventListener('editor-text-selected', handleSelection)
    return () => window.removeEventListener('editor-text-selected', handleSelection)
  }, [])

  const textContent = stripHtml(content)

  const updateSection = (type, updates) => {
    setSections(prev => ({
      ...prev,
      [type]: { ...prev[type], ...updates }
    }))
  }

  const toggleSection = (type) => {
    setSections(prev => ({
      ...prev,
      [type]: { ...prev[type], expanded: !prev[type].expanded }
    }))
  }

  const copyResult = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        updateSection('outline', { loading: false, result: data.outline, expanded: true })
      } else {
        updateSection('outline', { loading: false, result: null, expanded: true })
        alert('AI 服务暂时不可用：' + data.error)
      }
    } catch (e) {
      updateSection('outline', { loading: false, result: null })
      alert('网络错误：无法连接到后端服务')
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
        updateSection('materials', { loading: false, result: data.materials, expanded: true })
      } else {
        updateSection('materials', { loading: false, result: null, expanded: true })
        alert('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('materials', { loading: false, result: null })
      alert('网络错误：无法连接到后端服务')
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
        updateSection('expression', { loading: false, result: data.references, expanded: true })
      } else {
        updateSection('expression', { loading: false, result: null, expanded: true })
        alert('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('expression', { loading: false, result: null })
      alert('网络错误：无法连接到后端服务')
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
        updateSection('questions', { loading: false, result: data.questions, expanded: true })
      } else {
        updateSection('questions', { loading: false, result: null, expanded: true })
        alert('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('questions', { loading: false, result: null })
      alert('网络错误：无法连接到后端服务')
    }
  }

  const fetchInspirationFragments = async () => {
    const theme = inspirationInput.trim() || keywordInput.trim() || title || textContent.slice(0, 50)
    if (!theme.trim()) {
      alert('请先输入主题关键词，让灵感骰子有方向可掷')
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
        updateSection('inspiration', { loading: false, result: data.fragments, expanded: true })
      } else {
        updateSection('inspiration', { loading: false, result: null, expanded: true })
        alert('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('inspiration', { loading: false, result: null })
      alert('网络错误：无法连接到后端服务')
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
        updateSection('analyze', { loading: false, result, expanded: true })
        setSavedTags(result.tags || [])
        setSavedSummary(result.summary || '')
      } else {
        updateSection('analyze', { loading: false, result: null, expanded: true })
        alert('AI 服务暂时不可用：' + data.error)
      }
    } catch {
      updateSection('analyze', { loading: false, result: null })
      alert('网络错误：无法连接到后端服务')
    }
  }

  const publishArticle = async () => {
    if (!title.trim() || !textContent.trim()) {
      alert('请填写标题和正文内容')
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
      alert('发布成功！即将跳转到文章详情')
      router.push(`/article/${id}`)
    } catch {
      alert('发布成功（模拟模式）！即将跳转到文章详情')
      router.push(`/article/${Date.now()}`)
    }
  }

  const SectionResult = ({ type, section }) => {
    if (!section.result) return null

    return (
      <div className={`mt-3 space-y-3 border-t border-ink-100 pt-3 transition-all duration-300 ${section.expanded ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-accent-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {type === 'outline' && '结构参考方向'}
            {type === 'materials' && '相关资料卡片'}
            {type === 'expression' && '表达角度参考'}
            {type === 'questions' && '深度问题'}
            {type === 'inspiration' && '灵感碎片'}
            {type === 'analyze' && '内容归纳分析'}
          </h4>
          <button
            onClick={() => copyResult(JSON.stringify(section.result, null, 2))}
            className="text-ink-400 hover:text-ink-600 p-1"
            title="复制结果"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {type === 'outline' && (
          <ol className="space-y-2 border-l-2 border-accent-200 pl-3">
            {section.result.map((item, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[18px] top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-accent-400" />
                <p className="text-sm font-medium text-ink-700">{item.title}</p>
                <p className="text-xs text-ink-500 mt-0.5">{item.hint}</p>
              </li>
            ))}
          </ol>
        )}

        {type === 'materials' && (
          <div className="space-y-2.5">
            {section.result.background && (
              <div className="p-2.5 rounded-lg bg-white border border-ink-100">
                <p className="text-xs font-semibold text-ink-500 mb-1">📚 背景常识</p>
                <ul className="text-sm text-ink-700 space-y-1">
                  {section.result.background.map((b, i) => <li key={i}>• {b}</li>)}
                </ul>
              </div>
            )}
            {section.result.quotes && (
              <div className="p-2.5 rounded-lg bg-white border border-ink-100">
                <p className="text-xs font-semibold text-ink-500 mb-1">💭 可引用观点</p>
                <ul className="text-sm text-ink-700 space-y-1.5">
                  {section.result.quotes.map((q, i) => (
                    <li key={i} className="italic border-l-2 border-ink-200 pl-2 text-xs">"{q.text}" — {q.source}</li>
                  ))}
                </ul>
              </div>
            )}
            {section.result.data_points && (
              <div className="p-2.5 rounded-lg bg-white border border-ink-100">
                <p className="text-xs font-semibold text-ink-500 mb-1">📊 关键数据</p>
                <ul className="text-sm text-ink-700 space-y-1">
                  {section.result.data_points.map((d, i) => (
                    <li key={i}>• <strong>{d.value}</strong> — {d.desc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {type === 'expression' && (
          <div className="space-y-2">
            <p className="text-xs text-ink-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              以下是结构参考，不是可复制的成品句
            </p>
            {section.result.map((ref, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white border border-ink-100 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-ink-100 text-ink-600">角度 {i + 1}</span>
                  <span className="text-xs font-medium text-accent-600">{ref.angle}</span>
                </div>
                <p className="text-xs text-ink-500">思路：{ref.structure}</p>
                <p className="text-xs text-ink-400">关键词：{ref.keywords.join('、')}</p>
              </div>
            ))}
          </div>
        )}

        {type === 'questions' && (
          <ul className="space-y-2">
            {section.result.map((q, i) => (
              <li key={i} className="p-2.5 rounded-lg bg-white border-l-4 border-accent-400">
                <p className="text-sm text-ink-700">
                  <span className="font-bold text-accent-600 mr-1">Q{i + 1}.</span>
                  {q.text}
                </p>
                <p className="text-xs text-ink-400 mt-1">💡 {q.why}</p>
              </li>
            ))}
          </ul>
        )}

        {type === 'inspiration' && (
          <div className="space-y-2">
            {[
              { key: 'sensory', label: '👁 感官细节', color: 'bg-purple-50 border-purple-200', items: section.result.sensory },
              { key: 'scenes', label: '🎞 微场景', color: 'bg-blue-50 border-blue-200', items: section.result.scenes },
              { key: 'conflicts', label: '⚡ 微小冲突', color: 'bg-red-50 border-red-200', items: section.result.conflicts },
            ].map((cat) => (
              <div key={cat.key} className={`p-2.5 rounded-lg border ${cat.color}`}>
                <p className="text-xs font-semibold text-ink-600 mb-1">{cat.label}</p>
                <ul className="text-sm text-ink-700 space-y-0.5">
                  {cat.items.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {type === 'analyze' && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-ink-500 mb-1">📝 AI 提炼的摘要</p>
              <p className="text-ink-700 p-2.5 bg-white rounded-lg border border-ink-100">{section.result.summary}</p>
              <button onClick={() => setSavedSummary(section.result.summary)} className="mt-1 text-xs text-accent-600 hover:underline">
                + 采纳此摘要
              </button>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500 mb-1">🏷 推荐标签</p>
              <div className="flex flex-wrap gap-1">
                {section.result.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSavedTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}
                    className={`tag-chip ${savedTags.includes(t) ? '!bg-accent-500 !text-white' : ''}`}
                  >
                    {savedTags.includes(t) && <Check className="w-3 h-3 mr-1" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500 mb-1">✍️ 修改建议</p>
              <div className="space-y-1.5">
                {section.result.suggestions.map((s, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white border-l-4 border-amber-400">
                    <p className="text-xs font-medium text-amber-700">{s.title}</p>
                    <p className="text-xs text-ink-600">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Hand className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-0.5">创作原则 · 请遵守</p>
          <p>
            AI 仅提供 <strong>素材、参考、引导</strong>，不直接生成可粘贴的文章段落。
            本文的每一个字都应由你亲手书写。拒绝一键成文，保留真实思考的痕迹 ✍️
          </p>
        </div>
      </div>

      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-500" />
            AI 写作工作台
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            查资料、找灵感、被提问 —— 让 AI 做你的写作研究员
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary !px-4 !py-2 text-sm">
            <Eye className="w-4 h-4" />
            {showPreview ? '编辑' : '预览'}
          </button>
          <button onClick={publishArticle} className="btn-primary !px-4 !py-2 text-sm">
            <Save className="w-4 h-4" />
            发布文章
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card space-y-6 p-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 文章标题
              </label>
              <input
                type="text"
                placeholder="给你的文章取个好标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl sm:text-3xl font-bold !text-ink-800 !border-0 !px-0 !py-3 focus:ring-0 placeholder:!text-ink-300 bg-transparent"
                style={{ borderBottom: '1px dashed #d6d0c1' }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-ink-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" /> 作者署名
              </label>
              <input
                type="text"
                placeholder="作者署名（可选，留空为匿名）"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="input-base text-sm !w-full sm:!max-w-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700 mb-3 block flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-600" />
                正文内容（富文本编辑）
                <span className="text-xs text-ink-400 font-normal">· 共 {textContent.length} 字</span>
              </label>

              {showPreview ? (
                <div className="prose prose-lg max-w-none p-4 bg-ink-50 rounded-lg border border-ink-200">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <span className="text-ink-400">还没有内容，开始写吧</span>
                  )}
                </div>
              ) : (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="在这里亲手书写你的故事... 选中文本后可使用上方工具栏设置格式。"
                />
              )}

              {selectedSection && (
                <p className="text-xs text-accent-600 mt-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  已选中 {selectedSection.length} 字，右侧可使用「深度反问」「表达参考」
                </p>
              )}
            </div>

            {(savedTags.length > 0 || savedSummary) && (
              <div className="p-4 rounded-lg bg-ink-50 space-y-3">
                <p className="text-xs font-semibold text-ink-600 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  AI 归纳的文章信息（随文章一同发布）
                </p>
                {savedSummary && (
                  <div>
                    <p className="text-xs text-ink-500 mb-1">内容摘要：</p>
                    <p className="text-sm text-ink-700">{savedSummary}</p>
                  </div>
                )}
                {savedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {savedTags.map((t) => (
                      <span key={t} className="tag-chip">
                        <Tag className="w-3 h-3 mr-1" />{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent-600">
                <Lightbulb className="w-5 h-5" />
                <h2 className="font-semibold">① 结构参考</h2>
              </div>
              {sections.outline.result && (
                <button onClick={() => toggleSection('outline')} className="text-ink-400 hover:text-ink-600">
                  {sections.outline.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm text-ink-600">
                输入关键词，AI 给出文章结构的<strong>参考方向</strong>：
              </label>
              <input
                type="text"
                placeholder="例：夏日、毕业、告别"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="input-base"
                onKeyDown={(e) => e.key === 'Enter' && generateOutline()}
              />
              <button onClick={generateOutline} disabled={sections.outline.loading} className="btn-secondary w-full justify-center disabled:opacity-60 text-sm">
                {sections.outline.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ListChecks className="w-4 h-4" />
                )}
                梳理结构方向
              </button>
            </div>
            <SectionResult type="outline" section={sections.outline} />
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent-600">
                <BookOpen className="w-5 h-5" />
                <h2 className="font-semibold">② 相关资料</h2>
              </div>
              {sections.materials.result && (
                <button onClick={() => toggleSection('materials')} className="text-ink-400 hover:text-ink-600">
                  {sections.materials.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm text-ink-600">
                想写某个主题但不了解？AI 给出<strong>背景资料与事实</strong>：
              </label>
              <input
                type="text"
                placeholder="例：90年代的下岗潮、胡同文化..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="input-base"
                onKeyDown={(e) => e.key === 'Enter' && fetchMaterials()}
              />
              <button onClick={fetchMaterials} disabled={sections.materials.loading} className="btn-secondary w-full justify-center disabled:opacity-60 text-sm">
                {sections.materials.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
                查找写作资料
              </button>
            </div>
            <SectionResult type="materials" section={sections.materials} />
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent-600">
                <Shapes className="w-5 h-5" />
                <h2 className="font-semibold">③ 表达参考</h2>
              </div>
              {sections.expression.result && (
                <button onClick={() => toggleSection('expression')} className="text-ink-400 hover:text-ink-600">
                  {sections.expression.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm text-ink-600">
                输入你想表达的<strong>意思（大白话）</strong>，AI 给 3 种表达角度的<strong>句型/词汇搭配参考</strong>：
              </label>
              <input
                type="text"
                placeholder={`例：我很怀念小时候的夏天`}
                value={expressInput}
                onChange={(e) => setExpressInput(e.target.value)}
                className="input-base"
                onKeyDown={(e) => e.key === 'Enter' && fetchExpressionRefs()}
              />
              {selectedSection && !expressInput && (
                <p className="text-xs text-ink-400">
                  留空时使用上方选中的 {selectedSection.length} 字内容
                </p>
              )}
              <button onClick={fetchExpressionRefs} disabled={sections.expression.loading || (!expressInput.trim() && !selectedSection)} className="btn-secondary w-full justify-center disabled:opacity-60 text-sm">
                {sections.expression.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shapes className="w-4 h-4" />
                )}
                获取表达参考
              </button>
            </div>
            <SectionResult type="expression" section={sections.expression} />
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent-600">
                <BrainCircuit className="w-5 h-5" />
                <h2 className="font-semibold">④ 深度反问</h2>
              </div>
              {sections.questions.result && (
                <button onClick={() => toggleSection('questions')} className="text-ink-400 hover:text-ink-600">
                  {sections.questions.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm text-ink-600">
                针对已写内容，AI 提出<strong>引导性问题</strong>帮你想深想细：
              </label>
              <div className="p-2.5 rounded-lg bg-ink-50 text-xs text-ink-500 space-y-0.5">
                <p>❓ 主角此刻的<em>五感</em>（眼耳鼻舌身）分别感受到什么？</p>
                <p>❓ 如果<em>反方向</em>想，会得出什么结论？</p>
                <p>❓ 有没有一个<em>具体的小事</em>可以支撑你的观点？</p>
              </div>
              <button onClick={fetchDeepQuestions} disabled={sections.questions.loading || (!textContent.trim() && !selectedSection)} className="btn-secondary w-full justify-center disabled:opacity-60 text-sm">
                {sections.questions.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BrainCircuit className="w-4 h-4" />
                )}
                向我提问
              </button>
            </div>
            <SectionResult type="questions" section={sections.questions} />
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent-600">
                <Puzzle className="w-5 h-5" />
                <h2 className="font-semibold">⑤ 灵感碎片</h2>
              </div>
              {sections.inspiration.result && (
                <button onClick={() => toggleSection('inspiration')} className="text-ink-400 hover:text-ink-600">
                  {sections.inspiration.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm text-ink-600">
                卡住了？输入主题，AI 抛出一堆<strong>感官细节/微小冲突/场景元素</strong>，挑几个融入：
              </label>
              <input
                type="text"
                placeholder="例：遗憾、离别、夏天..."
                value={inspirationInput}
                onChange={(e) => setInspirationInput(e.target.value)}
                className="input-base"
                onKeyDown={(e) => e.key === 'Enter' && fetchInspirationFragments()}
              />
              <button onClick={fetchInspirationFragments} disabled={sections.inspiration.loading} className="btn-secondary w-full justify-center disabled:opacity-60 text-sm">
                {sections.inspiration.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Puzzle className="w-4 h-4" />
                )}
                掷一把灵感骰子
              </button>
            </div>
            <SectionResult type="inspiration" section={sections.inspiration} />
          </div>

          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent-600">
                <BookMarked className="w-5 h-5" />
                <h2 className="font-semibold">⑥ 归纳分析</h2>
              </div>
              {sections.analyze.result && (
                <button onClick={() => toggleSection('analyze')} className="text-ink-400 hover:text-ink-600">
                  {sections.analyze.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm text-ink-600">
                写完后，AI 基于你写的内容<strong>提炼摘要、归纳标签</strong>，并给出修改建议：
              </label>
              <button onClick={analyzeArticle} disabled={sections.analyze.loading || !textContent.trim() || !title.trim()} className="btn-secondary w-full justify-center disabled:opacity-60 text-sm">
                {sections.analyze.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquareQuote className="w-4 h-4" />
                )}
                分析我写的内容
              </button>
            </div>
            <SectionResult type="analyze" section={sections.analyze} />
          </div>
        </div>
      </div>
    </div>
  )
}

const mockOutline = (kw) => [
  { title: `开场画面：与「${kw}」有关的一个具体瞬间`, hint: '别写大道理，从某个感官细节切入，比如气味、声音' },
  { title: '交代背景：那是什么时候、我在哪、和谁', hint: '用 2-3 句交代清楚时空，不要啰嗦' },
  { title: '核心故事：印象最深的那一件小事', hint: '要有冲突或转折，哪怕是内心的冲突' },
  { title: '当时的感受 + 现在回头看的想法', hint: '双线叙述，拉开时间距离，让文章有厚度' },
  { title: '结尾：回到当下，留一个有余味的意象', hint: '可以呼应开头的某个细节，形成闭环' },
]

const mockMaterials = (topic) => ({
  background: [
    `${topic}这一现象/话题，最早可以追溯到较久远的年代，在不同文化中都有类似表达。`,
    `过去20年间，关于${topic}的社会态度发生了显著变化，这与城市化、互联网普及有密切关联。`,
    `心理学研究显示，人们对${topic}的感知往往与童年经历、核心价值观高度相关。`,
  ],
  quotes: [
    { text: `关于${topic}，真正重要的东西用眼睛是看不见的。`, source: '改写自《小王子》' },
    { text: `我们不是因为事情本身而烦恼，而是因为对事情的看法而烦恼。`, source: '爱比克泰德（可迁移到本主题）' },
  ],
  data_points: [
    { value: '约 68%', desc: `的受访者表示曾在某一时期深入思考过「${topic}」相关问题` },
    { value: '3-5 次', desc: `：一个人平均会在人生不同阶段重新审视「${topic}」这个议题` },
  ],
})

const mockExpression = (meaning) => [
  {
    angle: '感官描写切入',
    structure: '先写一个具体的感官印象（气味/触感/声音）→ 再点出这种感觉对应你想表达的意思 → 补一个动作收尾',
    keywords: ['气味', '温度', '声音', '指尖', '忽然', '那个瞬间'],
  },
  {
    angle: '反话 / 自我调侃',
    structure: '先说一句看似相反的自嘲 → "但其实 / 后来我才明白" → 再说出你真正想说的 → 最后轻描淡写带过',
    keywords: ['说来可笑', '我以前一直以为', '其实', '不过是', '罢了'],
  },
  {
    angle: '用具象的物来比喻',
    structure: '找一个日常物品（旧T恤/没关的灯/半杯水）→ 描写这个物品的几个细节 → 每个细节对应你表达的一层意思',
    keywords: ['就像', '好比', '像极了', '正如', '一样'],
  },
]

const mockQuestions = (content) => [
  {
    text: '你写的这段里，如果只保留一个细节让读者记住，你会选哪一个？能不能把那个细节再扩写 2-3 句？',
    why: '检查你是否抓住了核心意象，避免流水账',
  },
  {
    text: '如果把叙述视角切换到另一个当事人（对面的人/旁观者/小时候的自己），他们会看到什么你没写的东西？',
    why: '避免视角单一，帮你发现盲区',
  },
  {
    text: '这段叙述背后，你"没说出口"的真实情绪是什么？是遗憾？愧疚？释然？敢不敢直接写一句出来？',
    why: '很多文章写得"隔"，是因为作者回避了最痛/最真的那句话',
  },
]

const mockInspiration = (theme) => ({
  sensory: [
    '空气里有雨水混合柏油路的味道',
    '冰箱门打开时那盏黄光照亮半张脸',
    '老式电扇转动发出的嗡嗡低频声',
    '指尖翻旧书时纸边的粗糙颗粒感',
  ],
  scenes: [
    '公交车上，两个陌生人同时伸手抓同一根扶手，又同时缩回去',
    '超市货架前，一个小孩举着两样东西犹豫了整整三分钟',
    '深夜阳台对面楼，只剩唯一一盏灯还亮着',
  ],
  conflicts: [
    '嘴上说"随便"，但心里其实有非常明确的想要',
    '明明很感动，却用开玩笑的语气把话题岔开',
    '想开口道歉，最后却变成了一句"吃饭了吗"',
  ],
})

const mockAnalyze = (title, content) => ({
  summary: `本文围绕「${title.slice(0, 8)}」展开叙述，整体基调偏情感化，优点是具体细节选得准，能让读者迅速进入场景。目前大约完成了"发生了什么"，但在"为什么重要"和"对现在的影响"上着墨还不够。`,
  tags: ['生活随笔', '个人成长', '回忆叙事'],
  suggestions: [
    {
      title: '📌 情绪落点可以更清晰',
      detail: '读者读完会产生什么感受？是共鸣、唏嘘、还是释然？建议在倒数第二段用 1-2 句直接点出，不要全靠读者猜。',
    },
    {
      title: '📌 有几处形容词堆砌可精简',
      detail: '数一下你用了多少个"非常/特别/真的/很"，建议把其中 60% 替换成具体的行为或细节（例："非常难过"→"那天我没有吃晚饭"）。',
    },
    {
      title: '📌 开头与结尾可做呼应',
      detail: '开头写了"那个夏天的午后"，结尾不妨再提一次午后/夏天/阳光，但用一个现在时态的句子来收束，形成穿越感。',
    },
  ],
})