import React, { useRef, useState, useEffect } from 'react';
import Editor from './Editor';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const Delta = Quill.import('delta');

const autocompleteDict = [
  "manoratra",
  "manampy",
  "mandroso",
  "manao",
  "mianatra",
  "miasa",
  "mahita",
  "malagasy",
  "misaotra"
];

const App = () => {
  const quillRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    suggestions: [],
    wordIndex: 0,
    wordLength: 0
  });

  /* 🔹 Mot courant */
  const getCurrentWord = () => {
    const quill = quillRef.current;
    if (!quill) return null;

    const selection = quill.getSelection();
    if (!selection) return null;

    const text = quill.getText(0, selection.index);
    const match = text.match(/([a-zA-Z\u00C0-\u017F]+)$/);
    if (!match) return null;

    return {
      word: match[1],
      index: selection.index - match[1].length,
      length: match[1].length
    };
  };

  /* 🔹 Suggestions */
  const getSuggestions = (prefix) => {
    if (!prefix) return [];
    return autocompleteDict
      .filter(w => w.startsWith(prefix))
      .slice(0, 5);
  };

  /* 🔹 Appliquer suggestion */
  const applySuggestion = (suggestion, index, length) => {
    const quill = quillRef.current;
    if (!quill) return;

    quill.deleteText(index, length);
    quill.insertText(index, suggestion + ' ');
    quill.setSelection(index + suggestion.length + 1);

    setTooltip(prev => ({ ...prev, show: false }));
    setActiveIndex(0);
  };

  /* 🔹 Mise à jour tooltip */
  const handleTextChange = () => {
    const quill = quillRef.current;
    if (!quill) return;

    const current = getCurrentWord();
    if (!current) {
      setTooltip(prev => ({ ...prev, show: false }));
      return;
    }

    const suggestions = getSuggestions(current.word.toLowerCase());
    if (suggestions.length === 0) {
      setTooltip(prev => ({ ...prev, show: false }));
      return;
    }

    const bounds = quill.getBounds(current.index + current.length);
    const editorRect = quill.root.getBoundingClientRect();

    setTooltip({
      show: true,
      x: editorRect.left + bounds.left + bounds.width + 5,
      y: editorRect.top + bounds.top,
      suggestions,
      wordIndex: current.index,
      wordLength: current.length
    });
  };

  /* 🔹 Clavier ↑ ↓ Enter */
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const handleKeyDown = (e) => {
      if (!tooltip.show) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % tooltip.suggestions.length);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i =>
          (i - 1 + tooltip.suggestions.length) % tooltip.suggestions.length
        );
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(
          tooltip.suggestions[activeIndex],
          tooltip.wordIndex,
          tooltip.wordLength
        );
      }
    };

    quill.root.addEventListener('keydown', handleKeyDown);
    quill.on('text-change', handleTextChange);

    return () => {
      quill.root.removeEventListener('keydown', handleKeyDown);
      quill.off('text-change', handleTextChange);
    };
  }, [tooltip, activeIndex]);

  return (
    <div style={{ position: 'relative', padding: 20 }}>
      <h2>🧠 Éditeur Malagasy – Autocomplétion</h2>

      <Editor
        ref={quillRef}
        defaultValue={new Delta().insert('salama ')}
      />

      {/* 🔹 Suggestions */}
      {tooltip.show && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y,
            left: tooltip.x,
            background: '#1e1e1e',
            color: 'white',
            padding: '6px',
            borderRadius: '6px',
            fontSize: '14px',
            zIndex: 1000,
            minWidth: '140px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}
        >
          {tooltip.suggestions.map((s, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault(); // ⭐ essentiel pour Quill
                applySuggestion(
                  s,
                  tooltip.wordIndex,
                  tooltip.wordLength
                );
              }}
              style={{
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '4px',
                background:
                  i === activeIndex ? '#2563eb' : 'transparent'
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;