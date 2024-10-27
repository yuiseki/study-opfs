export interface FileSystemItem {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemHandle;
  parent: FileSystemDirectoryHandle | null;
  children?: FileSystemItem[];
}

export interface EditorFile {
  name: string;
  content: string;
  handle: FileSystemFileHandle;
}