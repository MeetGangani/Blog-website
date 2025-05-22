import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useState, useEffect, useCallback } from 'react';
import './TiptapEditor.css';

const MenuBar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const setLink = useCallback(() => {
    if (!linkUrl) return;
    
    // Empty
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    // Update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    
    // Reset
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!imageUrl) return;
    
    editor.chain().focus().setImage({ src: imageUrl }).run();
    
    // Reset
    setImageUrl('');
    setShowImageInput(false);
  }, [editor, imageUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-menubar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${editor.isActive('bold') ? 'is-active' : ''}`}
        type="button"
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${editor.isActive('italic') ? 'is-active' : ''}`}
        type="button"
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
        type="button"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
        type="button"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
        type="button"
      >
        H3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${editor.isActive('bulletList') ? 'is-active' : ''}`}
        type="button"
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${editor.isActive('orderedList') ? 'is-active' : ''}`}
        type="button"
      >
        Ordered List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`${editor.isActive('codeBlock') ? 'is-active' : ''}`}
        type="button"
      >
        Code Block
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${editor.isActive('blockquote') ? 'is-active' : ''}`}
        type="button"
      >
        Blockquote
      </button>
      <button
        onClick={() => setShowLinkInput(!showLinkInput)}
        className={`${editor.isActive('link') ? 'is-active' : ''}`}
        type="button"
      >
        Link
      </button>
      {showLinkInput && (
        <div className="link-input-wrapper">
          <input
            type="text"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="link-input"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setLink();
              }
            }}
          />
          <button onClick={setLink} type="button">
            Add
          </button>
        </div>
      )}
      <button
        onClick={() => setShowImageInput(!showImageInput)}
        type="button"
      >
        Image
      </button>
      {showImageInput && (
        <div className="link-input-wrapper">
          <input
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="link-input"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
          />
          <button onClick={addImage} type="button">
            Add
          </button>
        </div>
      )}
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="hover:bg-gray-100"
        type="button"
      >
        Horizontal Rule
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="hover:bg-gray-100"
        type="button"
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="hover:bg-gray-100"
        type="button"
      >
        Redo
      </button>
    </div>
  );
};

const TiptapEditor = ({ value, onChange, placeholder, className }) => {
  const [htmlValue, setHtmlValue] = useState(value || '');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: htmlValue,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlValue(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== htmlValue) {
      // Only update content if the value prop changes
      editor.commands.setContent(value || '');
      setHtmlValue(value || '');
    }
  }, [value, editor]);

  return (
    <div className={`tiptap-wrapper ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor; 