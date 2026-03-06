import React, { useState, useEffect, useCallback } from 'react';
import { getAvailableDates } from '../utils/scheduleLogic';

const ScheduleTab = ({
    isActive,
    places,
    skList,
    pathiList,
    schedule,
    onSaveEntry,
    onDeleteEntry,
    onEditEntry,
    editingIndex,
    onGoToTab,
    startMonth,
    startYear,
    endMonth,
    endYear,
    onShowToast,
    onDateChange
}) => {
    const [selectedPlace, setSelectedPlace] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSK, setSelectedSK] = useState('');
    const [shabad, setShabad] = useState('');
    const [bani, setBani] = useState('');
    const [book, setBook] = useState('');
    const [autoPathiText, setAutoPathiText] = useState('Select an SK to view assignment.');
    const [availableDates, setAvailableDates] = useState([]);

    const updateDateList = useCallback(() => {
        if (selectedPlace) {
            const placeObj = places.find(p => p.id === parseInt(selectedPlace));
            if (placeObj) {
                const allDates = getAvailableDates(placeObj, parseInt(startMonth), parseInt(startYear), parseInt(endMonth), parseInt(endYear), schedule);
                // remove dates already scheduled for this place (unless editing that entry)
                const filtered = allDates.filter(d => {
                    const isScheduled = schedule.some((e, idx) => {
                        if (e.placeId === parseInt(selectedPlace) && e.date === d) {
                            if (editingIndex > -1 && idx === editingIndex) return false; // keep date we're editing
                            return true;
                        }
                        return false;
                    });
                    return !isScheduled;
                });
                setAvailableDates(filtered);
                if (!filtered.includes(selectedDate)) setSelectedDate('');
            }
        } else {
            setAvailableDates([]);
            setSelectedDate('');
        }
    }, [selectedPlace, places, startMonth, startYear, endMonth, endYear, schedule, editingIndex, selectedDate]);

    useEffect(() => {
        updateDateList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlace, places, startMonth, startYear, endMonth, endYear, schedule, editingIndex]);

    const handleSKChange = useCallback((value) => {
        setSelectedSK(value);
        
        if (!value) {
            setAutoPathiText('Select an SK to view assignment.');
            return;
        }

        const placeId = parseInt(selectedPlace);
        const placeObj = places.find(p => p.id === placeId);

        if (!placeObj) return;

        let pathiCount = placeObj.baalSatsang ? 4 : 3;
        if (value === 'VCD') pathiCount = placeObj.baalSatsang ? 3 : 2; // VCD: 3 if Baal (A=N/A, B,C,D), 2 if not (A=N/A, B,C, D=N/A)

        setAutoPathiText(
            value === 'VCD'
                ? placeObj.baalSatsang
                    ? `VCD: Pathi A is N/A. ${pathiCount} Pathis auto-assigned (includes Pathi-D).`
                    : `VCD: Pathi A is N/A. ${pathiCount} Pathis auto-assigned (Pathi-D N/A).`
                : `${pathiCount} Pathis auto-assigned (Load Balanced).`
        );
    }, [selectedPlace, places]);

    // when entering edit mode, populate form values
    useEffect(() => {
        if (editingIndex > -1 && schedule[editingIndex]) {
            const entry = schedule[editingIndex];
            setSelectedPlace(entry.placeId.toString());
            setSelectedDate(entry.date);
            setSelectedSK(entry.sk);
            setShabad(entry.shabad || '');
            setBani(entry.bani || '');
            setBook(entry.book || '');
            // Update auto pathi text for the SK
            if (entry.sk) {
                const placeObj = places.find(p => p.id === entry.placeId);
                if (placeObj) {
                    let pathiCount = placeObj.baalSatsang ? 4 : 3;
                    if (entry.sk === 'VCD') pathiCount = placeObj.baalSatsang ? 3 : 2;
                    setAutoPathiText(
                        entry.sk === 'VCD'
                            ? `VCD: Pathi A is N/A. ${pathiCount} Pathis auto-assigned (includes Pathi-D).`
                            : `${pathiCount} Pathis auto-assigned (Load Balanced).`
                    );
                }
            }
        }
    }, [editingIndex, schedule, places]);

    const handleSaveEntry = () => {
        if (!selectedPlace || !selectedDate || !selectedSK) {
            onShowToast('Missing fields', 'error');
            return;
        }

        const entry = {
            placeId: parseInt(selectedPlace),
            date: selectedDate,
            sk: selectedSK,
            shabad,
            bani,
            book
        };

        const success = onSaveEntry(entry, editingIndex);
        if (!success) return;

        // Auto-select next available date for the same place
        if (selectedPlace) {
            const placeObj = places.find(p => p.id === parseInt(selectedPlace));
            if (placeObj) {
                const allDates = getAvailableDates(placeObj, parseInt(startMonth), parseInt(startYear), parseInt(endMonth), parseInt(endYear), schedule);
                const filtered = allDates.filter(d => {
                    const isScheduled = schedule.some((e, idx) => {
                        if (e.placeId === parseInt(selectedPlace) && e.date === d) {
                            if (editingIndex > -1 && idx === editingIndex) return false; // keep date we're editing
                            return true;
                        }
                        return false;
                    });
                    return !isScheduled;
                });
                if (filtered.length > 0) {
                    // Find the next date after the current one
                    const currentDateIndex = filtered.indexOf(selectedDate);
                    if (currentDateIndex >= 0 && currentDateIndex < filtered.length - 1) {
                        setSelectedDate(filtered[currentDateIndex + 1]);
                    } else {
                        setSelectedDate(filtered[0]); // or first available if current was last
                    }
                } else {
                    setSelectedDate(''); // no more dates
                }
            }
        } else {
            setSelectedDate('');
        }

        // keep place selected; clear other fields
        setSelectedSK('');
        setShabad('');
        setBani('');
        setBook('');
        setAutoPathiText('Select an SK to view assignment.');
    };

    const sortedSK = [...skList].sort((a, b) => {
        if (a === 'VCD') return -1;
        if (b === 'VCD') return 1;
        return a.localeCompare(b);
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const years = Array.from({ length: 12 }, (_, i) => 2024 + i);

    return (
        <div id="ScheduleTab" className={`tab-content ${isActive ? 'active' : ''}`}>
            <div className="date-selector-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-calendar-alt" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
                    <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1rem' }}>Select Period</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={startMonth} onChange={(e) => onDateChange('startMonth', e.target.value)}>
                        {months.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <select value={startYear} onChange={(e) => onDateChange('startYear', e.target.value)}>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>to</span>
                    <select value={endMonth} onChange={(e) => onDateChange('endMonth', e.target.value)}>
                        {months.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <select value={endYear} onChange={(e) => onDateChange('endYear', e.target.value)}>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <h2><i className="fas fa-calendar-plus"></i> Create Entry</h2>
            <div className="form-row">
                <div className="form-group">
                    <label>Place</label>
                    <select value={selectedPlace} onChange={(e) => setSelectedPlace(e.target.value)}>
                        <option value="">-- Select Place --</option>
                        {places.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.day} - {p.time}) {p.baalSatsang ? '[Baal Satsang]' : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Date (Vacant Only)</label>
                    <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                        <option value="">-- Select Date --</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Satsang Karta</label>
                    <select value={selectedSK} onChange={(e) => handleSKChange(e.target.value)}>
                        <option value="">-- Select SK --</option>
                        {sortedSK.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '25px', padding: '18px', border: '1px solid #bfdbfe', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                <i className="fas fa-info-circle" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}></i>
                <div>
                    <strong style={{ color: 'var(--primary-dark)' }}>Auto-Assigned Pathis:</strong>
                    <div style={{ color: 'var(--primary-dark)', fontWeight: 600, marginTop: '4px', fontSize: '0.95rem' }}>
                        {autoPathiText}
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Shabad</label>
                    <input type="text" value={shabad} onChange={(e) => setShabad(e.target.value)} placeholder="Title" />
                </div>
                <div className="form-group">
                    <label>Bani</label>
                    <input type="text" value={bani} onChange={(e) => setBani(e.target.value)} placeholder="Author" />
                </div>
                <div className="form-group">
                    <label>Book</label>
                    <input type="text" value={book} onChange={(e) => setBook(e.target.value)} placeholder="Source" />
                </div>
            </div>

            <button className="btn-success" onClick={handleSaveEntry}>
                <i className="fas fa-save"></i> {editingIndex > -1 ? 'Update' : 'Save'} Entry
            </button>

            <div className="entry-preview">
                <h3><i className="fas fa-list-ul"></i> Recent Entries</h3>
                <SchedulePreviewTable schedule={schedule} onEdit={onEditEntry} onDelete={onDeleteEntry} />
            </div>

            <div className="nav-actions">
                <button className="btn-nav back" onClick={() => onGoToTab('SetupTab')}>
                    <i className="fas fa-arrow-left"></i> Back: Add Details
                </button>
                <button className="btn-nav" onClick={() => onGoToTab('ViewTab')}>
                    Next: Dashboard <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

const SchedulePreviewTable = ({ schedule, onEdit, onDelete }) => {
    if (schedule.length === 0) {
        return <div className="table-container"><p>No entries.</p></div>;
    }

    // Create indexed entries to track original indices after sorting
    const indexedSchedule = schedule.map((entry, idx) => ({ ...entry, originalIndex: idx }));
    
    const sortedSchedule = [...indexedSchedule].sort((a, b) => {
        let dA = a.date.split('-').reverse().join('-');
        let dB = b.date.split('-').reverse().join('-');
        if (dA === dB) return a.placeName.localeCompare(b.placeName);
        return new Date(dA) - new Date(dB);
    });

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Place</th>
                        <th>Satsang Karta</th>
                        <th>Pathi-A</th>
                        <th>Pathi-B</th>
                        <th>Pathi-C</th>
                        <th>Pathi-D</th>
                        <th>Info</th>
                        <th>#</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedSchedule.map((entry) => (
                        <tr key={entry.originalIndex} className={entry.sk === 'VCD' ? 'vcd-row' : ''}>
                            <td>{entry.date}</td>
                            <td>
                                {entry.placeName}
                                {entry.baalSatsang && <i className="fas fa-child" style={{ color: 'var(--accent)' }}></i>}
                            </td>
                            <td>{entry.sk}</td>
                            <td>{entry.pathiA}</td>
                            <td>{entry.pathiB}</td>
                            <td>{entry.pathiC}</td>
                            <td>{entry.pathiD || '-'}</td>
                            <td>{entry.shabad}</td>
                            <td>
                                <button className="btn-primary" style={{ padding: '2px 5px', fontSize: '10px', marginRight: '2px' }} onClick={() => onEdit(entry.originalIndex)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn-danger" style={{ padding: '2px 5px', fontSize: '10px' }} onClick={() => onDelete(entry.originalIndex)}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleTab;
