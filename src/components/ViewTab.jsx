import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/scheduleLogic';

const ViewTab = ({ isActive, places, schedule, startMonth, startYear, endMonth, endYear, onGoToTab, onShowToast }) => {
    const [metrics, setMetrics] = useState({
        total: 0,
        skCounts: {},
        pathiCounts: {},
        pathiACounts: {},
        pathiBCounts: {},
        pathiCCounts: {},
        pathiDCounts: {},
        vacantDates: []
    });

    useEffect(() => {
        calculateMetrics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schedule, places, startMonth, startYear, endMonth, endYear]);

    const calculateMetrics = () => {
        // Total programs
        const total = schedule.length;

        // SK Counts
        const skCounts = {};
        schedule.forEach(e => {
            skCounts[e.sk] = (skCounts[e.sk] || 0) + 1;
        });

        // Pathi Counts
        const pathiCounts = {};
        const pathiACounts = {};
        const pathiBCounts = {};
        const pathiCCounts = {};
        const pathiDCounts = {};
        schedule.forEach(e => {
            if (e.pathiA !== "N/A") {
                pathiCounts[e.pathiA] = (pathiCounts[e.pathiA] || 0) + 1;
                pathiACounts[e.pathiA] = (pathiACounts[e.pathiA] || 0) + 1;
            }
            if (e.pathiB !== "N/A") {
                pathiCounts[e.pathiB] = (pathiCounts[e.pathiB] || 0) + 1;
                pathiBCounts[e.pathiB] = (pathiBCounts[e.pathiB] || 0) + 1;
            }
            if (e.pathiC !== "N/A") {
                pathiCounts[e.pathiC] = (pathiCounts[e.pathiC] || 0) + 1;
                pathiCCounts[e.pathiC] = (pathiCCounts[e.pathiC] || 0) + 1;
            }
            if (e.pathiD && e.pathiD !== "N/A") {
                pathiCounts[e.pathiD] = (pathiCounts[e.pathiD] || 0) + 1;
                pathiDCounts[e.pathiD] = (pathiDCounts[e.pathiD] || 0) + 1;
            }
        });

        // Vacant Dates
        const vacantDates = calculateVacant();

        setMetrics({
            total,
            skCounts,
            pathiCounts,
            pathiACounts,
            pathiBCounts,
            pathiCCounts,
            pathiDCounts,
            vacantDates
        });
    };

    const calculateVacant = () => {
        const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
        const startDate = new Date(parseInt(startYear), parseInt(startMonth), 1);
        const endDate = new Date(parseInt(endYear), parseInt(endMonth) + 1, 0);
        const vacantList = [];
        const scheduleMap = {};

        schedule.forEach(e => scheduleMap[`${e.placeId}_${e.date}`] = true);

        places.forEach(place => {
            let d = new Date(startDate);
            while (d <= endDate) {
                if (d.getDay() === dayMap[place.day]) {
                    const dateStr = formatDate(d);
                    if (!scheduleMap[`${place.id}_${dateStr}`]) {
                        vacantList.push({ date: dateStr, place: place.name });
                    }
                }
                d.setDate(d.getDate() + 1);
            }
        });

        return vacantList;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadCSV = () => {
        if (schedule.length === 0) {
            onShowToast('No data.', 'error');
            return;
        }

        let csv = "data:text/csv;charset=utf-8,";
        const sortedPlaces = [...places].sort((a, b) => a.name.localeCompare(b.name));

        sortedPlaces.forEach(p => {
            csv += `${p.name} (${p.day} ${p.time})\nDATE,Satsang Karta,Pathi-A,Pathi-B,Pathi-C,Pathi-D,SHABAD,BANI,BOOK\n`;
            const placeEntries = schedule
                .filter(e => e.placeId === p.id)
                .sort((a, b) => new Date(a.date.split('-').reverse().join('-')) - new Date(b.date.split('-').reverse().join('-')));

            placeEntries.forEach(e => {
                csv += [e.date, e.sk, e.pathiA, e.pathiB, e.pathiC, e.pathiD, e.shabad, e.bani, e.book].join(",") + "\n";
            });
            csv += "\n";
        });

        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = "RSSB_Schedule.csv";
        link.click();
        link.remove();
        onShowToast("Exported!");
    };

    const maxSK = Math.max(...Object.values(metrics.skCounts), 1);
    const maxPathi = Math.max(...Object.values(metrics.pathiCounts), 1);
    const maxPathiA = Math.max(...Object.values(metrics.pathiACounts), 1);
    const maxPathiB = Math.max(...Object.values(metrics.pathiBCounts), 1);
    const maxPathiC = Math.max(...Object.values(metrics.pathiCCounts), 1);
    const maxPathiD = Math.max(...Object.values(metrics.pathiDCounts), 1);

    return (
        <div id="ViewTab" className={`tab-content ${isActive ? 'active' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0', border: 'none' }}>
                    <i className="fas fa-chart-pie"></i> Analytics Dashboard
                </h2>
            </div>

            <div className="metrics-grid">
                <div className="metric-card blue">
                    <div className="metric-header">
                        <div className="metric-title">
                            <i className="fas fa-calendar-check"></i> Total Programs
                        </div>
                    </div>
                    <div className="metric-body">
                        <div className="big-stat">
                            <div className="big-num">{metrics.total}</div>
                            <div className="big-label">Scheduled</div>
                        </div>
                    </div>
                </div>

                <div className="metric-card sky">
                    <div className="metric-header">
                        <div className="metric-title">
                            <i className="fas fa-user-check"></i> SK Workload
                        </div>
                    </div>
                    <div className="visual-list">
                        {Object.entries(metrics.skCounts).length === 0 ? (
                            <div>None</div>
                        ) : (
                            Object.entries(metrics.skCounts).map(([sk, count]) => (
                                <div key={sk} className="visual-item">
                                    <div className="visual-item-header">
                                        <span className="visual-item-name">{sk}</span>
                                        <span className="visual-item-val">{count}</span>
                                    </div>
                                    <div className="progress-bg">
                                        <div className="progress-fill" style={{ width: `${(count / maxSK) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="metric-card amber">
                    <div className="metric-header">
                        <div className="metric-title">
                            <i className="fas fa-users-cog"></i> All Pathis Rotation
                        </div>
                    </div>
                    <div className="visual-list">
                        {Object.entries(metrics.pathiCounts).length === 0 ? (
                            <div>None</div>
                        ) : (
                            Object.entries(metrics.pathiCounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([name, count]) => (
                                    <div key={name} className="visual-item">
                                        <div className="visual-item-header">
                                            <span className="visual-item-name">{name}</span>
                                            <span className="visual-item-val">{count}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div 
                                                className="progress-fill" 
                                                style={{
                                                    width: `${(count / maxPathi) * 100}%`,
                                                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                <div className="metric-card amber">
                    <div className="metric-header">
                        <div className="metric-title">
                            <i className="fas fa-user-cog"></i> Pathi-A Rotation
                        </div>
                    </div>
                    <div className="visual-list">
                        {Object.entries(metrics.pathiACounts).length === 0 ? (
                            <div>None</div>
                        ) : (
                            Object.entries(metrics.pathiACounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([name, count]) => (
                                    <div key={name} className="visual-item">
                                        <div className="visual-item-header">
                                            <span className="visual-item-name">{name}</span>
                                            <span className="visual-item-val">{count}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div 
                                                className="progress-fill" 
                                                style={{
                                                    width: `${(count / maxPathiA) * 100}%`,
                                                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                <div className="metric-card orange">
                    <div className="metric-header">
                        <div className="metric-title">
                            <i className="fas fa-user-cog"></i> Pathi-B Rotation
                        </div>
                    </div>
                    <div className="visual-list">
                        {Object.entries(metrics.pathiBCounts).length === 0 ? (
                            <div>None</div>
                        ) : (
                            Object.entries(metrics.pathiBCounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([name, count]) => (
                                    <div key={name} className="visual-item">
                                        <div className="visual-item-header">
                                            <span className="visual-item-name">{name}</span>
                                            <span className="visual-item-val">{count}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div 
                                                className="progress-fill" 
                                                style={{
                                                    width: `${(count / maxPathiB) * 100}%`,
                                                    background: 'linear-gradient(90deg, #f97316, #fb923c)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                <div className="metric-card yellow">
                    <div className="metric-header">
                        <div className="metric-title">
                            <i className="fas fa-user-cog"></i> Pathi-C Rotation
                        </div>
                    </div>
                    <div className="visual-list">
                        {Object.entries(metrics.pathiCCounts).length === 0 ? (
                            <div>None</div>
                        ) : (
                            Object.entries(metrics.pathiCCounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([name, count]) => (
                                    <div key={name} className="visual-item">
                                        <div className="visual-item-header">
                                            <span className="visual-item-name">{name}</span>
                                            <span className="visual-item-val">{count}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div 
                                                className="progress-fill" 
                                                style={{
                                                    width: `${(count / maxPathiC) * 100}%`,
                                                    background: 'linear-gradient(90deg, #eab308, #facc15)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                <div className="metric-card gold">
                    <div className="metric-header">
                        <div className="metric-title">
                            <i className="fas fa-user-cog"></i> Pathi-D Rotation
                        </div>
                    </div>
                    <div className="visual-list">
                        {Object.entries(metrics.pathiDCounts).length === 0 ? (
                            <div>None</div>
                        ) : (
                            Object.entries(metrics.pathiDCounts)
                                .sort((a, b) => b[1] - a[1])
                                .map(([name, count]) => (
                                    <div key={name} className="visual-item">
                                        <div className="visual-item-header">
                                            <span className="visual-item-name">{name}</span>
                                            <span className="visual-item-val">{count}</span>
                                        </div>
                                        <div className="progress-bg">
                                            <div 
                                                className="progress-fill" 
                                                style={{
                                                    width: `${(count / maxPathiD) * 100}%`,
                                                    background: 'linear-gradient(90deg, #d97706, #f59e0b)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                <div className="metric-card red">
                    <div className="metric-header">
                        <div className="metric-title">
                            <i className="fas fa-exclamation-triangle"></i> Vacant Slots
                        </div>
                    </div>
                    <div className="visual-list">
                        {metrics.vacantDates.length === 0 ? (
                            <div className="vacant-success-box">
                                <i className="fas fa-check-circle" style={{ fontSize: '2rem' }}></i>
                                <br />
                                All filled!
                            </div>
                        ) : (
                            <>
                                <div style={{ color: 'var(--danger)', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
                                    Missing: {metrics.vacantDates.length}
                                </div>
                                {metrics.vacantDates.map((item, idx) => (
                                    <div key={idx} className="vacant-alert-box">
                                        <i className="fas fa-calendar-times"></i>
                                        <div>
                                            <b>{item.date}</b> - {item.place}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <h2 style={{ marginTop: '20px' }}><i className="fas fa-table"></i> Complete Schedule</h2>
            <ScheduleFullTable places={places} schedule={schedule} />

            <div className="nav-actions">
                <button className="btn-nav back" onClick={() => onGoToTab('ScheduleTab')}>
                    <i className="fas fa-arrow-left"></i> Back: Schedule
                </button>
                <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                    <button className="btn-outline" onClick={handlePrint}>
                        <i className="fas fa-print"></i> Print
                    </button>
                    <button className="btn-success" onClick={handleDownloadCSV}>
                        <i className="fas fa-file-excel"></i> Export
                    </button>
                </div>
            </div>
        </div>
    );
};

const ScheduleFullTable = ({ places, schedule }) => {
    const sortedPlaces = [...places].sort((a, b) => a.name.localeCompare(b.name) || a.day.localeCompare(b.day));

    if (places.length === 0) {
        return <div className="table-container"><p>No places.</p></div>;
    }

    return (
        <div className="table-container">
            {sortedPlaces.map((placeObj) => {
                const placeEntries = schedule
                    .filter(e => e.placeId === placeObj.id)
                    .sort((a, b) => new Date(a.date.split('-').reverse().join('-')) - new Date(b.date.split('-').reverse().join('-')));

                return (
                    <table key={placeObj.id} style={{ marginBottom: '20px' }}>
                        <thead>
                            <tr>
                                <td colSpan="9" className="place-header">
                                    {placeObj.name} <span>{placeObj.day} : {placeObj.time}</span>
                                    {placeObj.baalSatsang && <i className="fas fa-child"></i>}
                                </td>
                            </tr>
                            <tr>
                                <th>DATE</th>
                                <th>Satsang Karta</th>
                                <th>Pathi-A</th>
                                <th>Pathi-B</th>
                                <th>Pathi-C</th>
                                <th>Pathi-D</th>
                                <th>SHABAD</th>
                                <th>BANI</th>
                                <th>BOOK</th>
                            </tr>
                        </thead>
                        <tbody>
                            {placeEntries.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No entries.</td>
                                </tr>
                            ) : (
                                placeEntries.map((entry, idx) => (
                                    <tr key={idx} className={entry.sk === 'VCD' ? 'vcd-row' : ''}>
                                        <td>{entry.date}</td>
                                        <td>{entry.sk || '-'}</td>
                                        <td>{entry.pathiA || '-'}</td>
                                        <td>{entry.pathiB || '-'}</td>
                                        <td>{entry.pathiC || '-'}</td>
                                        <td>{entry.pathiD || '-'}</td>
                                        <td>{entry.shabad || '-'}</td>
                                        <td>{entry.bani || '-'}</td>
                                        <td>{entry.book || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                );
            })}
        </div>
    );
};

export default ViewTab;
