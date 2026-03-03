export const formatDate = (d) => {
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getFullYear()).substr(2, 2)}`;
};

export const getAvailableDates = (placeObj, startMonth, startYear, endMonth, endYear, schedule) => {
    const targetDay = placeObj.day;
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    let startDate = new Date(startYear, startMonth, 1);
    let endDate = new Date(endYear, endMonth + 1, 0);
    const dates = [];

    while (startDate <= endDate) {
        if (startDate.getDay() === dayMap[targetDay]) {
            let formatted = formatDate(startDate);
            dates.push(formatted);
        }
        startDate.setDate(startDate.getDate() + 1);
    }

    return dates;
};

export const getAutoPathis = (date, count, schedule, pathiList) => {
    let busyPathis = new Set();
    schedule.forEach(entry => {
        if (entry.date === date) {
            if (entry.pathiA !== "N/A") busyPathis.add(entry.pathiA);
            if (entry.pathiB !== "N/A") busyPathis.add(entry.pathiB);
            if (entry.pathiC !== "N/A") busyPathis.add(entry.pathiC);
            if (entry.pathiD) busyPathis.add(entry.pathiD);
        }
    });

    let available = pathiList.filter(p => !busyPathis.has(p));
    let assigned = [];

    const globalCounts = {};
    pathiList.forEach(p => globalCounts[p] = 0);
    schedule.forEach(e => {
        if (e.pathiA !== "N/A" && globalCounts[e.pathiA] !== undefined) globalCounts[e.pathiA]++;
        if (e.pathiB !== "N/A" && globalCounts[e.pathiB] !== undefined) globalCounts[e.pathiB]++;
        if (e.pathiC !== "N/A" && globalCounts[e.pathiC] !== undefined) globalCounts[e.pathiC]++;
        if (e.pathiD && globalCounts[e.pathiD] !== undefined) globalCounts[e.pathiD]++;
    });

    let localCounts = JSON.parse(JSON.stringify(globalCounts));

    for (let i = 0; i < count; i++) {
        if (available.length === 0) {
            assigned.push("UNAVAILABLE");
            continue;
        }

        let minCount = Math.min(...available.map(p => localCounts[p]));
        let candidates = available.filter(p => localCounts[p] === minCount);

        // Fisher-Yates Shuffle
        for (let k = candidates.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1));
            [candidates[k], candidates[j]] = [candidates[j], candidates[k]];
        }

        let selected = candidates[0];
        assigned.push(selected);
        localCounts[selected]++;
        available = available.filter(p => p !== selected);
    }

    return {
        a: assigned[0] || "N/A",
        b: assigned[1] || "N/A",
        c: assigned[2] || "N/A",
        d: assigned[3] || "N/A"
    };
};
