/**
 * ==========================================================================
 * VIRTUAL BIRTHDAY GIFT / CARD — SCRAPBOOK & ROMANTIC PINK AESTHETIC
 * 100% Vanilla JavaScript • Zero External Libraries
 * ==========================================================================
 */

/* ==========================================================================
   KONFIGURASI — UBAH DATA DI SINI DENGAN MUDAH
   ========================================================================== */
const birthdayConfig = {
    // Mode Sampel Jualan (Set true untuk menampilkan banner order/demo, set false saat dikirim ke klien)
    isSampleMode: true,

    // Nomor WhatsApp Pembuat / Penjual (Isi dengan nomor Anda e.g. "6281234567890" untuk menerima order langsung dari calon pembeli)
    sellerWhatsApp: "",

    // Pesan otomatis saat calon pembeli klik tombol order di website
    orderMessage: "Halo kak, saya tertarik mau pesan website hadiah ulang tahun mewah seperti demo ini ✨",

    // Nama panggilan / nama pasangan (Sample)
    name: "Clarissa Putri",

    // Tanggal ulang tahun / perayaan sample
    birthday: "24 Oktober 2026",

    // Judul lagu yang diputar di vinyl player
    songTitle: "About You — The 1975",

    // Teks surat ulang tahun romantis sample (sangat menyentuh & puitis untuk memikat calon pembeli)
    letter: `Selamat ulang tahun untuk seseorang yang paling berharga dan istimewa di hidupku! ❤️

Setiap detik yang terlewati bersamamu adalah anugerah terindah yang selalu aku syukuri. Terima kasih telah hadir dengan segala kehangatan, senyum manismu yang selalu menenangkan duniaku, dan tulusnya cintamu yang membuat hari-hariku terasa jauh lebih bermakna.

Di hari yang begitu istimewa dan penuh berkah ini, aku berdoa semoga setiap langkahmu selalu dipenuhi sukacita, kesehatan, kemudahan dalam setiap impian, serta dikelilingi orang-orang yang tulus menyayangimu.

Apapun cerita dan musim yang akan kita lalui esok dan seterusnya, ketahuilah bahwa aku akan selalu ada di sampingmu, menggenggam erat tanganmu, dan mencintaimu lebih dari hari kemarin.

Happy Birthday, my favorite person in the entire universe! ✨♡`,

    // Galeri foto kenangan untuk scrapbook & polaroid sample
    photos: [
        {
            src: "assets/images/photo1.png",
            caption: "Hari pertama kita jalan berdua ♡"
        },
        {
            src: "assets/images/photo2.png",
            caption: "Senyum manismu yang selalu menenangkan duniaku ✨"
        },
        {
            src: "assets/images/photo3.png",
            caption: "Momen tawa bahagia yang paling berharga 📸"
        },
        {
            src: "assets/images/photo4.png",
            caption: "Selamanya menjadi orang paling istimewa bagiku 🥰"
        }
    ]
};

// Dukungan Dynamic URL Params untuk demo cepat ke klien (contoh: ?name=Adinda&date=12+Desember+2026)
(function() {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('name')) birthdayConfig.name = params.get('name');
        if (params.get('date')) birthdayConfig.birthday = params.get('date');
        if (params.get('song')) birthdayConfig.songTitle = params.get('song');
        if (params.get('wa')) birthdayConfig.sellerWhatsApp = params.get('wa');
        if (params.get('sample') === 'false') birthdayConfig.isSampleMode = false;
    } catch (e) {}
})();

/* ==========================================================================
   APP STATE
   ========================================================================== */
const state = {
    currentPage: 1,
    isPlayingMusic: false,
    audioInitialized: false,
    currentPhotoIndex: 0,
    typewriterInterval: null,
    confettiRunning: false,
    webAudioSynth: null
};

// DOM Elements
const audio = document.getElementById('music');
const floatingMusicBtn = document.getElementById('floating-music-btn');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-message');

/* ==========================================================================
   1. NAVIGATION & PAGE STATE CONTROLLER (5 Pages Total)
   ========================================================================== */
function showPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > 5) return;

    const oldPageEl = document.getElementById(`page${state.currentPage}`);
    const newPageEl = document.getElementById(`page${pageNumber}`);

    if (oldPageEl) {
        oldPageEl.classList.add('page-exit');
        oldPageEl.classList.remove('active');
        setTimeout(() => {
            oldPageEl.classList.remove('page-exit');
        }, 600);
    }

    if (newPageEl) {
        newPageEl.classList.add('active');
        // Scroll page content to top
        newPageEl.scrollTop = 0;
    }

    state.currentPage = pageNumber;

    // Sync app frame background with page background for seamless edge-to-edge mobile display
    const appEl = document.getElementById('app');
    if (appEl) {
        if (pageNumber === 1) {
            appEl.style.background = 'var(--night-magenta)';
        } else if (pageNumber === 2) {
            appEl.style.background = 'var(--night-velvet)';
        } else if (pageNumber === 3 || pageNumber === 4) {
            appEl.style.background = 'var(--night-velvet)';
        } else if (pageNumber === 5) {
            appEl.style.background = 'var(--night-velvet)';
        }
    }

    // Sync mobile browser theme-color meta for seamless royal aesthetic
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
    }
    metaTheme.content = '#0c0214';

    // Show floating music toggle on pages 2, 4, 5
    // Page 3 has its own dedicated interactive vinyl player deck, so we keep floating capsule hidden on page 3 to avoid clutter and overlap
    if (pageNumber === 2 || pageNumber === 4 || pageNumber === 5) {
        if (floatingMusicBtn) floatingMusicBtn.classList.remove('hidden');
    } else {
        if (floatingMusicBtn) floatingMusicBtn.classList.add('hidden');
    }

    // Page-specific trigger actions
    onPageActivated(pageNumber);
}

function onPageActivated(pageNumber) {
    if (pageNumber === 3) {
        startTypewriter();
    } else if (pageNumber === 4) {
        renderScrapbookGrid();
    } else if (pageNumber === 5) {
        startCelebration();
    }
}

/* ==========================================================================
   2. PAGE 1 — OPENING & LOADER SEQUENCE
   ========================================================================== */
function initOpeningLoader() {
    const progressEl = document.getElementById('loader-progress');
    const percentEl = document.getElementById('loader-percent');
    const statusEl = document.getElementById('loader-status');
    const tapHint = document.getElementById('tap-to-open-hint');
    let currentPercent = 0;

    if (statusEl) statusEl.textContent = "Mempersiapkan kejutanmu...";
    if (progressEl) progressEl.style.width = "0%";
    if (percentEl) percentEl.textContent = "0%";

    const interval = setInterval(() => {
        // Smooth progressive loading
        const step = Math.floor(Math.random() * 5) + 3;
        currentPercent = Math.min(100, currentPercent + step);

        if (progressEl) progressEl.style.width = `${currentPercent}%`;
        if (percentEl) percentEl.textContent = `${currentPercent}%`;

        if (currentPercent >= 100) {
            clearInterval(interval);
            if (statusEl) statusEl.textContent = "Kejutan sudah siap! ✨";
            if (tapHint) tapHint.classList.remove('hidden');

            // Automatically transition to Page 2 (3D Envelope)
            setTimeout(() => {
                if (state.currentPage === 1) {
                    showPage(2);
                }
            }, 600);
        }
    }, 55);

    // Tap to proceed immediately if user doesn't want to wait
    const page1 = document.getElementById('page1');
    if (page1) {
        page1.onclick = () => {
            if (state.currentPage === 1) {
                clearInterval(interval);
                showPage(2);
            }
        };
    }
}

/* ==========================================================================
   3. PAGE 2 — 3D INTERACTIVE ENVELOPE OPENING
   ========================================================================== */
