import React, { useState, useEffect, useRef } from 'react';
import { Save, FolderOpen, Code, Eye, Undo, Redo, RefreshCw } from 'lucide-react';
import Button from './Button';

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #2563eb; }
    p { margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>Hello, HTML Editor!</h1>
  <p>This is a simple HTML editor with real-time preview. Edit the HTML on the left to see changes reflected on the right.</p>
  <p>Try adding some elements:</p>
  <ul>
    <li>Headers (h1, h2, h3)</li>
    <li>Paragraphs</li>
    <li>Lists</li>
    <li>Images</li>
    <li>Links</li>
  </ul>
</body>
</html>`;

interface EditorState {
  html: string;
  history: string[];
  currentIndex: number;
  fileName: string;
  isDirty: boolean;
}

const Editor: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    html: DEFAULT_HTML,
    history: [DEFAULT_HTML],
    currentIndex: 0,
    fileName: 'untitled.html',
    isDirty: false,
  });
  
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    if (previewRef.current) {
      const previewDocument = previewRef.current.contentDocument;
      if (previewDocument) {
        previewDocument.open();
        previewDocument.write(state.html);
        previewDocument.close();
        const syncScroll = () => {
          if (!editorRef.current) return;
          const previewBody = previewDocument.body;
          const previewScrollTop = previewBody.scrollTop;
          const previewScrollHeight = previewBody.scrollHeight - previewBody.clientHeight;
          const editor = editorRef.current;
          const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
          if (previewScrollHeight > 0 && editorScrollHeight > 0) {
            const ratio = previewScrollTop / previewScrollHeight;
            editor.scrollTop = ratio * editorScrollHeight;
          }
        };
        previewDocument.body.removeEventListener('scroll', syncScroll);
        previewDocument.body.addEventListener('scroll', syncScroll);
      }
    }
  }, [state.html]);
  
  useEffect(() => {
    document.title = `${state.fileName}${state.isDirty ? ' *' : ''} - HTML Editor`;
  }, [state.fileName, state.isDirty]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);
  
  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    
    if (newHtml !== state.html) {
      const newHistory = state.history.slice(0, state.currentIndex + 1);
      newHistory.push(newHtml);
      
      setState({
        ...state,
        html: newHtml,
        history: newHistory,
        currentIndex: newHistory.length - 1,
        isDirty: true,
      });
    }
  };
  
  const handleUndo = () => {
    if (state.currentIndex > 0) {
      setState({
        ...state,
        html: state.history[state.currentIndex - 1],
        currentIndex: state.currentIndex - 1,
        isDirty: true,
      });
    }
  };
  
  const handleRedo = () => {
    if (state.currentIndex < state.history.length - 1) {
      setState({
        ...state,
        html: state.history[state.currentIndex + 1],
        currentIndex: state.currentIndex + 1,
        isDirty: true,
      });
    }
  };
  
  const handleOpen = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setState({
        html: content,
        history: [content],
        currentIndex: 0,
        fileName: file.name,
        isDirty: false,
      });
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSave = () => {
    const blob = new Blob([state.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setState({
      ...state,
      isDirty: false,
    });
  };
  
  const handleFormat = () => {
    try {
      const tempDoc = document.implementation.createHTMLDocument('');
      tempDoc.documentElement.innerHTML = state.html;
      
      const formatted = '<!DOCTYPE html>\n' + tempDoc.documentElement.outerHTML;
      
      setState({
        ...state,
        html: formatted,
        history: [...state.history.slice(0, state.currentIndex + 1), formatted],
        currentIndex: state.currentIndex + 1,
        isDirty: true,
      });
    } catch (error) {
      console.error('Error formatting HTML:', error);
    }
  };
  
  return (
    <div className="flex flex-col h-full" style={{ height: '300vh' }}>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-2">
        <Button onClick={handleOpen} icon={<FolderOpen size={16} />} tooltip="Open File (Ctrl+O)">
          Open
        </Button>
        <Button 
          onClick={handleSave} 
          icon={<Save size={16} />} 
          tooltip="Save File (Ctrl+S)"
          disabled={!state.isDirty}
        >
          Save
        </Button>
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <Button 
          onClick={handleUndo} 
          icon={<Undo size={16} />} 
          tooltip="Undo (Ctrl+Z)"
          disabled={state.currentIndex === 0}
        >
          Undo
        </Button>
        <Button 
          onClick={handleRedo} 
          icon={<Redo size={16} />} 
          tooltip="Redo (Ctrl+Y)"
          disabled={state.currentIndex === state.history.length - 1}
        >
          Redo
        </Button>
        <Button onClick={handleFormat} icon={<RefreshCw size={16} />} tooltip="Format HTML">
          Format
        </Button>
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <Button 
          onClick={() => setViewMode('editor')} 
          icon={<Code size={16} />}
          active={viewMode === 'editor'}
          tooltip="Editor Only"
        >
          Editor
        </Button>
        <Button 
          onClick={() => setViewMode('preview')} 
          icon={<Eye size={16} />}
          active={viewMode === 'preview'}
          tooltip="Preview Only"
        >
          Preview
        </Button>
        <Button 
          onClick={() => setViewMode('split')} 
          icon={<React.Fragment><Code size={16} /><Eye size={16} /></React.Fragment>}
          active={viewMode === 'split'}
          tooltip="Split View"
        >
          Split
        </Button>
        
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400 flex items-center">
          {state.fileName}{state.isDirty ? ' *' : ''}
        </div>
      </div>
      
      <div className={`flex-1 flex ${viewMode === 'split' ? 'flex-col md:flex-row' : 'flex-col'} overflow-hidden`}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'h-[1000vh] md:h-auto md:w-3/5' : 'flex-1'} flex flex-col`}>
            <div className="p-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              HTML Editor
            </div>
            <textarea
              ref={editorRef}
              className="flex-1 w-full p-4 font-mono text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 resize-none outline-none border-none"
              value={state.html}
              onChange={handleEditorChange}
              spellCheck={false}
              data-gramm="false"
            />
          </div>
        )}
        
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'h-[1000vh] md:h-auto md:w-2/5' : 'flex-1'} flex flex-col ${viewMode === 'split' ? 'border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700' : ''}`}>
            <div className="p-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Preview
            </div>
            <div className="flex-1 bg-white">
              <iframe
                ref={previewRef}
                className="w-full h-full border-none"
                title="HTML Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".html,.htm"
        className="hidden"
      />
    </div>
  );
};

export default Editor;