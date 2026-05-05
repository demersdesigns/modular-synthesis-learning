'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'

interface JournalEditorProps {
  name?: string
  initialContent?: string
}

export interface JournalEditorHandle {
  syncValue: () => void
}

const JournalEditor = forwardRef<JournalEditorHandle, JournalEditorProps>(
  ({ name = 'body', initialContent = '' }, ref) => {
    const hiddenRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
      extensions: [StarterKit],
      content: initialContent,
      onUpdate({ editor }) {
        if (hiddenRef.current) {
          hiddenRef.current.value = editor.getHTML()
        }
      },
    })

    useEffect(() => {
      if (hiddenRef.current) {
        hiddenRef.current.value = initialContent || (editor ? editor.getHTML() : '')
      }
    }, [initialContent, editor])

    useImperativeHandle(ref, () => ({
      syncValue() {
        if (hiddenRef.current && editor) {
          hiddenRef.current.value = editor.getHTML()
        }
      },
    }), [editor])

    return (
      <div className="editor-wrap">
        <div className="editor-toolbar">
          <button
            type="button"
            className={`toolbar-btn${editor?.isActive('bold') ? ' is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            Bold
          </button>
          <button
            type="button"
            className={`toolbar-btn${editor?.isActive('italic') ? ' is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            Italic
          </button>
          <button
            type="button"
            className={`toolbar-btn${editor?.isActive('heading', { level: 2 }) ? ' is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </button>
          <button
            type="button"
            className={`toolbar-btn${editor?.isActive('heading', { level: 3 }) ? ' is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </button>
          <button
            type="button"
            className={`toolbar-btn${editor?.isActive('bulletList') ? ' is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            List
          </button>
          <button
            type="button"
            className={`toolbar-btn${editor?.isActive('orderedList') ? ' is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            Ordered
          </button>
          <button
            type="button"
            className={`toolbar-btn${editor?.isActive('blockquote') ? ' is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            Quote
          </button>
        </div>
        <div className="editor-content">
          <EditorContent editor={editor} />
        </div>
        <input type="hidden" name={name} ref={hiddenRef} defaultValue={initialContent} />
      </div>
    )
  }
)

JournalEditor.displayName = 'JournalEditor'

export default JournalEditor
