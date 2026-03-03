import React from 'react';

const Header = ({ onReleaseNotesClick, theme, onToggleTheme }) => {
    const logoUrl = "https://z-cdn-media.chatglm.cn/files/67c8fd05-fa64-4434-a1f0-bc4a311df658.png?auth_key=1872345937-9056ff5c7ee548d3bf77a867f259c642-0-c2ecfc24bc11fef96b006a00f8b3ea87";

    return (
        <div className="header">
            <div className="header-brand">
                <img src={logoUrl} alt="RSSB Logo" className="header-logo" />
                <div className="title-block">
                    <h1>Radha Soami Satsang Beas</h1>
                    <span className="subtitle">Satsang Schedule Manager</span>
                </div>
            </div>
            <div className="header-actions">
                <button 
                    className="theme-toggle" 
                    onClick={onToggleTheme}
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    <span className="icon">{theme === 'light' ? '🌙' : '☀️'}</span>
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <button 
                    className="btn-primary" 
                    onClick={onReleaseNotesClick}
                    style={{ background: '#000', color: '#fff' }}
                >
                    <i className="fas fa-history"></i> What's New
                </button>
            </div>
        </div>
    );
};

export default Header;
