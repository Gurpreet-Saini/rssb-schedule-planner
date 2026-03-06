import React, { useState, useEffect } from 'react';
import './index.css';
import Header from './components/Header';
import Tabs from './components/Tabs';
import SetupTab from './components/SetupTab';
import ScheduleTab from './components/ScheduleTab';
import ViewTab from './components/ViewTab';
import FeedbackModal from './components/FeedbackModal';
import ReleaseNotesModal from './components/ReleaseNotesModal';
import { ToastContainer, useToast } from './components/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getAutoPathis } from './utils/scheduleLogic';

const DEFAULT_PLACES = [
    { id: 1, name: "RAIPUR RANI", day: "Sunday", time: "09:00 AM", baalSatsang: false },
    { id: 2, name: "HANGOLA", day: "Sunday", time: "09:00 AM", baalSatsang: false },
    { id: 3, name: "BHOOD", day: "Sunday", time: "09:00 AM", baalSatsang: false },
    { id: 4, name: "BADHOUR", day: "Wednesday", time: "05:30 PM", baalSatsang: false }
];

const DEFAULT_SK_LIST = ["VCD", "JAIDEEP SHARMA", "P L DHIMAN"];

const DEFAULT_PATHI_LIST = [
    "MOHAN LAL-1", "MOHAN LAL-2", "SANJIV BHOOD", "SHUSHMA BHOOD", "NEHA BHOOD",
    "SINGH RAJ", "BABLI", "SARITA", "PREETI", "MAM SINGH", "SEETA SHARMA", "JASWINDER KAUR"
];

