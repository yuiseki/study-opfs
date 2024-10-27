import React, { useEffect, useState } from 'react';
import { FileTree } from './components/FileTree';
import { Editor } from './components/Editor';
import { Toolbar } from './components/Toolbar';
import { useFileSystem } from './hooks/useFileSystem';
import type { EditorFile, FileSystemItem } from './types/FileSystem';

function App() {
  const {
    root,
    initializeFileSystem,
    createFile,
    createDirectory,
    readFile,
    writeFile,
    deleteItem,
    renameItem,
  } = useFileSystem();
  const [currentFile, setCurrentFile] = useState<EditorFile | null>(null);

  useEffect(() => {
    initializeFileSystem();
  }, [initializeFileSystem]);

  const handleFileSelect = async (fileHandle: FileSystemFileHandle) => {
    try {
      const file = await readFile(fileHandle);
      setCurrentFile(file);
    } catch (error) {
      console.error('Failed to read file:', error);
      alert('Failed to read file. Please try again.');
    }
  };

  const handleSave = async (content: string) => {
    if (!currentFile) return;
    try {
      await writeFile(currentFile.handle, content);
      setCurrentFile({ ...currentFile, content });
    } catch (error) {
      console.error('Failed to save file:', error);
      alert('Failed to save file. Please try again.');
    }
  };

  const handleCreateFile = async (name: string) => {
    if (!root) return;
    try {
      await createFile(root.handle as FileSystemDirectoryHandle, name);
    } catch (error) {
      console.error('Failed to create file:', error);
      alert('Failed to create file. Please try again.');
    }
  };

  const handleCreateFolder = async (name: string) => {
    if (!root) return;
    try {
      await createDirectory(root.handle as FileSystemDirectoryHandle, name);
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const handleDeleteItem = async (item: FileSystemItem) => {
    try {
      if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
        await deleteItem(item);
        if (currentFile?.handle === item.handle) {
          setCurrentFile(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleRenameItem = async (item: FileSystemItem, newName: string) => {
    try {
      await renameItem(item, newName);
      if (currentFile?.handle === item.handle) {
        setCurrentFile({ ...currentFile, name: newName });
      }
    } catch (error) {
      console.error('Failed to rename item:', error);
      alert('Failed to rename item. Please try again.');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex">
        <div className="w-64 flex flex-col">
          <Toolbar
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
          />
          <div className="flex-1 overflow-auto">
            <FileTree
              root={root}
              onFileSelect={handleFileSelect}
              onDeleteItem={handleDeleteItem}
              onRenameItem={handleRenameItem}
              onCreateDirectory={createDirectory}
            />
          </div>
        </div>
        <Editor file={currentFile} onSave={handleSave} />
      </div>
    </div>
  );
}

export default App;