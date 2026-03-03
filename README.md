# Radha Soami Satsang Beas - Schedule Manager (React Edition)

A modern React-based application for managing Satsang schedules, assigning Satsang Kartas and Pathis, and tracking analytics.

## Features

- **Add Details Tab**: Manage Satsang Ghars (places), Satsang Kartas (SKs), and Pathis
- **Schedule Tab**: Create schedule entries with automatic Pathi assignment (load-balanced)
- **Dashboard Tab**: Analytics and metrics with vacant slot tracking
- **Baal Satsang Support**: Optional Baal Satsang toggle for places (adds Pathi-D slot)
- **Bulk Upload**: Import multiple entries via CSV
- **Data Persistence**: Master lists saved to localStorage
- **Export**: Download schedule as CSV
- **Print**: Print-friendly schedule layout
- **Feedback**: Built-in feedback modal for user suggestions/bugs

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Project Structure

```
src/
├── components/
│   ├── Header.jsx           # App header with logo and navigation
│   ├── Tabs.jsx             # Tab navigation
│   ├── SetupTab.jsx         # Configuration tab
│   ├── ScheduleTab.jsx      # Schedule creation tab
│   ├── ViewTab.jsx          # Dashboard and analytics
│   ├── FeedbackModal.jsx    # Feedback form modal
│   ├── ReleaseNotesModal.jsx # Release notes
│   └── Toast.jsx            # Notification system
├── hooks/
│   └── useLocalStorage.js   # Custom hook for localStorage
├── utils/
│   └── scheduleLogic.js     # Schedule and Pathi assignment logic
├── App.jsx                  # Main app component
├── index.js                 # React entry point
└── index.css                # Global styles

public/
└── index.html               # HTML template
```

## Key Features Explained

### Automatic Pathi Assignment
- Pathis are chosen randomly from available options for each date
- Load balancing ensures even distribution across all Pathis
- Prevents double-booking of Pathis on the same date
- Supports VCD (which has no Pathi-A) and regular SKs

### Baal Satsang
- When enabled for a place, adds an additional 4th Pathi slot (Pathi-D)
- Otherwise uses 3 slots (Pathi A, B, C)

### Data Persistence
- Configuration (places, SKs, Pathis) saved to browser's localStorage
- Schedule is session-only and clears on page refresh
- Can be exported as CSV for backup

## Technologies Used

- **React 18** - UI framework
- **CSS3** - Styling with CSS variables and animations
- **localStorage** - Client-side data persistence
- **Font Awesome 6** - Icons
- **Google Fonts (Poppins)** - Typography

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge) with ES6 support.

## License

Created for Radha Soami Satsang Beas community scheduling.
