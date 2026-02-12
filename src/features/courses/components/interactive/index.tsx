import React from 'react';
import { PythonVisualizer } from './PythonVisualizer';
import { SQLPlayground } from './SQLPlayground';
import { SlideDeck } from './SlideDeck';

// Registry of available interactive components
export const ComponentRegistry: Record<string, React.FC<any>> = {
  'PythonVisualizer': PythonVisualizer,
  'SQLPlayground': SQLPlayground,
  'SlideDeck': SlideDeck,
  // Add more aliases or specialized versions here
  'PythonBasicsViz': PythonVisualizer,
  'SQLTerminal': SQLPlayground,
  'NetworkSimulator': () => <div className="p-8 text-center border border-dashed border-gray-400 rounded-xl">Network Simulator Placeholder</div>
};

export const getComponent = (name: string) => {
  return ComponentRegistry[name] || null;
};