function initEnvelopePage() {
    const envelope = document.getElementById('envelope-3d');
    const waxSeal = document.getElementById('wax-seal');
    const btnOpenEnvelope = document.getElementById('btn-open-envelope');
    let isOpening = false;

    function triggerEnvelopeOpen() {
        if (isOpening) return;
        isOpening = true;

        // Mobile browsers allow audio playback on direct user tap
        startMusic();

        // Haptic feedback on mobile devices
        if (navigator.vibrate) {
            try { navigator.vibrate([60, 40, 100]); } catch (e) {}
        }

        // Step 1: Envelope scales up & flap opens 180 degrees
        const envelopeScene = document.querySelector('.envelope-scene');
        if (envelopeScene) envelopeScene.classList.add('is-opening');
        if (envelope) envelope.classList.add('opening');

        // Step 2: Letter card slides up and zooms forward
        setTimeout(() => {
            if (envelope) envelope.classList.add('zooming-out');
        }, 700);

        // Step 3: Transition to Page 3 (Birthday Letter & Vinyl Player)
        setTimeout(() => {
            showPage(3);
            // Reset envelope state for potential replay
            setTimeout(() => {
                if (envelope) envelope.classList.remove('opening', 'zooming-out');
                if (envelopeScene) envelopeScene.classList.remove('is-opening');
                isOpening = false;
            }, 600);
        }, 1600);
    }

    if (waxSeal) {
        waxSeal.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerEnvelopeOpen();
        });
    }

    if (envelope) {
        envelope.addEventListener('click', triggerEnvelopeOpen);
    }

    if (btnOpenEnvelope) {
        btnOpenEnvelope.addEventListener('click', triggerEnvelopeOpen);
    }
}

/* ==========================================================================
   4. PAGE 3 — LETTER & CUSTOM VINYL MUSIC PLAYER
   ========================================================================== */
function initLetterPage() {
    // Populate configurable details
    const nameDisplay = document.getElementById('letter-name-display');
    const dateDisplay = document.getElementById('letter-date-display');
    const letterPhoto = document.getElementById('letter-photo');
    const photoCaption = document.getElementById('letter-photo-caption');
    const trackTitle = document.getElementById('track-title');
    const capsuleTrackTitle = document.getElementById('capsule-track-title');
    const btnSkipTyping = document.getElementById('btn-skip-typing');
    const btnToMemories = document.getElementById('btn-to-memories');

    if (nameDisplay) nameDisplay.textContent = birthdayConfig.name;
    if (dateDisplay) dateDisplay.textContent = birthdayConfig.birthday;
    if (trackTitle) trackTitle.textContent = birthdayConfig.songTitle;
    if (capsuleTrackTitle) capsuleTrackTitle.textContent = birthdayConfig.songTitle;

    if (birthdayConfig.photos && birthdayConfig.photos.length > 0) {
        if (letterPhoto) letterPhoto.src = birthdayConfig.photos[0].src;
        if (photoCaption) photoCaption.textContent = birthdayConfig.photos[0].caption;
    }

    if (btnSkipTyping) {
        btnSkipTyping.addEventListener('click', skipTypewriter);
    }

    if (btnToMemories) {
        btnToMemories.addEventListener('click', () => {
            showPage(4);
        });
    }

    initMusicPlayer();
}

// Typewriter Effect
function startTypewriter() {
    const textContainer = document.getElementById('typewriter-text');
    const cursor = document.getElementById('typing-cursor');
    const fullText = birthdayConfig.letter;
    if (!textContainer) return;

    // Reset previous typewriter if any
    if (state.typewriterInterval) {
        clearInterval(state.typewriterInterval);
    }

    textContainer.textContent = "";
    if (cursor) cursor.style.display = "inline-block";

    let index = 0;
    state.typewriterInterval = setInterval(() => {
        if (index < fullText.length) {
            textContainer.textContent += fullText.charAt(index);
            index++;
        } else {
            clearInterval(state.typewriterInterval);
            state.typewriterInterval = null;
            if (cursor) cursor.style.display = "none";
        }
    }, 28); // Smooth typing cadence
}

function skipTypewriter() {
    if (state.typewriterInterval) {
        clearInterval(state.typewriterInterval);
        state.typewriterInterval = null;
    }
    const textContainer = document.getElementById('typewriter-text');
    const cursor = document.getElementById('typing-cursor');
    if (textContainer) {
        textContainer.textContent = birthdayConfig.letter;
    }
    if (cursor) {
        cursor.style.display = "none";
    }
}

