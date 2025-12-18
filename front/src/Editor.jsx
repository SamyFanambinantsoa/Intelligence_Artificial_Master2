import React, { forwardRef, useLayoutEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const Editor = forwardRef(
  ({ readOnly = false, defaultValue, onTextChange }, ref) => {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorDiv = document.createElement('div');
      container.appendChild(editorDiv);

      const quill = new Quill(editorDiv, {
        theme: 'snow',
        readOnly,
        modules: {
          toolbar: true
        }
      });

      // 🔑 Exposer l'instance à App.jsx
      ref.current = quill;

      if (defaultValue) {
        quill.setContents(defaultValue);
      }

      if (onTextChange) {
        quill.on('text-change', onTextChange);
      }

      return () => {
        ref.current = null;
        container.innerHTML = '';
      };
    }, [ref]);

    return (
      <div
        ref={containerRef}
        style={{
          height: '300px',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />
    );
  }
);

Editor.displayName = 'Editor';
export default Editor;
