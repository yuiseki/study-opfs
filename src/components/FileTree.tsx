import React, { useState, useRef, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import type { FileSystemItem } from '../types/FileSystem';

interface FileTreeProps {
  root: FileSystemItem | null;
  onFileSelect: (file: FileSystemFileHandle) => void;
  onDeleteItem: (item: FileSystemItem) => void;
  onRenameItem: (item: FileSystemItem, newName: string) => void;
  onCreateDirectory: (parent: FileSystemDirectoryHandle, name: string) => void;
}

interface TreeNodeProps {
  item: FileSystemItem;
  onFileSelect: (file: FileSystemFileHandle) => void;
  onDeleteItem: (item: FileSystemItem) => void;
  onRenameItem: (item: FileSystemItem, newName: string) => void;
  onCreateDirectory: (parent: FileSystemDirectoryHandle, name: string) => void;
  level: number;
  selectedItem: FileSystemItem | null;
  setSelectedItem: (item: FileSystemItem | null) => void;
}

function TreeNode({
  item,
  onFileSelect,
  onDeleteItem,
  onRenameItem,
  onCreateDirectory,
  level,
  selectedItem,
  setSelectedItem,
}: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const isFolder = item.kind === 'directory';
  const nodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isSelected = selectedItem?.handle === item.handle;

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(item.handle as FileSystemFileHandle);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(item);
    setShowContextMenu(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleRename = () => {
    setIsRenaming(true);
    setShowContextMenu(false);
  };

  const handleRenameSubmit = () => {
    if (newName && newName !== item.name) {
      onRenameItem(item, newName);
    }
    setIsRenaming(false);
  };

  const handleNewFolder = () => {
    setShowContextMenu(false);
    const name = window.prompt('Enter folder name:');
    if (name) {
      onCreateDirectory(item.handle as FileSystemDirectoryHandle, name);
    }
  };

  const contextMenuItems = [
    ...(isFolder ? [{ label: 'New Folder', onClick: handleNewFolder }] : []),
    { label: 'Rename', onClick: handleRename },
    {
      label: 'Delete',
      onClick: () => {
        setShowContextMenu(false);
        onDeleteItem(item);
      },
    },
  ];

  if (!item.parent && item.kind === 'directory') {
    // Remove delete option for root directory
    contextMenuItems.pop();
  }

  return (
    <div>
      <div
        ref={nodeRef}
        className={`flex items-center px-2 py-1 cursor-pointer ${
          level > 0 ? 'ml-4' : ''
        } ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center flex-1">
          {isFolder && (
            <span className="mr-1">
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {isFolder ? (
            <Folder className="w-4 h-4 text-blue-500 mr-2" />
          ) : (
            <File className="w-4 h-4 text-gray-500 mr-2" />
          )}
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              className="flex-1 px-1 py-0 text-sm border rounded"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm">{item.name}</span>
          )}
        </div>
      </div>
      {showContextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
        />
      )}
      {isFolder && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeNode
              key={child.name}
              item={child}
              onFileSelect={onFileSelect}
              onDeleteItem={onDeleteItem}
              onRenameItem={onRenameItem}
              onCreateDirectory={onCreateDirectory}
              level={level + 1}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  root,
  onFileSelect,
  onDeleteItem,
  onRenameItem,
  onCreateDirectory,
}: FileTreeProps) {
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);

  if (!root) return null;

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 overflow-auto">
      <TreeNode
        item={root}
        onFileSelect={onFileSelect}
        onDeleteItem={onDeleteItem}
        onRenameItem={onRenameItem}
        onCreateDirectory={onCreateDirectory}
        level={0}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
    </div>
  );
}