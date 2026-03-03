import React from 'react';

const ReleaseNotesModal = ({ isOpen, onClose }) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className={`modal-overlay ${isOpen ? 'active' : ''}`}
            onClick={handleBackdropClick}
        >
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 style={{ margin: 0, border: 'none' }}>
                        <i className="fas fa-rocket"></i> What's New
                    </h2>
                    <button 
                        className="modal-close"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-light)', fontSize: '1.1rem' }}>
                            Version 2.4 (Current)
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li><strong>Dark Mode</strong>: Added dark theme support with toggle button in header. Theme preference is saved.</li>
                            <li><strong>UI Improvements</strong>: Updated colors and styling for better dark mode experience.</li>
                        </ul>
                    </div>
                    <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-light)', fontSize: '1.1rem' }}>
                            Version 2.3
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li><strong>Baal Satsang Support</strong>: Added option to enable Baal Satsang for places, which assigns an additional Pathi-D.</li>
                            <li><strong>Full Column Names</strong>: Updated tables and exports to use full names (Satsang Karta, Pathi-A, etc.) for clarity.</li>
                        </ul>
                    </div>
                    <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-light)', fontSize: '1.1rem' }}>
                            Version 2.2
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li>Data Persistence Update: Schedule resets on refresh, Master Lists saved.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReleaseNotesModal;
