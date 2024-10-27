import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import type { EditorFile } from '../types/FileSystem';

interface EditorProps {
  file: EditorFile | null;
  onSave: (content: string) => void;
}

export function Editor({ file, onSave }: EditorProps) {
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setIsDirty(false);
    }
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) {
          onSave(content);
          setIsDirty(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, isDirty, onSave]);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a file to edit
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-sm font-medium text-gray-700">{file.name}</h2>
        <button
          className={`p-1 rounded ${
            isDirty
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => {
            if (isDirty) {
              onSave(content);
              setIsDirty(false);
            }
          }}
          disabled={!isDirty}
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
      <textarea
        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsDirty(true);
        }}
        spellCheck={false}
      />
    </div>
  );
}