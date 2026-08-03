console.log('Script Loaded!');
let userHasInteracted = false;
let AhdanPlaying = false;
let audio; // Declare audio globally so it can be used in the event listener

const defaultConfig = {
  latitude: 0,
  longitude: 0,
  prayerMethod: 2,
  iqamaTimes: {
    fajr: 60,
    zuhr: 10,
    asr: 10,
    maghrib: 10,
    isha: 5
  },
  darkMode: {
    startHour: 22,
    endHour: 6
  }
};

let appConfig = { ...defaultConfig };

async function loadConfig() {
  try {
    const response = await fetch('./.config');
    if (!response.ok) throw new Error('Config file not found');

    const data = await response.json();
    appConfig = {
      ...defaultConfig,
      ...data,
      iqamaTimes: {
        ...defaultConfig.iqamaTimes,
        ...(data.iqamaTimes || {})
      },
      darkMode: {
        ...defaultConfig.darkMode,
        ...(data.darkMode || {})
      }
    };
  } catch (error) {
    console.warn('Using default config because .config could not be loaded:', error);
    appConfig = { ...defaultConfig };
  }
}

function buildPrayerApiUrl(timestamp) {
  return `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${appConfig.latitude}&longitude=${appConfig.longitude}&method=${appConfig.prayerMethod}`;
}

function updateTime() {
  const now = new Date();
  let timeString = now.toLocaleTimeString();
  const clockElement = document.getElementById('clock');
  timeString = timeString.replace(/:\d{2}\s/, ' '); // Remove seconds from the time string
  if (clockElement) {
    clockElement.textContent = timeString;
  }
}

function convertTo12Hour(time24) {
  const cleaned = String(time24).replace(/\s*\(.*\)\s*/g, '').trim();
  const [hours, minutes] = cleaned.split(':');
  let hours12 = parseInt(hours, 10);
  const period = hours12 >= 12 ? 'PM' : 'AM';

  if (hours12 > 12) {
    hours12 -= 12;
  } else if (hours12 === 0) {
    hours12 = 12;
  }

  return `${hours12}:${minutes} ${period}`;
}

