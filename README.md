# Prayer Times Web App

A polished prayer times dashboard that fetches prayer timings from the Aladhan API and displays them in a responsive, modern card layout.

## Features
- Live clock with current time display
- Current prayer badge and active card highlighting
- Upcoming prayer countdown
- Fajr card with sunrise display
- Iqama time estimates
- Gregorian and Hijri date display
- Dark mode based on time of day
- Audio adhan playback controls
- Optional service worker support for offline caching

## Project Files
- Index.html — page structure and UI layout
- style.css — visual styling, responsive layout, and dark mode
- script.js — app logic, API calls, prayer calculations, and UI updates
- .config — customizable location and prayer settings
- sw.js — service worker for offline support

## Configuration
Edit [.config](.config) to customize:
- latitude
- longitude
- prayer method
- iqama offsets
- dark mode hours

Example:
```json
{
  "latitude": 0,
  "longitude": 0,
  "prayerMethod": 2,
  "iqamaTimes": {
    "fajr": 60,
    "zuhr": 10,
    "asr": 10,
    "maghrib": 10,
    "isha": 5
  },
  "darkMode": {
    "startHour": 22,
    "endHour": 6
  }
}
```

## Notes
- The app uses the Aladhan API and requires an internet connection for prayer times.
- The audio file Adhan.mp3 is bundled locally.
- The Hijri date is fetched from a public API, so internet access is also required for that part of the UI.
- If you want to publish this to GitHub Pages, upload the project folder as-is and open the Index.html page.

## Local Preview
Open Index.html in a browser, or serve the folder with a simple static server if you want to test the service worker.