/* ==========================================================================
   MUSIC PLAYER ENGINE & WEB AUDIO API FALLBACK
   ========================================================================== */
function initMusicPlayer() {
    const btnPlay = document.getElementById('btn-player-play');
    const playIcon = document.getElementById('play-icon');
    const vinylDisc = document.getElementById('vinyl-disc');
    const tonearm = document.getElementById('tonearm');
    const soundBars = document.getElementById('sound-wave-bars');
    const timelineSlider = document.getElementById('timeline-slider');
    const timelineFill = document.getElementById('timeline-fill');
    const timelineThumb = document.getElementById('timeline-thumb');
    const currentTimeEl = document.getElementById('current-time');
    const totalDurationEl = document.getElementById('total-duration');
    const btnRewind = document.getElementById('btn-player-rewind');
    const btnForward = document.getElementById('btn-player-forward');
    const btnVolumeIcon = document.getElementById('btn-volume-icon');
    const volumeRange = document.getElementById('volume-range');
    const volumeBarFill = document.getElementById('volume-bar-fill');
    const volumeLabel = document.getElementById('volume-label');

    let previousVolume = 0.75;

    // Set Loop
    audio.loop = true;

    function setVolume(val) {
        val = Math.max(0, Math.min(1, val));
        audio.volume = val;
        if (volumeRange) volumeRange.value = val;
        if (volumeBarFill) volumeBarFill.style.width = `${Math.round(val * 100)}%`;
        if (volumeLabel) volumeLabel.textContent = `${Math.round(val * 100)}%`;

        if (btnVolumeIcon) {
            if (val === 0) {
                btnVolumeIcon.textContent = "🔇";
            } else if (val < 0.4) {
                btnVolumeIcon.textContent = "🔈";
            } else {
                btnVolumeIcon.textContent = "🔊";
            }
        }
    }

    // Set initial default comfortable volume
    setVolume(0.75);

    if (volumeRange) {
        volumeRange.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (val > 0) previousVolume = val;
            setVolume(val);
        });
    }

    if (btnVolumeIcon) {
        btnVolumeIcon.addEventListener('click', () => {
            if (audio.volume > 0) {
                previousVolume = audio.volume;
                setVolume(0);
            } else {
                setVolume(previousVolume || 0.75);
            }
        });
    }

    const capsuleTrackTitle = document.getElementById('capsule-track-title');

    function updatePlayerUI(isPlaying) {
        state.isPlayingMusic = isPlaying;

        if (playIcon) playIcon.textContent = isPlaying ? "❚❚" : "▶";
        if (vinylDisc) vinylDisc.classList.toggle('spinning', isPlaying);
        if (tonearm) tonearm.classList.toggle('playing', isPlaying);
        if (soundBars) soundBars.classList.toggle('active', isPlaying);
        if (floatingMusicBtn) floatingMusicBtn.classList.toggle('playing', isPlaying);
        if (capsuleTrackTitle) {
            capsuleTrackTitle.textContent = isPlaying 
                ? (birthdayConfig.songTitle || "About You") 
                : "Jeda ⏸";
        }
    }
    window.updatePlayerUI = updatePlayerUI;

    function togglePlay() {
        if (audio.paused) {
            startMusic();
        } else {
            pauseMusic();
        }
    }

    if (btnPlay) btnPlay.addEventListener('click', togglePlay);
    if (floatingMusicBtn) {
        floatingMusicBtn.addEventListener('click', (e) => {
            togglePlay();
            const rect = floatingMusicBtn.getBoundingClientRect();
            const x = e.clientX || (rect.left + rect.width / 2);
            const y = e.clientY || (rect.top + rect.height / 2);
            spawnMusicNotes(x, y);
        });
    }

    // Audio time update
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration) && audio.duration > 0) {
            const progress = (audio.currentTime / audio.duration) * 100;
            if (timelineFill) timelineFill.style.width = `${progress}%`;
            if (timelineThumb) timelineThumb.style.left = `${progress}%`;
            if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
            if (totalDurationEl) totalDurationEl.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        if (!isNaN(audio.duration) && totalDurationEl) {
            totalDurationEl.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener('play', () => updatePlayerUI(true));
    audio.addEventListener('pause', () => updatePlayerUI(false));
    
    // Automatic Seamless Loop
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    });

    // Timeline Click & Touch Drag Scrubbing
    if (timelineSlider) {
        let isSeeking = false;

        function seek(e) {
            const rect = timelineSlider.getBoundingClientRect();
            const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            if (!isNaN(audio.duration) && audio.duration > 0) {
                audio.currentTime = clickPos * audio.duration;
                if (timelineFill) timelineFill.style.width = `${clickPos * 100}%`;
                if (timelineThumb) timelineThumb.style.left = `${clickPos * 100}%`;
                if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        }

        timelineSlider.addEventListener('mousedown', (e) => {
            isSeeking = true;
            seek(e);
        });
        window.addEventListener('mousemove', (e) => {
            if (isSeeking) seek(e);
        });
        window.addEventListener('mouseup', () => {
            isSeeking = false;
        });

        timelineSlider.addEventListener('touchstart', (e) => {
            isSeeking = true;
            seek(e);
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (isSeeking) seek(e);
        }, { passive: true });
        window.addEventListener('touchend', () => {
            isSeeking = false;
        });
    }

    // Rewind / Forward 10 seconds
    if (btnRewind) {
        btnRewind.addEventListener('click', () => {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
            if (!isNaN(audio.duration) && audio.duration > 0 && timelineFill) {
                timelineFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            }
        });
    }
    if (btnForward) {
        btnForward.addEventListener('click', () => {
            if (!isNaN(audio.duration)) {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                if (timelineFill) timelineFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            }
        });
    }

    // Error handling with graceful Web Audio Synthesizer fallback
    audio.addEventListener('error', () => {
        console.warn("Audio file could not be played. Activating romantic music-box synth fallback!");
    });
}

