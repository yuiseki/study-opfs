import { useState, useCallback } from 'react';
import type { FileSystemItem, EditorFile } from '../types/FileSystem';

export function useFileSystem() {
  const [root, setRoot] = useState<FileSystemItem | null>(null);
  
  const initializeFileSystem = useCallback(async () => {
    try {
      const dirHandle = await navigator.storage.getDirectory();
      const rootItem: FileSystemItem = {
        name: 'root',
        kind: 'directory',
        handle: dirHandle,
        parent: null,
        children: [],
      };
      await loadDirectory(rootItem);
      setRoot(rootItem);
    } catch (error) {
      console.error('Failed to initialize file system:', error);
    }
  }, []);

  const loadDirectory = async (item: FileSystemItem) => {
    if (item.kind !== 'directory') return;
    const dirHandle = item.handle as FileSystemDirectoryHandle;
    const children: FileSystemItem[] = [];
    
    for await (const entry of dirHandle.values()) {
      const child: FileSystemItem = {
        name: entry.name,
        kind: entry.kind,
        handle: entry,
        parent: dirHandle,
        children: entry.kind === 'directory' ? [] : undefined,
      };
      if (entry.kind === 'directory') {
        await loadDirectory(child);
      }
      children.push(child);
    }
    item.children = children.sort((a, b) => {
      if (a.kind === b.kind) return a.name.localeCompare(b.name);
      return a.kind === 'directory' ? -1 : 1;
    });
  };

  const createFile = async (parentHandle: FileSystemDirectoryHandle, name: string) => {
    try {
      const fileHandle = await parentHandle.getFileHandle(name, { create: true });
      await fileHandle.createWritable().then(writable => writable.close());
      await initializeFileSystem();
      return fileHandle;
    } catch (error) {
      console.error('Failed to create file:', error);
      throw error;
    }
  };

  const createDirectory = async (parentHandle: FileSystemDirectoryHandle, name: string) => {
    try {
      await parentHandle.getDirectoryHandle(name, { create: true });
      await initializeFileSystem();
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw error;
    }
  };

  const readFile = async (fileHandle: FileSystemFileHandle): Promise<EditorFile> => {
    const file = await fileHandle.getFile();
    const content = await file.text();
    return {
      name: fileHandle.name,
      content,
      handle: fileHandle,
    };
  };

  const writeFile = async (fileHandle: FileSystemFileHandle, content: string) => {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  };

  const deleteItem = async (item: FileSystemItem) => {
    try {
      if (!item.parent) {
        throw new Error('Cannot delete root directory');
      }

      if (item.kind === 'directory') {
        const dirHandle = item.handle as FileSystemDirectoryHandle;
        for await (const entry of dirHandle.values()) {
          await item.parent.removeEntry(entry.name, { recursive: true });
        }
      }
      
      await item.parent.removeEntry(item.name, { recursive: true });
      await initializeFileSystem();
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  };

  const renameItem = async (item: FileSystemItem, newName: string) => {
    try {
      if (!item.parent) {
        throw new Error('Cannot rename root directory');
      }

      if (item.kind === 'file') {
        const fileHandle = item.handle as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const content = await file.text();
        const newFileHandle = await item.parent.getFileHandle(newName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        await item.parent.removeEntry(item.name);
      } else {
        const dirHandle = item.handle as FileSystemDirectoryHandle;
        const newDirHandle = await item.parent.getDirectoryHandle(newName, { create: true });
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await (entry as FileSystemFileHandle).getFile();
            const content = await file.text();
            const newFileHandle = await newDirHandle.getFileHandle(entry.name, { create: true });
            const writable = await newFileHandle.createWritable();
            await writable.write(content);
            await writable.close();
          } else {
            await createDirectory(newDirHandle, entry.name);
            const childItem: FileSystemItem = {
              name: entry.name,
              kind: entry.kind,
              handle: entry,
              parent: newDirHandle,
            };
            await renameItem(childItem, entry.name);
          }
        }
        await item.parent.removeEntry(item.name, { recursive: true });
      }
      await initializeFileSystem();
    } catch (error) {
      console.error('Failed to rename item:', error);
      throw error;
    }
  };

  return {
    root,
    initializeFileSystem,
    createFile,
    createDirectory,
    readFile,
    writeFile,
    deleteItem,
    renameItem,
  };
}