import React, { useState, useEffect } from 'react';

export const Toast = ({ message, type = 'success', onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500);
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const iconMap = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle'
    };

    return (
        <div className={`toast ${type} ${!isVisible ? 'fade-out' : ''}`}>
            <i className={`fas fa-${iconMap[type]}`}></i>
            <span>{message}</span>
        </div>
    );
};

export const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div id="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, showToast, removeToast };
};
