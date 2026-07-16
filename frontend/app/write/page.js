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
import { useAuth } from '@/context/AuthContext'
import {
  generateOutline as apiGenerateOutline,
  findMaterials as apiFindMaterials,
  expressionRefs as apiExpressionRefs,
  deepQuestions as apiDeepQuestions,
  inspirationFragments as apiInspirationFragments,
  analyzeArticle as apiAnalyzeArticle,
  createArticle as apiCreateArticle
} from '@/utils/api'

const stripHtml = (html) => {
  if (typeof window === 'undefined') return html || ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default function WritePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
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
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

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
      const { data } = await apiGenerateOutline(keywordInput)
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
      const { data } = await apiFindMaterials(topicInput)
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
      const { data } = await apiExpressionRefs(target)
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
      const { data } = await apiDeepQuestions(target, textContent)
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
      const { data } = await apiInspirationFragments(theme)
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
      const { data } = await apiAnalyzeArticle(title, textContent)
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
      const { result } = await apiCreateArticle({
        title,
        content,
        author: author || '匿名作者',
        ai_summary: savedSummary,
        ai_tags: savedTags,
      })
      if (result.ok && result.article?.id) {
        alert('保存成功！即将跳转到文章详情')
        router.push(`/article/${result.article.id}`)
      } else {
        alert('保存失败：' + (result.error || '未知错误'))
      }
    } catch (e) {
      alert('保存失败：无法连接到服务器')
      console.error(e)
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
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
            保存文章
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
