import React, { useState } from 'react';

const FeedbackModal = ({ isOpen, onClose, onSendFeedback }) => {
    const [formData, setFormData] = useState({
        name: '',
        subject: 'Suggestion',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSend = () => {
        if (!formData.name || !formData.message) {
            alert('Please fill in name and message');
            return;
        }

        const mailtoLink = `mailto:sainigp20@gmail.com?subject=${encodeURIComponent(`[Schedule] ${formData.subject} - ${formData.name}`)}&body=${encodeURIComponent(`Name: ${formData.name}\n\n${formData.message}`)}`;
        window.location.href = mailtoLink;

        setFormData({ name: '', subject: 'Suggestion', message: '' });
        onClose();
        onSendFeedback();
    };

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
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ margin: 0, border: 'none' }}>
                        <i className="fas fa-envelope-open-text"></i> Feedback
                    </h2>
                    <button 
                        className="modal-close"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                <div className="form-group">
                    <label>Your Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Subject</label>
                    <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                    >
                        <option value="Suggestion">Suggestion</option>
                        <option value="Bug">Bug</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Message</label>
                    <textarea
                        name="message"
                        rows="5"
                        placeholder="Message..."
                        value={formData.message}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <button className="btn-primary" onClick={handleSend}>
                        <i className="fas fa-paper-plane"></i> Send Email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
