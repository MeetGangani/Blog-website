import React, { useRef, useEffect, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// This is a wrapper component that uses refs instead of findDOMNode
const QuillEditor = forwardRef(({ value, onChange, placeholder, modules, theme = 'snow', className = '' }, ref) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  // Create a custom ref to handle ReactQuill operations
  const setEditorRef = (el) => {
    editorRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  };

  return (
    <div ref={containerRef} className={className}>
      {/* We define our own Quill implementation that doesn't rely on findDOMNode */}
      <ReactQuill
        ref={setEditorRef}
        value={value}
        onChange={onChange}
        modules={modules}
        theme={theme}
        placeholder={placeholder}
      />
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor; 