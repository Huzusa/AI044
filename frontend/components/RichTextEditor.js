'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import EditorToolbar from './EditorToolbar'

export default function RichTextEditor({ 
  content, 
  onChange, 
  className = '',
  placeholder = '在这里亲手书写你的故事...'
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const selectedText = editor.getText()
      if (selectedText && selectedText.trim()) {
        window.dispatchEvent(new CustomEvent('editor-text-selected', { detail: selectedText }))
      }
    },
  })

  return (
    <div className={`border border-ink-200 rounded-lg overflow-hidden shadow-sm ${className}`}>
      <EditorToolbar editor={editor} />
      <div className="bg-white">
        <EditorContent 
          editor={editor}
          className="prose prose-lg max-w-none p-4 min-h-[300px] focus:outline-none"
          style={{
            caretColor: '#c0392b',
          }}
        />
      </div>
      <style>{`
        .ProseMirror {
          outline: none !important;
          min-height: 300px;
        }
        .ProseMirror:focus {
          outline: none !important;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #c0392b;
          padding-left: 1em;
          margin: 0.5em 0;
          color: #666;
          font-style: italic;
        }
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 1em 0;
        }
      `}</style>
    </div>
  )
}