function App() {
    const [activeTab, setActiveTab] = useState('SetupTab');
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [releaseNotesModalOpen, setReleaseNotesModalOpen] = useState(false);
    const [theme, setTheme] = useLocalStorage('satsangTheme', 'light');
    const { toasts, showToast, removeToast } = useToast();

    // Apply theme on mount and when theme changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Local storage for configuration
    const [configData, setConfigData] = useLocalStorage('satsangConfig', {
        places: DEFAULT_PLACES,
        skList: DEFAULT_SK_LIST,
        pathiList: DEFAULT_PATHI_LIST,
        dates: {
            startMonth: '6',
            startYear: '2025',
            endMonth: '6',
            endYear: '2025'
        }
    });

    // State for schedule (not persisted)
    const [schedule, setSchedule] = useState([]);
    const [editingIndex, setEditingIndex] = useState(-1);

    // Derived state from config
    const places = configData.places || DEFAULT_PLACES;
    const skList = configData.skList || DEFAULT_SK_LIST;
    const pathiList = configData.pathiList || DEFAULT_PATHI_LIST;
    const startMonth = configData.dates?.startMonth || '6';
    const startYear = configData.dates?.startYear || '2025';
    const endMonth = configData.dates?.endMonth || '6';
    const endYear = configData.dates?.endYear || '2025';

    // Handle config updates
    const updateConfig = (newConfig) => {
        setConfigData(newConfig);
    };

    // Place management
    const handleAddPlace = ({ name, day, time, baalSatsang }) => {
        if (!name || !day || !time) {
            showToast("Missing fields", "error");
            return;
        }

        if (places.find(p => p.name === name && p.day === day && p.time === time)) {
            showToast("Exists.", "error");
            return;
        }

        const newPlaces = [...places, { id: Date.now(), name, day, time, baalSatsang }];
        updateConfig({ ...configData, places: newPlaces });
        showToast("Added!");
    };

    const handleRemovePlace = (id) => {
        const newPlaces = places.filter(p => p.id !== id);
        updateConfig({ ...configData, places: newPlaces });
    };

    // SK management
    const handleAddSK = (input) => {
        if (!input) {
            showToast("No new names found.", "error");
            return;
        }

        let names = input.split(',');
        let addedCount = 0;
        const newSkList = [...skList];

        names.forEach(n => {
            let trimmed = n.trim().toUpperCase();
            if (trimmed) {
                trimmed = trimmed.replace(/^VCD\s+|\s+VCD$/gi, '').trim();
                if (trimmed === "") trimmed = "VCD";
                if (!newSkList.includes(trimmed)) {
                    newSkList.push(trimmed);
                    addedCount++;
                }
            }
        });

        if (addedCount > 0) {
            updateConfig({ ...configData, skList: newSkList });
            showToast(`${addedCount} SK(s) added!`);
        } else {
            showToast("No new names found.", "error");
        }
    };

    const handleRemoveSK = (name) => {
        const newSkList = skList.filter(s => s !== name);
        updateConfig({ ...configData, skList: newSkList });
    };

    // Pathi management
    const handleAddPathi = (input) => {
        if (!input) {
            showToast("No new names found.", "error");
            return;
        }

        let names = input.split(',');
        let addedCount = 0;
        const newPathiList = [...pathiList];

        names.forEach(n => {
            let trimmed = n.trim().toUpperCase();
            if (trimmed && !newPathiList.includes(trimmed)) {
                newPathiList.push(trimmed);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            updateConfig({ ...configData, pathiList: newPathiList });
            showToast(`${addedCount} Pathi(s) added!`);
        } else {
            showToast("No new names found.", "error");
        }
    };

    const handleRemovePathi = (name) => {
        const newPathiList = pathiList.filter(p => p !== name);
        updateConfig({ ...configData, pathiList: newPathiList });
    };

    // Clear all data
    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to delete ALL configuration data (Places, SKs, Pathis)?\n\n(The current schedule on screen will also be cleared)")) {
            setConfigData({
                places: [],
                skList: [],
                pathiList: [],
                dates: configData.dates
            });
            setSchedule([]);
            setEditingIndex(-1);
            showToast("Configuration data erased.", "info");
        }
    };

    // Schedule management
    const handleSaveEntry = (entry, editIdx) => {
        const placeId = entry.placeId;
        const date = entry.date;
        const sk = entry.sk;

        const placeObj = places.find(p => p.id === placeId);
        if (!placeObj) {
            showToast("Place not found", "error");
            return;
        }

        const isVCD = sk === 'VCD';
        const isBaalSatsang = placeObj.baalSatsang;

        // Check for conflicts
        let existingIndex = schedule.findIndex(e => e.placeId === placeId && e.date === date);
        if (editIdx > -1 && existingIndex > -1 && existingIndex !== editIdx) {
            showToast("Conflict.", "error");
            return;
        }

        if (sk !== 'VCD') {
            const skConflict = schedule.find(
                (s, idx) => s.date === date && s.sk === sk && s.placeId !== placeId && idx !== editIdx
            );
            if (skConflict) {
                showToast(`Conflict: ${sk} busy at ${skConflict.placeName}`, "error");
                return;
            }
        }

        // Determine pathis needed
        // Normal: 3 slots, Baal adds fourth.
        // VCD: 3 slots if Baal (A is N/A, B,C,D), 2 slots if not Baal (A is N/A, B,C, D=N/A).
        let neededCount = isBaalSatsang ? 4 : 3;
        if (isVCD) neededCount = isBaalSatsang ? 3 : 2;

        // Get auto assignments
        let autoAssigned = getAutoPathis(date, neededCount, schedule, pathiList);

        // Map assignments
        let pathis;
        if (isVCD) {
            // A is N/A
            let slots = [];
            slots.push("N/A");
            slots.push(autoAssigned.a); // B
            slots.push(autoAssigned.b); // C
            slots.push(isBaalSatsang ? autoAssigned.c : "N/A"); // D only if Baal Satsang

            pathis = { a: slots[0], b: slots[1], c: slots[2], d: slots[3] };
        } else {
            if (isBaalSatsang) {
                pathis = { a: autoAssigned.a, b: autoAssigned.b, c: autoAssigned.c, d: autoAssigned.d };
            } else {
                pathis = { a: autoAssigned.a, b: autoAssigned.b, c: autoAssigned.c, d: "N/A" };
            }
        }

        const entryData = {
            placeId,
            placeName: placeObj.name,
            dayTime: `${placeObj.day} ${placeObj.time}`,
            baalSatsang: isBaalSatsang,
            date,
            sk,
            pathiA: pathis.a,
            pathiB: pathis.b,
            pathiC: pathis.c,
            pathiD: pathis.d,
            shabad: entry.shabad,
            bani: entry.bani,
            book: entry.book
        };

        let newSchedule = [...schedule];
        if (editIdx > -1) {
            newSchedule[editIdx] = entryData;
            setEditingIndex(-1);
            showToast("Updated!", "info");
        } else {
            if (existingIndex > -1) {
                newSchedule[existingIndex] = entryData;
                showToast("Overwritten.", "info");
            } else {
                newSchedule.push(entryData);
                showToast("Saved!");
            }
        }

        setSchedule(newSchedule);
        return true;
    };

    const handleDeleteEntry = (index) => {
        if (window.confirm("Delete?")) {
            if (editingIndex === index) setEditingIndex(-1);
            const newSchedule = schedule.filter((_, i) => i !== index);
            setSchedule(newSchedule);
            showToast("Deleted.", "error");
        }
    };

    const handleEditEntry = (index) => {
        setEditingIndex(index);
        setActiveTab('ScheduleTab');
        setTimeout(() => {
            document.querySelector('#ScheduleTab .form-row')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Date config management
    const handleDateChange = (field, value) => {
        const newDates = { ...configData.dates, [field]: value };
        updateConfig({ ...configData, dates: newDates });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const handleGoToTab = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <>
            <div className="container">
                <Header 
                    onReleaseNotesClick={() => setReleaseNotesModalOpen(true)} 
                    theme={theme}
                    onToggleTheme={toggleTheme}
                />
                <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

                <SetupTab
                    isActive={activeTab === 'SetupTab'}
                    places={places}
                    skList={skList}
                    pathiList={pathiList}
                    onAddPlace={handleAddPlace}
                    onRemovePlace={handleRemovePlace}
                    onAddSK={handleAddSK}
                    onRemoveSK={handleRemoveSK}
                    onAddPathi={handleAddPathi}
                    onRemovePathi={handleRemovePathi}
                    onClearAll={handleClearAll}
                    onGoToTab={handleGoToTab}
                />

                <ScheduleTab
                    isActive={activeTab === 'ScheduleTab'}
                    places={places}
                    skList={skList}
                    pathiList={pathiList}
                    schedule={schedule}
                    onSaveEntry={handleSaveEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onEditEntry={handleEditEntry}
                    editingIndex={editingIndex}
                    onGoToTab={handleGoToTab}
                    startMonth={startMonth}
                    startYear={startYear}
                    endMonth={endMonth}
                    endYear={endYear}
                    onShowToast={showToast}
                    onDateChange={handleDateChange}
                />

                <ViewTab
                    isActive={activeTab === 'ViewTab'}
                    places={places}
                    schedule={schedule}
                    startMonth={startMonth}
                    startYear={startYear}
                    endMonth={endMonth}
                    endYear={endYear}
                    onGoToTab={handleGoToTab}
                    onShowToast={showToast}
                />

                {/* Floating Feedback Button */}
                <div className="fab-feedback">
                    <button onClick={() => setFeedbackModalOpen(true)}>
                        <i className="fas fa-comment-dots"></i> Feedback
                    </button>
                </div>

                {/* Modals */}
                <FeedbackModal
                    isOpen={feedbackModalOpen}
                    onClose={() => setFeedbackModalOpen(false)}
                    onSendFeedback={() => showToast("Thank you for your feedback!")}
                />

                <ReleaseNotesModal
                    isOpen={releaseNotesModalOpen}
                    onClose={() => setReleaseNotesModalOpen(false)}
                />
            </div>

            {/* Toast Container - outside container for proper z-index */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
}

export default App;
