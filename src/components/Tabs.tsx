import React from 'react';

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, selected, onChange, className }) => {
  return (
    <div className={`flex border-b border-gray-200 dark:border-zinc-700 ${className || ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors
            ${selected === tab.value
              ? 'border-b-2 border-primary text-primary dark:text-primary-dark'
              : 'text-gray-500 dark:text-gray-400 hover:text-primary'}
          `}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs; 