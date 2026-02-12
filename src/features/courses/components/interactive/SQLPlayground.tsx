import React, { useState } from 'react';
import { Database, Play } from 'lucide-react';

export const SQLPlayground: React.FC = () => {
  const [query, setQuery] = useState('SELECT * FROM users WHERE active = 1;');
  const [results, setResults] = useState<any[] | null>(null);

  const runQuery = () => {
    // Mock results
    setResults([
      { id: 1, name: 'Alice Smith', role: 'admin', active: 1 },
      { id: 4, name: 'Bob Jones', role: 'student', active: 1 },
      { id: 7, name: 'Charlie Day', role: 'student', active: 1 },
    ]);
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl my-6">
      <div className="p-4 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Database size={16} />
          <span className="font-bold text-sm">SQL Playground</span>
        </div>
        <button 
          onClick={runQuery}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Play size={14} /> Execute
        </button>
      </div>

      <div className="p-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-32 p-4 bg-gray-50 dark:bg-[#2d2d2d] rounded-lg font-mono text-sm border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
        />
      </div>

      {results && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-[#252526] text-gray-500 dark:text-gray-400">
                <tr>
                  {Object.keys(results[0]).map(key => (
                    <th key={key} className="px-6 py-3 font-medium uppercase">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#2d2d2d] text-gray-700 dark:text-gray-300">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs text-center">
            Query executed successfully in 0.03s
          </div>
        </div>
      )}
    </div>
  );
};
