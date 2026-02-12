import React from 'react';
import { getComponent } from './interactive';
import { SlideDeck } from './interactive/SlideDeck';

interface LessonRendererProps {
  lesson: {
    type: string;
    content?: string | null; // This can be text, JSON config, or component name
    title?: string;
  };
}

export const LessonRenderer: React.FC<LessonRendererProps> = ({ lesson }) => {
  const content = lesson.content || '';
  
  // 1. Interactive React Component
  const Component = React.useMemo(() => {
    if (lesson.type === 'react') {
      return getComponent(content.trim());
    }
    return null;
  }, [lesson.type, content]);

  if (lesson.type === 'react') {
    if (!Component) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          Error: Component "{content}" not found in registry.
        </div>
      );
    }
    return <Component />;
  }

  // 2. Presentation (Slide Deck)
  if (lesson.type === 'presentation') {
    // The content field holds the URL to the JSON config
    // OR it might hold the raw JSON string if small enough (but usually URL)
    const isUrl = content.startsWith('http') || content.startsWith('/uploads');
    
    if (isUrl) {
      return <SlideDeck configUrl={content} />;
    } else {
      // Try to parse raw JSON
      let slideData = null;
      let parseError = false;
      try {
        slideData = JSON.parse(content);
      } catch {
        parseError = true;
      }

      if (parseError) {
        return <div className="text-red-500">Invalid presentation configuration.</div>;
      }
      return <SlideDeck data={slideData} />;
    }
  }

  // 3. Quiz (Placeholder)
  if (lesson.type === 'quiz') {
    return (
      <div className="p-8 bg-blue-50 border border-blue-200 rounded-xl text-center">
        <h3 className="text-xl font-bold text-blue-900 mb-2">Quiz Mode</h3>
        <p className="text-blue-700">Quiz functionality coming soon.</p>
      </div>
    );
  }

  // 4. Code Snippet (Legacy/Static)
  if (lesson.type === 'code') {
    return (
        <div className="bg-[#1e1e1e] p-6 rounded-xl overflow-hidden my-6 border border-gray-700 font-mono text-sm text-gray-300 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-gray-500 border-b border-gray-700 pb-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs">snippet</span>
            </div>
            <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
    );
  }

  // 5. Default: Text / HTML
  return (
    <div className="prose dark:prose-invert max-w-none">
      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
        {content}
      </div>
    </div>
  );
};
