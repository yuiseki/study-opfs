import React, { useState } from 'react';
import { FilePlus, FolderPlus } from 'lucide-react';

interface ToolbarProps {
  onCreateFile: (name: string) => void;
  onCreateFolder: (name: string) => void;
}

export function Toolbar({ onCreateFile, onCreateFolder }: ToolbarProps) {
  const [showFileInput, setShowFileInput] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSubmit = (type: 'file' | 'folder') => {
    if (!newName) return;
    if (type === 'file') {
      onCreateFile(newName);
    } else {
      onCreateFolder(newName);
    }
    setNewName('');
    setShowFileInput(false);
    setShowFolderInput(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-2 flex items-center space-x-2">
      {showFileInput || showFolderInput ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(showFileInput ? 'file' : 'folder');
              } else if (e.key === 'Escape') {
                setShowFileInput(false);
                setShowFolderInput(false);
                setNewName('');
              }
            }}
            placeholder={`New ${showFileInput ? 'file' : 'folder'} name`}
            autoFocus
          />
        </div>
      ) : (
        <>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => setShowFileInput(true)}
            title="New File"
          >
            <FilePlus className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => setShowFolderInput(true)}
            title="New Folder"
          >
            <FolderPlus className="w-5 h-5 text-gray-600" />
          </button>
        </>
      )}
    </div>
  );
}