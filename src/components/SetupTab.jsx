import React, { useState } from 'react';

const SetupTab = ({ isActive, places, skList, pathiList, onAddPlace, onRemovePlace, onAddSK, onRemoveSK, onAddPathi, onRemovePathi, onClearAll, onGoToTab }) => {
    const [placeName, setPlaceName] = useState('');
    const [placeDay, setPlaceDay] = useState('Sunday');
    const [placeTime, setPlaceTime] = useState('08:00 AM');
    const [baalSatsang, setBaalSatsang] = useState(false);
    const [skName, setSkName] = useState('');
    const [pathiName, setPathiName] = useState('');

    const handleBaalSatsangToggle = (e) => {
        if (e.target.checked) {
            if (!window.confirm("Along with the regular Satsang, Baal Satsang will also be organized.\n\nThis will assign an additional Pathi-D for this place. Continue?")) {
                e.target.checked = false;
                return;
            }
        }
        setBaalSatsang(e.target.checked);
    };

    const handleAddPlace = () => {
        onAddPlace({
            name: placeName.toUpperCase().trim(),
            day: placeDay,
            time: placeTime,
            baalSatsang
        });
        setPlaceName('');
        setBaalSatsang(false);
    };

    const handleAddSK = () => {
        onAddSK(skName);
        setSkName('');
    };

    const handleAddPathi = () => {
        onAddPathi(pathiName);
        setPathiName('');
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const times = [
        '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
    ];

    return (
        <div id="SetupTab" className={`tab-content ${isActive ? 'active' : ''}`}>
            <div className="setup-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2><i className="fas fa-map-marker-alt"></i> Add Satsang Ghar - Place and Time Slot</h2>
                    <button className="btn-danger" onClick={onClearAll} style={{ fontSize: '12px', padding: '8px 15px' }}>
                        <i className="fas fa-trash-alt"></i> Reset All
                    </button>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Place Name</label>
                        <input 
                            type="text" 
                            value={placeName}
                            onChange={(e) => setPlaceName(e.target.value)}
                            placeholder="e.g., RAIPUR RANI" 
                        />
                    </div>
                    <div className="form-group" style={{ minWidth: '120px' }}>
                        <label>Day</label>
                        <select value={placeDay} onChange={(e) => setPlaceDay(e.target.value)}>
                            {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ minWidth: '120px' }}>
                        <label>Time</label>
                        <select value={placeTime} onChange={(e) => setPlaceTime(e.target.value)}>
                            {times.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ minWidth: '110px', textAlign: 'center' }}>
                        <label style={{ display: 'block' }}>Baal Satsang</label>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={baalSatsang}
                                onChange={handleBaalSatsangToggle}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="form-group" style={{ minWidth: '100px' }}>
                        <button className="btn-primary" onClick={handleAddPlace} style={{ width: '100%' }}>
                            <i className="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
                <div className="list-container">
                    {places.map(p => (
                        <div key={p.id} className="badge place">
                            <i className="fas fa-map-marker-alt"></i>
                            <b>{p.name}</b> ({p.day} - {p.time})
                            {p.baalSatsang && <i className="fas fa-child" style={{ color: 'var(--accent)' }} title="Baal Satsang Active"></i>}
                            <span className="close-btn" onClick={() => onRemovePlace(p.id)}>&times;</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="setup-section">
                <h2><i className="fas fa-user-tie"></i> Satsang Karta's</h2>
                <div className="simple-add-row">
                    <div className="form-group">
                        <label>Add Names (Comma Separated)</label>
                        <input 
                            type="text" 
                            value={skName}
                            onChange={(e) => setSkName(e.target.value)}
                            placeholder="e.g., JAIDEEP SHARMA, RAKESH KUMAR" 
                        />
                    </div>
                    <div className="form-group" style={{ minWidth: '120px' }}>
                        <button className="btn-primary" onClick={handleAddSK} style={{ width: '100%' }}>
                            <i className="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
                <div className="list-container">
                    {skList.map(s => (
                        <div key={s} className="badge sk">
                            <i className="fas fa-user"></i>
                            {s}
                            <span className="close-btn" onClick={() => onRemoveSK(s)}>&times;</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="setup-section">
                <h2><i className="fas fa-users"></i> Pathi's</h2>
                <div className="simple-add-row">
                    <div className="form-group">
                        <label>Add Names (Comma Separated)</label>
                        <input 
                            type="text"
                            value={pathiName}
                            onChange={(e) => setPathiName(e.target.value)}
                            placeholder="e.g., MOHAN LAL, RAMESH" 
                        />
                    </div>
                    <div className="form-group" style={{ minWidth: '120px' }}>
                        <button className="btn-primary" onClick={handleAddPathi} style={{ width: '100%' }}>
                            <i className="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
                <div className="list-container">
                    {pathiList.map(p => (
                        <div key={p} className="badge pathi">
                            <i className="fas fa-user-friends"></i>
                            {p}
                            <span className="close-btn" onClick={() => onRemovePathi(p)}>&times;</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="nav-actions right-only">
                <button className="btn-nav" onClick={() => onGoToTab('ScheduleTab')}>
                    Next: Create Schedule <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

export default SetupTab;
