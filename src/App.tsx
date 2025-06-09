import React from 'react';
import { Moon, Sun } from 'lucide-react';
import Editor from './components/Editor';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = React.useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 flex flex-col">
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-semibold">HTML Editor</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>
        <main className="flex-1 flex flex-col">
          <Editor />
        </main>
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          <p>HTML Editor with Real-time Preview</p>
        </footer>
      </div>
    </div>
  );
}

export default App;