function updateDarkMode() {
  const now = new Date();
  const hour = now.getHours();
  const body = document.body;
  const { startHour, endHour } = appConfig.darkMode;

  const isNight = hour >= startHour || hour < endHour;

  if (isNight) {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
}

function updateCurrentPrayer() {
  const currentPrayerEl = document.getElementById('current-prayer');
  if (!currentPrayerEl) return;

  const currentPrayer = currentPrayerEl.textContent.trim();
  const prayerCardFajr = document.querySelector('.prayer-card-fajr');
  const prayerCardDhuhr = document.querySelector('.prayer-card-dhuhr');
  const prayerCardAsr = document.querySelector('.prayer-card-asr');
  const prayerCardMaghrib = document.querySelector('.prayer-card-maghrib');
  const prayerCardIsha = document.querySelector('.prayer-card-isha');

  if (!prayerCardFajr || !prayerCardDhuhr || !prayerCardAsr || !prayerCardMaghrib || !prayerCardIsha) return;

  prayerCardFajr.classList.remove('fajr-current');
  prayerCardDhuhr.classList.remove('dhuhr-current');
  prayerCardAsr.classList.remove('asr-current');
  prayerCardMaghrib.classList.remove('maghrib-current');
  prayerCardIsha.classList.remove('isha-current');

  switch (currentPrayer) {
    case 'Fajr':
      prayerCardFajr.classList.add('fajr-current');
      break;
    case 'Dhuhr':
      prayerCardDhuhr.classList.add('dhuhr-current');
      break;
    case 'Asr':
      prayerCardAsr.classList.add('asr-current');
      break;
    case 'Maghrib':
      prayerCardMaghrib.classList.add('maghrib-current');
      break;
    case 'Isha':
      prayerCardIsha.classList.add('isha-current');
      break;
    default:
      console.log('No current prayer or unrecognized prayer name');
  }
}

function updatePrayerTimes() {
  const elements = {
    fajr: document.getElementById('fajr-time'),
    sunrise: document.getElementById('sunrise-time'),
    zuhr: document.getElementById('zuhr-time'),
    asr: document.getElementById('asr-time'),
    maghrib: document.getElementById('maghrib-time'),
    isha: document.getElementById('isha-time')
  };

  const timestamp = Math.floor(Date.now() / 1000);
  const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=2`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const timings = data.data.timings;

      const processTime = (el, timeStr24) => {
        if (!el) return;
        const display = convertTo12Hour(timeStr24);
        el.textContent = display;
        const [h, m] = timeStr24.split(':').map(Number);
        el.dataset.hours = h;
        el.dataset.minutes = m;
      };

      processTime(elements.fajr, timings.Fajr);
      processTime(elements.sunrise, timings.Sunrise);
      processTime(elements.zuhr, timings.Dhuhr);
      processTime(elements.asr, timings.Asr);
      processTime(elements.maghrib, timings.Maghrib);
      processTime(elements.isha, timings.Isha);

      // Run calculations immediately after data loads
      FindCurrentPrayer();
    })
    .catch(error => console.error('Error fetching prayer times:', error));
}

function FindCurrentPrayer() {
  const elements = {
    fajr: document.getElementById('fajr-time'),
    sunrise: document.getElementById('sunrise-time'),
    zuhr: document.getElementById('zuhr-time'),
    asr: document.getElementById('asr-time'),
    maghrib: document.getElementById('maghrib-time'),
    isha: document.getElementById('isha-time')
  };

  const timestamp = Math.floor(Date.now() / 1000);
  const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=2`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const timings = data.data.timings;

      const processTime = (el, timeStr24) => {
        if (!el) return;
        const display = convertTo12Hour(timeStr24);
        el.textContent = display;
        const [h, m] = timeStr24.split(':').map(Number);
        el.dataset.hours = h;
        el.dataset.minutes = m;
      };

      processTime(elements.fajr, timings.Fajr);
      processTime(elements.sunrise, timings.Sunrise);
      processTime(elements.zuhr, timings.Dhuhr);
      processTime(elements.asr, timings.Asr);
      processTime(elements.maghrib, timings.Maghrib);
      processTime(elements.isha, timings.Isha);

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      const getMinutes = (id) => {
        const el = document.getElementById(id);
        if (!el || !el.dataset.hours) return null;
        return (parseInt(el.dataset.hours) * 60) + parseInt(el.dataset.minutes);
      };

      const fajr = getMinutes('fajr-time');
      const sunrise = getMinutes('sunrise-time');
      const zuhr = getMinutes('zuhr-time');
      const asr = getMinutes('asr-time');
      const maghrib = getMinutes('maghrib-time');
      const isha = getMinutes('isha-time');

      if (!fajr || !sunrise || !zuhr || !asr || !maghrib || !isha) return;

      let currentPrayer = '';

      if (currentTotalMinutes >= fajr && currentTotalMinutes < sunrise) {
        currentPrayer = 'Fajr';
      } else if (currentTotalMinutes >= sunrise && currentTotalMinutes < zuhr) {
        currentPrayer = 'Sunrise';
      } else if (currentTotalMinutes >= zuhr && currentTotalMinutes < asr) {
        currentPrayer = 'Zuhr';
      } else if (currentTotalMinutes >= asr && currentTotalMinutes < maghrib) {
        currentPrayer = 'Asr';
      } else if (currentTotalMinutes >= maghrib && currentTotalMinutes < isha) {
        currentPrayer = 'Maghrib';
      } else {
        currentPrayer = 'Isha';
      }

      const displayEl = document.getElementById('current-prayer');
      if (displayEl) {
        displayEl.textContent = currentPrayer;
      }

      updateCurrentPrayer();
    })
    .catch(error => console.error('Error fetching current prayer:', error));
}

function getPrayerMinutes(id) {
  const el = document.getElementById(id);
  if (!el || !el.dataset.hours) return null; 
  return (parseInt(el.dataset.hours) * 60) + parseInt(el.dataset.minutes);
}

function getPrayerTime(id) {
  const hours = Math.floor(id / 60);
  const minutes = id % 60;
  let timeString = '';

  const minStr = minutes.toString(); 

  if (minStr.length === 1) {
    timeString = `${hours}:0${minStr}`;
  } else {
    timeString = `${hours}:${minStr}`;
  }

  timeString = convertTo12Hour(timeString);
  return timeString;
}

function updateTimeUntilNext() {
  const getMinutes = (id) => {
    const el = document.getElementById(id);
    if (!el || !el.dataset.hours) return null;
    return (parseInt(el.dataset.hours) * 60) + parseInt(el.dataset.minutes);
  };

  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const fajr = getMinutes('fajr-time');
  const sunrise = getMinutes('sunrise-time');
  const zuhr = getMinutes('zuhr-time');
  const asr = getMinutes('asr-time');
  const maghrib = getMinutes('maghrib-time');
  const isha = getMinutes('isha-time');

  if (!fajr || !isha) return;

  const prayers = [
    { name: "Fajr", time: fajr },
    { name: "Sunrise", time: sunrise },
    { name: "Zuhr", time: zuhr },
    { name: "Asr", time: asr },
    { name: "Maghrib", time: maghrib },
    { name: "Isha", time: isha }
  ];

  let nextPrayer = null;
  let nextTime = null;

  for (let p of prayers) {
    if (p.time > currentTotalMinutes) {
      nextPrayer = p.name;
      nextTime = p.time;
      break;
    }
  }

  if (!nextPrayer) {
    nextPrayer = "Fajr";
    nextTime = fajr + 1440; // Add 24 hours for tomorrow
  }

  let diffMinutes = nextTime - currentTotalMinutes;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = Math.floor((diffMinutes % 60));
  

  const fmt = (n) => String(n).padStart(2, '0');

  const timeString = `${fmt(hours)}:${fmt(minutes)}`;

  

  const el = document.getElementById('time-until-next-prayer');
  if (el) {
    el.textContent = `${timeString} until ${nextPrayer}`;
  }
}