function spawnMusicNotes(x, y) {
    const symbols = ['♪', '♫', '♡', '✨', '♩', '♬', '💕'];
    const count = 5;
    for (let i = 0; i < count; i++) {
        const note = document.createElement('span');
        note.className = 'floating-note-burst';
        note.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        const angle = (Math.PI / (count - 1)) * i + (Math.random() * 0.4 - 0.2);
        const dist = Math.random() * 30 + 20;
        const tx = Math.cos(angle) * dist * (i % 2 === 0 ? 1 : -1);
        const ty = -(Math.sin(angle) * dist + 25);
        const rot = Math.random() * 50 - 25;

        note.style.left = `${x}px`;
        note.style.top = `${y}px`;
        note.style.setProperty('--tx', `${tx}px`);
        note.style.setProperty('--ty', `${ty}px`);
        note.style.setProperty('--rot', `${rot}deg`);

        document.body.appendChild(note);
        setTimeout(() => note.remove(), 1200);
    }
}

function startMusic() {
    state.audioInitialized = true;
    audio.loop = true;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            state.isPlayingMusic = true;
            if (window.updatePlayerUI) window.updatePlayerUI(true);
        }).catch(() => {
            // Autoplay blocked by browser policy: unlock on first touch/click anywhere
            setupFirstInteractionUnlock();
        });
    }
}

function setupFirstInteractionUnlock() {
    const onFirstTouch = () => {
        audio.play().then(() => {
            state.isPlayingMusic = true;
            if (window.updatePlayerUI) window.updatePlayerUI(true);
        }).catch(() => {});
        window.removeEventListener('pointerdown', onFirstTouch);
        window.removeEventListener('touchstart', onFirstTouch);
        window.removeEventListener('click', onFirstTouch);
        window.removeEventListener('keydown', onFirstTouch);
    };
    window.addEventListener('pointerdown', onFirstTouch, { passive: true });
    window.addEventListener('touchstart', onFirstTouch, { passive: true });
    window.addEventListener('click', onFirstTouch, { passive: true });
    window.addEventListener('keydown', onFirstTouch, { passive: true });
}

