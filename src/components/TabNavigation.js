import React from 'react';
import './TabNavigation.css';

const TabNavigation = ({ currentType, setCurrentType }) => {
  const tabs = [
    { id: 'alphabet', label: 'Alphabet', icon: 'A' },
    { id: 'numbers', label: 'Numbers', icon: '1' },
    { id: 'hindi', label: 'Hindi', icon: 'H' }
  ];

  return (
    <div className="tab-navigation">
      <div className="tab-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${currentType === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentType(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