function updateIqamaTimes() {
  const iqamaTimes = appConfig.iqamaTimes;

  const fajrIqama = getPrayerMinutes('fajr-time');
  const zuhrIqama = getPrayerMinutes('zuhr-time');
  const asrIqama = getPrayerMinutes('asr-time');
  const maghribIqama = getPrayerMinutes('maghrib-time');
  const ishaIqama = getPrayerMinutes('isha-time');

  let fajrIqamaTime = iqamaTimes.fajr ? fajrIqama + iqamaTimes.fajr : null;
  let zuhrIqamaTime = iqamaTimes.zuhr ? zuhrIqama + iqamaTimes.zuhr : null;
  let asrIqamaTime = iqamaTimes.asr ? asrIqama + iqamaTimes.asr : null;
  let maghribIqamaTime = iqamaTimes.maghrib ? maghribIqama + iqamaTimes.maghrib : null;
  let ishaIqamaTime = iqamaTimes.isha ? ishaIqama + iqamaTimes.isha : null;

  // Update elements with new IDs
  const updateEl = (id, time) => {
    const el = document.getElementById(id);
    if (el) el.textContent = time ? getPrayerTime(time) : '-';
  };



  updateEl('fajr-Iqama-time', fajrIqamaTime);
  updateEl('zuhr-Iqama-time', zuhrIqamaTime);
  updateEl('asr-Iqama-time', asrIqamaTime);
  updateEl('maghrib-Iqama-time', maghribIqamaTime);
  updateEl('isha-Iqama-time', ishaIqamaTime);
  
  // Sunrise doesn't have iqama, so we just set it to '-' if needed, or leave it
  const sunriseEl = document.getElementById('sunrise-Iqama-time');
  if(sunriseEl) sunriseEl.textContent = '-';
}

function playAdhan() {
  if (!audio) return;
  audio.play().catch(e => console.log("Play failed:", e));
  console.log('Adhan Played!');
}

function AdhanStop() {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function playAdhanIfNeeded() {
  if (!userHasInteracted) return;
  if (!audio || !audio.paused) return;

  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const getPrayerMinutes = (id) => {
    const el = document.getElementById(id);
    if (!el || !el.dataset.hours) return null;
    return (parseInt(el.dataset.hours) * 60) + parseInt(el.dataset.minutes);
  };

  const fajr = getPrayerMinutes('fajr-time');
  const zuhr = getPrayerMinutes('zuhr-time');
  const asr = getPrayerMinutes('asr-time');
  const maghrib = getPrayerMinutes('maghrib-time');
  const isha = getPrayerMinutes('isha-time');

  if (!fajr || !isha) return;

  // Check if current time matches any prayer time exactly (within 1 minute)
  const isMatch = (prayerTime) => {
    if (!prayerTime) return false;
    return Math.abs(currentTotalMinutes - prayerTime) < 1;
  };

  if ((isMatch(fajr) || isMatch(zuhr) || isMatch(asr) || isMatch(maghrib) || isMatch(isha)) && !AhdanPlaying) {
    playAdhan();
    AhdanPlaying = true; // ✅ FIXED: Removed 'let' to update global variable
  }
}

// --- INITIALIZATION ---

async function initializeApp() {
  await loadConfig();

  updateTime();
  updatePrayerTimes();
  updateTimeUntilNext();
  updateIqamaTimes();
  playAdhanIfNeeded();
  updateDarkMode();

  // Initialize Audio Element Globally
  audio = document.getElementById('adhan-audio');

  // Event Listener for Audio End
  if (audio) {
    audio.addEventListener('ended', function() {
      console.log('Adhan has finished playing');
      AhdanPlaying = false;
    });
  }

  document.addEventListener('click', function() {
    userHasInteracted = true;
    console.log('User Has Interacted!');
  }, { once: true });

  const button = document.getElementById('AdhanTest');
  if (button) {
    button.addEventListener('click', function() {
      playAdhan();
    });
  }

  const button2 = document.getElementById('AdhanStop');
  if (button2) {
    button2.addEventListener('click', function() {
      AdhanStop();
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(error => {
          console.log('SW registration failed: ', error);
        });
    });
  }
}

initializeApp();

// --- INTERVALS ---
setInterval(updatePrayerTimes, 24 * 60 * 60 * 1000);
setInterval(FindCurrentPrayer, 60 * 1000);

setInterval(updateTime, 1000);
setInterval(updateTimeUntilNext, 1000);
setInterval(updateIqamaTimes, 1000);
setInterval(playAdhanIfNeeded, 1000);
setInterval(updateDarkMode, 60 * 1000); // Check for dark mode every minute