function pauseMusic() {
    audio.pause();
    state.isPlayingMusic = false;
    if (window.updatePlayerUI) window.updatePlayerUI(false);
    if (state.webAudioSynth) {
        state.webAudioSynth.stop();
    }
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

/**
 * Built-in Romantic Music Box Synthesizer
 * Plays a gentle, nostalgic music-box rendition of "Happy Birthday"
 * Zero external audio files required!
 */
function playMusicBoxChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        
        // Notes frequency for "Happy Birthday"
        const notes = [
            { f: 261.63, d: 0.35 }, // C4
            { f: 261.63, d: 0.25 }, // C4
            { f: 293.66, d: 0.6  }, // D4
            { f: 261.63, d: 0.6  }, // C4
            { f: 349.23, d: 0.6  }, // F4
            { f: 329.63, d: 1.0  }, // E4
            
            { f: 261.63, d: 0.35 }, // C4
            { f: 261.63, d: 0.25 }, // C4
            { f: 293.66, d: 0.6  }, // D4
            { f: 261.63, d: 0.6  }, // C4
            { f: 392.00, d: 0.6  }, // G4
            { f: 349.23, d: 1.0  }, // F4

            { f: 261.63, d: 0.35 }, // C4
            { f: 261.63, d: 0.25 }, // C4
            { f: 523.25, d: 0.6  }, // C5
            { f: 440.00, d: 0.6  }, // A4
            { f: 349.23, d: 0.6  }, // F4
            { f: 329.63, d: 0.6  }, // E4
            { f: 293.66, d: 0.8  }, // D4

            { f: 466.16, d: 0.35 }, // Bb4
            { f: 466.16, d: 0.25 }, // Bb4
            { f: 440.00, d: 0.6  }, // A4
            { f: 349.23, d: 0.6  }, // F4
            { f: 392.00, d: 0.6  }, // G4
            { f: 349.23, d: 1.4  }  // F4
        ];

        let time = ctx.currentTime + 0.1;
        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.f, time);

            // Music box chime envelope
            gain.gain.setValueAtTime(0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + note.d * 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + note.d * 1.2);

            time += note.d * 0.9;
        });

        const totalTime = time - ctx.currentTime;
        const totalDurationEl = document.getElementById('total-duration');
        if (totalDurationEl) totalDurationEl.textContent = formatTime(totalTime);

        // Update player visuals
        state.isPlayingMusic = true;
        const playIcon = document.getElementById('play-icon');
        const vinylDisc = document.getElementById('vinyl-disc');
        const tonearm = document.getElementById('tonearm');
        const soundBars = document.getElementById('sound-wave-bars');
        if (playIcon) playIcon.textContent = "❚❚";
        if (vinylDisc) vinylDisc.classList.add('spinning');
        if (tonearm) tonearm.classList.add('playing');
        if (soundBars) soundBars.classList.add('active');
        if (floatingMusicBtn) floatingMusicBtn.classList.add('playing');

        state.webAudioSynth = {
            stop: () => {
                ctx.close();
                state.isPlayingMusic = false;
                if (playIcon) playIcon.textContent = "▶";
                if (vinylDisc) vinylDisc.classList.remove('spinning');
                if (tonearm) tonearm.classList.remove('playing');
                if (soundBars) soundBars.classList.remove('active');
                if (floatingMusicBtn) floatingMusicBtn.classList.remove('playing');
            }
        };

        setTimeout(() => {
            if (state.isPlayingMusic) {
                state.isPlayingMusic = false;
                if (playIcon) playIcon.textContent = "▶";
                if (vinylDisc) vinylDisc.classList.remove('spinning');
                if (tonearm) tonearm.classList.remove('playing');
                if (soundBars) soundBars.classList.remove('active');
                if (floatingMusicBtn) floatingMusicBtn.classList.remove('playing');
            }
        }, totalTime * 1000);

    } catch (e) {
        console.warn("Web Audio chime error: ", e);
    }
}

/* ==========================================================================
   5. PAGE 4 — OUR MEMORIES & PHOTO LIGHTBOX
   ========================================================================== */
