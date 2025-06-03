'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FolderOpen, Save } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

declare global {
  interface FileSystemDirectoryHandle extends AsyncIterable<FileSystemHandle> {
    entries(): AsyncIterable<[string, FileSystemHandle]>;
  }
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
}

interface FileData {
  path: string;
  content: string;
  handle: FileSystemFileHandle;
}

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  isFile: boolean;
  expanded?: boolean;
}

const buildFileTree = (files: FileData[]): TreeNode[] => {
  const root: TreeNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentLevel = root;

    parts.forEach((part, idx) => {
      let existingNode = currentLevel.find((node) => node.name === part);
      if (!existingNode) {
        existingNode = {
          name: part,
          path: parts.slice(0, idx + 1).join('/'),
          isFile: idx === parts.length - 1,
          expanded: false,
        };
        if (!existingNode.isFile) existingNode.children = [];
        currentLevel.push(existingNode);
      }
      if (!existingNode.isFile && existingNode.children) {
        currentLevel = existingNode.children;
      }
    });
  });

  return root;
};

const EditorPage = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [loading, setLoading] = useState(false);

  const readDirectoryRecursive = async (
    directoryHandle: FileSystemDirectoryHandle,
    path = ''
  ): Promise<FileData[]> => {
    const files: FileData[] = [];
    const anyDirHandle = directoryHandle as any;

    for await (const [name, handle] of anyDirHandle.entries()) {
      if (handle.kind === 'file') {
        const fileHandle = handle as FileSystemFileHandle;
        try {
          const file = await fileHandle.getFile();
          const content = await file.text();
          files.push({ path: path + name, content, handle: fileHandle });
        } catch {
          // ignore read errors
        }
      } else if (handle.kind === 'directory') {
        const nestedFiles = await readDirectoryRecursive(handle as FileSystemDirectoryHandle, path + name + '/');
        files.push(...nestedFiles);
      }
    }

    return files;
  };

  const pickDirectory = async () => {
    if (!window.showDirectoryPicker) {
      alert('Directory picker not supported in this browser.');
      return;
    }

    setLoading(true);
    try {
      const handle = await window.showDirectoryPicker();
      setDirHandle(handle);
      const allFiles = await readDirectoryRecursive(handle);

      if (allFiles.length === 0) {
        alert('Selected folder contains no readable files.');
        setFiles([]);
        setFileTree([]);
        setSelectedFile(null);
        setContent('');
        setSaved(true);
      } else {
        setFiles(allFiles);
        setFileTree(buildFileTree(allFiles));
        setSelectedFile(allFiles[0]);
        setContent(allFiles[0].content);
        setSaved(true);
      }
    } catch (err) {
      console.warn('Directory picking cancelled or failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSelectFile = (path: string) => {
    const file = files.find((f) => f.path === path);
    if (file) {
      setSelectedFile(file);
      setContent(file.content);
      setSaved(true);
    }
  };

  const onChangeContent = (value: string | undefined) => {
    setContent(value ?? '');
    setSaved(false);
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    try {
      const writable = await selectedFile.handle.createWritable();
      await writable.write(content);
      await writable.close();

      const updatedFiles = files.map((file) =>
        file.path === selectedFile.path ? { ...file, content } : file
      );
      setFiles(updatedFiles);
      setSaved(true);
      alert('File saved successfully!');
    } catch (err) {
      alert('Failed to save file: ' + err);
    }
  };

  const toggleNode = (path: string) => {
    const toggleRecursive = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        if (node.path === path) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: toggleRecursive(node.children) };
        }
        return node;
      });

    setFileTree((prev) => toggleRecursive(prev));
  };

  const renderTree = (nodes: TreeNode[]): React.ReactElement[] =>
    nodes.map((node) => (
      <div key={node.path} className="ml-2">
        <div
          onClick={() => {
            if (node.isFile) {
              onSelectFile(node.path);
            } else {
              toggleNode(node.path);
            }
          }}
          className={`cursor-pointer select-none p-1 rounded transition-colors duration-150 ${
            selectedFile?.path === node.path
              ? 'bg-blue-600 text-white'
              : 'hover:bg-blue-500 hover:text-white'
          }`}
        >
          {node.isFile ? '📄 ' : node.expanded ? '📂 ' : '📁 '}
          {node.name}
        </div>
        {!node.isFile && node.expanded && node.children && (
          <div className="ml-4 border-l border-gray-700 pl-2">
            {renderTree(node.children)}
          </div>
        )}
      </div>
    ));

  return (
    <main className="flex min-h-screen bg-[#0e1a2b] text-white">
      <aside className="w-64 p-4 border-r border-gray-700 flex flex-col gap-4">
        <button
          onClick={pickDirectory}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded bg-blue-700 hover:bg-blue-800 disabled:opacity-50"
        >
          <FolderOpen size={18} />
          {loading ? 'Loading...' : 'Open Folder'}
        </button>
        <div className="overflow-auto flex-1 bg-[#14213d] rounded p-2">
          {renderTree(fileTree)}
        </div>
      </aside>

      <section className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            {selectedFile?.path || 'No file selected'}
          </h2>
          <button
            onClick={saveFile}
            disabled={saved || !selectedFile}
            className="flex items-center gap-2 px-3 py-2 rounded bg-green-700 hover:bg-green-800 disabled:opacity-50"
          >
            <Save size={18} />
            Save
          </button>
        </div>

        {selectedFile ? (
          <div className="flex-1 overflow-hidden rounded-xl border border-neutral-800 shadow-inner">
<MonacoEditor
  height="100%"
  defaultLanguage="typescript"
  theme="custom-dark"
  value={content}
  onChange={onChangeContent}
  options={{
    fontSize: 14,
    minimap: { enabled: false },
    wordWrap: 'on',
  }}
  onMount={(editor, monaco) => {
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', background: '0e1a2b', foreground: 'ffffff' },
        { token: 'comment', foreground: '6272a4' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'function', foreground: '50fa7b' },
      ],
      colors: {
        'editor.background': '#0e1a2b',
        'editor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#14213d80',
        'editorCursor.foreground': '#ffffff',
        'editorLineNumber.foreground': '#5c6773',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#14213d',
      },
    });
    monaco.editor.setTheme('custom-dark');
  }}
/>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a file to start editing
          </div>
        )}
      </section>
    </main>
  );
};

export default EditorPage;
