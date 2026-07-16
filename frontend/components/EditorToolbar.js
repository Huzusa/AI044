'use client'

import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo
} from 'lucide-react'

const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-md transition-all duration-150 flex items-center justify-center
      ${isActive 
        ? 'bg-blue-100 text-blue-600 shadow-sm' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      hover:scale-105 active:scale-95`}
    type="button"
  >
    {children}
  </button>
)

const Divider = () => (
  <div className="w-px h-6 bg-gray-200 mx-1" />
)

export default function EditorToolbar({ editor }) {
  if (!editor) return null

  const handleToggleHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border border-gray-200 rounded-t-lg
      backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      
      <ToolbarButton 
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="撤销"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton 
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="重做"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => handleToggleHeading(1)}
        isActive={editor.isActive('heading', { level: 1 })}
        title="标题 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => handleToggleHeading(2)}
        isActive={editor.isActive('heading', { level: 2 })}
        title="标题 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => handleToggleHeading(3)}
        isActive={editor.isActive('heading', { level: 3 })}
        title="标题 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="加粗 (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="斜体 (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="下划线 (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="无序列表"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="有序列表"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="引用"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="分隔线"
      >
        <Minus className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}