function renderScrapbookGrid() {
    const grid = document.getElementById('scrapbook-grid');
    if (!grid) return;

    grid.innerHTML = "";

    birthdayConfig.photos.forEach((photo, index) => {
        const polaroid = document.createElement('div');
        polaroid.className = 'scrapbook-polaroid';
        polaroid.setAttribute('data-index', index);

        // Random washi tape style
        const tapeClass = `tape-pos-${(index % 4) + 1}`;

        polaroid.innerHTML = `
            <div class="polaroid-tape ${tapeClass}"></div>
            <div class="scrapbook-img-box">
                <img src="${photo.src}" alt="${photo.caption}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\' fill=\\'%23ffe4e8\\'><rect width=\\'100%25\\' height=\\'100%25\\' fill=\\'%23fce7f3\\'/><text x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'20\\' fill=\\'%23f43f5e\\'>Special Memory ♡</text></svg>'">
            </div>
            <p class="scrapbook-polaroid-caption">${photo.caption}</p>
        `;

        polaroid.addEventListener('click', () => {
            openLightbox(index);
        });

        grid.appendChild(polaroid);
    });

    const btnToFinal = document.getElementById('btn-to-final');
    if (btnToFinal) {
        btnToFinal.onclick = () => {
            showPage(5);
        };
    }
}

// Lightbox Logic
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const btnClose = document.getElementById('lightbox-close');
    const backdrop = document.getElementById('lightbox-backdrop');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

    if (btnClose) btnClose.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);

    if (btnPrev) {
        btnPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            changeLightboxPhoto(-1);
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', (e) => {
            e.stopPropagation();
            changeLightboxPhoto(1);
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox && !lightbox.classList.contains('hidden')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') changeLightboxPhoto(-1);
            if (e.key === 'ArrowRight') changeLightboxPhoto(1);
        }
    });

    // Touch Swipe Gestures for Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        if (Math.abs(swipeDistance) > 45) {
            if (swipeDistance > 0) {
                changeLightboxPhoto(-1); // Swipe right -> prev
            } else {
                changeLightboxPhoto(1);  // Swipe left -> next
            }
        }
    }
}

function openLightbox(index) {
    state.currentPhotoIndex = index;
    const lightbox = document.getElementById('lightbox');
    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const counterEl = document.getElementById('lightbox-counter');

    const photo = birthdayConfig.photos[index];
    if (photo) {
        if (imgEl) imgEl.src = photo.src;
        if (captionEl) captionEl.textContent = photo.caption;
        if (counterEl) counterEl.textContent = `${index + 1} / ${birthdayConfig.photos.length}`;
    }

    if (lightbox) {
        lightbox.classList.remove('hidden');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.add('hidden');
    }
}

function changeLightboxPhoto(direction) {
    const total = birthdayConfig.photos.length;
    state.currentPhotoIndex = (state.currentPhotoIndex + direction + total) % total;
    openLightbox(state.currentPhotoIndex);
}

/* ==========================================================================
   6. PAGE 5 — FINAL CELEBRATION & CONFETTI ENGINE
   ========================================================================== */
function initFinalCelebration() {
    const finalName = document.getElementById('final-name-display');
    const btnReplay = document.getElementById('btn-replay');
    const btnShare = document.getElementById('btn-share');
    const sampleBox = document.getElementById('sample-showcase-box');
    const btnOrder = document.getElementById('btn-sample-order');

    if (finalName) finalName.textContent = birthdayConfig.name;

    // Handle Sample Mode Showcase & Order Link
    if (sampleBox) {
        if (birthdayConfig.isSampleMode) {
            sampleBox.classList.remove('hidden');
            if (btnOrder) {
                const phone = birthdayConfig.sellerWhatsApp ? birthdayConfig.sellerWhatsApp.replace(/[^0-9]/g, '') : '';
                const msg = encodeURIComponent(birthdayConfig.orderMessage);
                btnOrder.href = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
            }
        } else {
            sampleBox.classList.add('hidden');
        }
    }

    if (btnReplay) {
        btnReplay.onclick = () => {
            // Replay celebration from opening
            state.confettiRunning = false;
            showPage(1);
            initOpeningLoader();
        };
    }

    if (btnShare) {
        btnShare.onclick = handleShare;
    }
}

function startCelebration() {
    launchCanvasConfetti();
    createFloatingHearts();
}

/**
 * Pure HTML5 Canvas Confetti Engine
 * Generates fluttering ribbons, hearts, and stars with realistic physics
 * Zero external libraries!
 */
function launchCanvasConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    state.confettiRunning = true;
    const particles = [];
    const colors = ['#ffd700', '#fcf6ba', '#d4af37', '#e6ca65', '#ff7597', '#ffb6c1', '#ffffff', '#e8b4b8', '#f43f5e'];

    // Spawn 100 rich luxury particles (gold foil, stars, ribbons, hearts)
    for (let i = 0; i < 100; i++) {
        const randShape = Math.random();
        particles.push({
            x: Math.random() * width,
            y: Math.random() * -height,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 2.2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 6,
            shape: randShape > 0.65 ? 'star' : (randShape > 0.35 ? 'rect' : 'heart')
        });
    }

    function render() {
        if (!state.confettiRunning || state.currentPage !== 5) {
            ctx.clearRect(0, 0, width, height);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            // Wrap around bottom to top
            if (p.y > height) {
                p.y = -20;
                p.x = Math.random() * width;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
            } else if (p.shape === 'heart') {
                drawHeart(ctx, 0, 0, p.size * 0.85);
            } else {
                drawStar(ctx, 0, 0, 4, p.size * 0.6, p.size * 0.25);
            }

            ctx.restore();
        });

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
}

/* ==========================================================================
   7. AMBIENT FLOATING PARTICLES & SHARE API
   ========================================================================== */
function initAmbientParticles() {
    const container = document.getElementById('ambient-particles');
    if (!container) return;

    const symbols = ['✦', '✨', '✧', '♡', '⋆'];
    const colors = ['#ffd700', '#fff3c4', '#ffb6c1', '#fce7f3', '#e6ca65'];

    setInterval(() => {
        if (Math.random() > 0.35) {
            const particle = document.createElement('span');
            particle.className = 'particle-sparkle';
            particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            particle.style.left = `${Math.random() * 95}vw`;
            particle.style.fontSize = `${Math.random() * 12 + 10}px`;
            particle.style.color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.filter = 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.4))';
            particle.style.animation = `floatUpFade ${Math.random() * 4 + 5}s linear forwards`;

            container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 9000);
        }
    }, 1000);
}

function createFloatingHearts() {
    const container = document.getElementById('ambient-particles');
    if (!container) return;

    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('span');
            heart.className = 'particle-heart';
            heart.textContent = '❤️';
            heart.style.left = `${Math.random() * 90 + 5}vw`;
            heart.style.fontSize = `${Math.random() * 16 + 12}px`;
            heart.style.animation = `floatUpFade ${Math.random() * 3 + 4}s ease-in forwards`;
            container.appendChild(heart);

            setTimeout(() => heart.remove(), 7000);
        }, i * 250);
    }
}

// Share Button (Web Share API with Clipboard Fallback)
function handleShare() {
    const shareUrl = window.location.href.split('#')[0];
    const shareData = {
        title: `Selamat Ulang Tahun, ${birthdayConfig.name}! ♡`,
        text: `Sebuah hadiah virtual dan kartu ucapan ulang tahun rahasia spesial untukmu. Buka sekarang!`,
        url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch((err) => {
            if (err.name !== 'AbortError') {
                copyUrlFallback(shareUrl);
            }
        });
    } else {
        copyUrlFallback(shareUrl);
    }
}

function copyUrlFallback(urlToCopy) {
    const url = urlToCopy || window.location.href.split('#')[0];
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showToast("Tautan hadiah berhasil disalin ke clipboard! ♡");
        }).catch(() => {
            showToast("Bagikan tautan ini ke orang tersayang ♡");
        });
    } else {
        showToast("Bagikan tautan ini ke orang tersayang ♡");
    }
}

function showToast(message) {
    if (!toastEl) return;
    if (toastMsg) toastMsg.textContent = message;
    toastEl.classList.remove('hidden');

    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 3200);
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initOpeningLoader();
    initEnvelopePage();
    initLetterPage();
    initLightbox();
    initFinalCelebration();
    initAmbientParticles();
    
    // Attempt autoplay immediately (and attach first-touch fallback if browser blocks initial autoplay)
    startMusic();
});
