import React from 'react';

const Tabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'SetupTab', label: 'Add Details', icon: 'cogs' },
        { id: 'ScheduleTab', label: 'Schedule', icon: 'plus-circle' },
        { id: 'ViewTab', label: 'Dashboard', icon: 'chart-bar' }
    ];

    return (
        <div className="tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <i className={`fas fa-${tab.icon}`}></i> {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
