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

  // 🔹 Récupère le mot courant
  const getCurrentWord = () => {
    const quill = quillRef.current;
    if (!quill) return null;

    const selection = quill.getSelection();
    if (!selection) return null;

    const text = quill.getText(0, selection.index);
    const match = text.match(/([a-zA-Z\u00C0-\u017F]+)$/);
    if (!match) return null;

    return { word: match[1], index: selection.index - match[1].length, length: match[1].length };
  };

  // 🔹 Obtenir suggestions
  const getSuggestions = (prefix) => {
    if (!prefix || prefix.length < 1) return [];
    return autocompleteDict.filter(w => w.startsWith(prefix)).slice(0, 5);
  };

  // 🔹 Appliquer suggestion
  const applySuggestion = (suggestion, wordIndex, wordLength) => {
    const quill = quillRef.current;
    if (!quill) return;

    quill.deleteText(wordIndex, wordLength);
    quill.insertText(wordIndex, suggestion);
    quill.setSelection(wordIndex + suggestion.length);
    setTooltip({ ...tooltip, show: false });
  };

  // 🔹 Mettre à jour tooltip
const handleTextChange = () => {
  const quill = quillRef.current;
  if (!quill) return;

  const current = getCurrentWord();
  if (!current) {
    setTooltip({ ...tooltip, show: false });
    return;
  }

  const suggestions = getSuggestions(current.word.toLowerCase());
  if (suggestions.length === 0) {
    setTooltip({ ...tooltip, show: false });
    return;
  }

  // Récupérer bounds du mot
  const bounds = quill.getBounds(current.index + current.length);

  // Récupérer position absolue du conteneur
  const editorRect = quill.root.getBoundingClientRect();

  setTooltip({
    show: true,
    x: editorRect.left + bounds.left + bounds.width, // position exacte dans la page
    y: editorRect.top + bounds.top,                 // aligné avec la ligne
    suggestions,
    wordIndex: current.index,
    wordLength: current.length
  });
};


 useEffect(() => {
  const quill = quillRef.current;
  if (!quill) return;

  const handleKeyDown = (e) => {
    if (!tooltip.show) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        (prev + 1) % tooltip.suggestions.length
      );
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        (prev - 1 + tooltip.suggestions.length) % tooltip.suggestions.length
      );
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      applySuggestion(
        tooltip.suggestions[activeIndex],
        tooltip.wordIndex,
        tooltip.wordLength
      );
      setTooltip({ ...tooltip, show: false });
      setActiveIndex(0);
    }
  };

  quill.root.addEventListener('keydown', handleKeyDown);

  return () => {
    quill.root.removeEventListener('keydown', handleKeyDown);
  };
}, [tooltip, activeIndex]);
 return (
    <div style={{ position: 'relative', padding: 20 }}>
      <h2>🧠 Éditeur Malagasy – Suggestions Inline à droite</h2>

      <Editor ref={quillRef} defaultValue={new Delta().insert('salama ')} />

     {/* Suggestions */}
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
      display: 'flex',
      flexDirection: 'column',
      fontSize: '14px',
      zIndex: 1000,
      minWidth: '120px'
    }}
  >
    {tooltip.suggestions.map((s, i) => (
      <div
        key={i}
        style={{
          padding: '4px 6px',
          cursor: 'pointer',
          borderRadius: '4px',
          background: i === activeIndex ? '#2563eb' : 'transparent'
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
