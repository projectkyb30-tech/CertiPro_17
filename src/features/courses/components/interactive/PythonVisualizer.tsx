import React, { useState } from 'react';
import { Play } from 'lucide-react';

export const PythonVisualizer: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [code, setCode] = useState('x = 5\ny = 10\nprint(x + y)');

  const runCode = () => {
    setOutput(['> Executing...', '15', '> Process finished with exit code 0']);
  };

  return (
    <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-700 shadow-2xl my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-mono text-sm">main.py</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={runCode}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
          >
            <Play size={12} /> Run
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
        <div className="p-4 font-mono text-sm text-gray-300 border-r border-gray-700">
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent resize-none focus:outline-none font-mono"
            spellCheck={false}
          />
        </div>
        <div className="p-4 bg-[#1e1e1e] font-mono text-sm">
          <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1">Output Terminal</div>
          {output.map((line, i) => (
            <div key={i} className={line.startsWith('>') ? 'text-gray-500' : 'text-white'}>
              {line}
            </div>
          ))}
          {output.length === 0 && <span className="text-gray-600 italic">Ready to execute...</span>}
        </div>
      </div>
    </div>
  );
};
