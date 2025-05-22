// script.js
// DOM Elements
const sidebar = document.getElementById('sidebar');
const mainContent = document.querySelector('.main-content');
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-item');
const loginBtn = document.getElementById('loginBtn');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const signOutBtn = document.getElementById('signOutBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
const signInWithGoogleBtn = document.getElementById('signInWithGoogleBtn');
const signInWithEmailBtn = document.getElementById('signInWithEmailBtn');
const player = document.getElementById('player');
const miniPlayer = document.getElementById('miniPlayer');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatMessageBtn = document.getElementById('sendChatMessageBtn');
const notification = document.getElementById('notification');

// Upload Elements (Home Section)
const homeDropZone = document.getElementById('homeDropZone');
const homeFileInput = document.getElementById('homeFileInput');
const homeUploadBtn = document.getElementById('homeUploadBtn');
const homeUploadProgressContainer = document.getElementById('homeUploadProgressContainer');
const homeUploadProgressBar = document.getElementById('homeUploadProgressBar');

// Upload Elements (Upload Section)
const uploadPageDropZone = document.getElementById('uploadPageDropZone');
const uploadPageFileInput = document.getElementById('uploadPageFileInput');
const uploadPageUploadBtn = document.getElementById('uploadPageUploadBtn');
const uploadPageUploadProgressContainer = document.getElementById('uploadPageUploadProgressContainer');
const uploadPageUploadProgressBar = document.getElementById('uploadPageUploadProgressBar');

const musicGrid = document.getElementById('musicGrid');
const trackList = document.getElementById('trackList');
const playBtn = document.getElementById('playBtn');
const miniPlayBtn = document.getElementById('miniPlayBtn');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const currentTrackTitle = document.getElementById('currentTrackTitle');
const currentTrackArtist = document.getElementById('currentTrackArtist');
const miniCurrentTrackTitle = document.getElementById('miniCurrentTrackTitle');
const miniCurrentTrackArtist = document.getElementById('miniCurrentTrackArtist');
const searchInput = document.getElementById('searchInput');
const sidebarToggle = document.getElementById('sidebarToggle');

// Player Control Buttons
const prevTrackBtn = document.getElementById('prevTrackBtn');
const nextTrackBtn = document.getElementById('nextTrackBtn');
const miniPrevTrackBtn = document.getElementById('miniPrevTrackBtn');
const miniNextTrackBtn = document.getElementById('miniNextTrackBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');

// Global Variables
let currentSection = 'home';
let currentTrack = null;
let audio = null;
let isPlaying = false;
let currentUser = null;
let tracks = [];
let chatListener = null;

// Initialize the app
function init() {
    // Set up event listeners
    setupEventListeners();

    // Check authentication state and set up listener
    setupAuth();

    // Load initial data (tracks and chat messages)
    loadTracks();
    setupChatListener();

    // Set up search functionality
    setupSearch();

    // Set up drag and drop for both upload areas
    setupDragAndDrop(homeDropZone, homeFileInput, homeUploadProgressContainer, homeUploadProgressBar);
    setupDragAndDrop(uploadPageDropZone, uploadPageFileInput, uploadPageUploadProgressContainer, uploadPageUploadProgressBar);

    // Show initial section
    showSection('home');

    // Show welcome notification
    showNotification('Welcome to AMI SOUNDS!');
}

// Set up event listeners
function setupEventListeners() {
    // Sidebar navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            showSection(sectionId);
        });
    });

    // Sidebar toggle for mobile
    sidebarToggle.addEventListener('click', toggleSidebar);

    // Login/Logout buttons
    loginBtn.addEventListener('click', showLoginModal);
    signOutBtn.addEventListener('click', signOut);
    closeLoginModalBtn.addEventListener('click', hideLoginModal);

    // Auth modal buttons
    signInWithGoogleBtn.addEventListener('click', signInWithGoogle);
    signInWithEmailBtn.addEventListener('click', signInWithEmail);

    // Player controls
    playBtn.addEventListener('click', togglePlay);
    miniPlayBtn.addEventListener('click', togglePlay);
    progressBar.addEventListener('click', seek);
    volumeSlider.addEventListener('input', handleVolumeChange);
    prevTrackBtn.addEventListener('click', playPreviousTrack);
    nextTrackBtn.addEventListener('click', playNextTrack);
    miniPrevTrackBtn.addEventListener('click', playPreviousTrack);
    miniNextTrackBtn.addEventListener('click', playNextTrack);

    // Chat input and send button
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    sendChatMessageBtn.addEventListener('click', sendChatMessage);
}

// Set up authentication listener
function setupAuth() {
    const { auth, onAuthStateChanged } = window.firebaseApp;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            userName.textContent = `Welcome, ${user.displayName || user.email}!`;
            loginBtn.style.display = 'none';
            userInfo.style.display = 'flex';
        } else {
            // User is signed out
            currentUser = null;
            userName.textContent = 'Welcome!';
            loginBtn.style.display = 'block';
            userInfo.style.display = 'none';
        }
    });
}

// Show login modal
function showLoginModal() {
    loginModal.classList.add('active');
}

// Hide login modal
function hideLoginModal() {
    loginModal.classList.remove('active');
}

// Sign in with Google
async function signInWithGoogle() {
    const { auth, GoogleAuthProvider, signInWithPopup } = window.firebaseApp;
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        // User signed in successfully
        hideLoginModal();
        showNotification('Signed in successfully!');
    } catch (error) {
        console.error('Error signing in with Google:', error);
        showNotification(`Error signing in: ${error.message}`);
    }
}

// Sign in with Email (placeholder)
function signInWithEmail() {
    // TODO: Implement Email/Password sign-in logic using Firebase Authentication
    showNotification('Email sign-in is not yet implemented.');
}

// Sign out
async function signOut() {
    const { auth, firebaseSignOut } = window.firebaseApp;

    try {
        await firebaseSignOut(auth);
        // Signed out successfully
        showNotification('Signed out successfully!');
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification(`Error signing out: ${error.message}`);
    }
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error(`Section with ID '${sectionId}Section' not found.`);
        document.getElementById('homeSection').classList.add('active');
        sectionId = 'home';
    }

    // Update active nav item
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    pageTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

    // Update current section
    currentSection = sectionId;
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    mainContent.style.marginLeft = isCollapsed? '80px' : '280px';

    // Toggle 'open' class for mobile sidebar
    sidebar.classList.toggle('open');

    // Adjust main content margin for mobile when sidebar is open
    if (window.innerWidth <= 768) {
        mainContent.style.marginLeft = '0';
    }
}

// Toggle mini player
function toggleMiniPlayer() {
    miniPlayer.classList.toggle('active');
}

// Send chat message
async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message === '' ||!currentUser) {
        if (!currentUser) showNotification('Please sign in to chat.');
        return;
    }

    const { db, collection, addDoc } = window.firebaseApp;
    const tracksCollection = collection(db, "chat");

    try {
        await addDoc(tracksCollection, {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email,
            text: message,
            timestamp: new Date()
        });

        chatInput.value = '';
        console.log("Message sent to Firestore");
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message.');
    }
}

// Add chat message to UI
function addChatMessage(sender, name, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = `${name}: ${text}`;
    chatMessages.appendChild(messageElement);

    // Auto-scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Set up real-time listener for chat messages
function setupChatListener() {
    const { db, collection, query, orderBy, onSnapshot } = window.firebaseApp;
    const chatCollection = collection(db, "chat");

    const q = query(chatCollection, orderBy("timestamp"));

    chatListener = onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = '';
        snapshot.forEach((doc) => {
            const messageData = doc.data();
            const senderClass = currentUser && messageData.uid === currentUser.uid? 'user' : 'ai';
            addChatMessage(senderClass, messageData.name || 'Anonymous', messageData.text);
        });
        console.log("Chat messages updated.");
    }, (error) => {
        console.error("Error listening to chat messages:", error);
        showNotification("Failed to load chat messages.");
    });
}

// Show notification
function showNotification(message, duration = 3000) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Load tracks from Firestore
async function loadTracks() {
    const { db, collection, getDocs } = window.firebaseApp;
    const tracksCollection = collection(db, "tracks");

    try {
        const querySnapshot = await getDocs(tracksCollection);

        tracks = [];
        querySnapshot.forEach((doc) => {
            const trackData = doc.data();
            tracks.push({ id: doc.id,...trackData });
        });

        console.log("Tracks loaded from Firestore:", tracks);
        updateStats();
        renderMusicGrid();
        renderTrackList();
    } catch (error) {
        console.error("Error loading tracks from Firestore:", error);
        showNotification("Failed to load music library.");
    }
}

// Update stats display
function updateStats() {
    document.getElementById('totalSongs').textContent = tracks.length;
    document.getElementById('totalArtists').textContent = [...new Set(tracks.map(track => track.artist))].length;
    const totalDurationSeconds = tracks.reduce((total, track) => {
        if (track.duration && typeof track.duration === 'tring') {
            const [minutes, seconds] = track.duration.split(':').map(Number);
            return total + (minutes * 60) + (seconds || 0);
        }
        return total;
    }, 0);
    const hours = Math.floor(totalDurationSeconds / 3600);
    const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
    document.getElementById('playTime').textContent = `${hours}h ${minutes}m`;
}

// Render music grid (Home section)
function renderMusicGrid() {
    musicGrid.innerHTML = '';
    const currentSearchQuery = searchInput.value.toLowerCase();
    const tracksToRender = currentSearchQuery
       ? tracks.filter(track =>
            track.title.toLowerCase().includes(currentSearchQuery) ||
            (track.artist && track.artist.toLowerCase().includes(currentSearchQuery))
        )
        : tracks;

    tracksToRender.forEach(track => {
        const card = document.createElement('div');
        card.classList.add('music-card');
        card.innerHTML = `
            <div class="music-icon">🎵</div>
            <div class="music-title">${track.title || 'Unknown Title'}</div>
            <div class="music-artist">${track.artist || 'Unknown Artist'}</div>
        `;
        card.addEventListener('click', () => playTrack(track));
        musicGrid.appendChild(card);
    });
}

// Render track list (Library section)
function renderTrackList() {
    trackList.innerHTML = '';
    const currentSearchQuery = searchInput.value.toLowerCase();
    const tracksToRender = currentSearchQuery
       ? tracks.filter(track =>
            track.title.toLowerCase().includes(currentSearchQuery) ||
            (track.artist && track.artist.toLowerCase().includes(currentSearchQuery))
        )
        : tracks;

    tracksToRender.forEach((track, index) => {
        const item = document.createElement('div');
        item.classList.add('track-item');
        if (currentTrack && currentTrack.id === track.id) {
            item.classList.add('playing');
        }
        item.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
                <div class="music-title">${track.title || 'Unknown Title'}</div>
                <div class="music-artist">${track.artist || 'Unknown Artist'}</div>
            </div>
            <div class="track-duration">${track.duration || '0:00'}</div>
        `;
        item.addEventListener('click', () => playTrack(track));
        trackList.appendChild(item);
    });
}

// Play track
function playTrack(track) {
    // Check if the user is logged in before playing
    if (!currentUser) {
        showNotification('Please sign in to play music.');
        showLoginModal();
        return;
    }

    if (currentTrack && currentTrack.id === track.id) {
        // If clicking the currently playing track, just toggle play/pause
        togglePlay();
        return;
    }

    // If a different track is clicked, stop the current one
    if (audio) {
        audio.pause();
        audio.src = '';
    }

    currentTrack = track;
    isPlaying = true;

    // Update player info display
    updatePlayerInfo(track);

    // Create new audio element and set source
    audio = new Audio(track.file);

    // Set initial volume
    const currentVolume = volumeSlider.value / 100;
    if (audio.volume!== undefined) {
        audio.volume = currentVolume;
    }

    // Play the audio
    audio.play()
       .then(() => {
            console.log(`Playing: ${track.title}`);
            playBtn.textContent = '⏸';
            miniPlayBtn.textContent = '⏸';
            renderTrackList();
        })
       .catch(error => {
            console.error(`Error attempting to play "${track.title}":`, error);
            showNotification(`Could not play "${track.title}". Check console for details.`);
            isPlaying = false;
            playBtn.textContent = '▶';
            miniPlayBtn.textContent = '▶';
        });

    // Show players
    player.classList.add('active');
    miniPlayer.classList.add('active');
}

// Update player info display
function updatePlayerInfo(track) {
    const title = track.title || 'Unknown Title';
    const artist = track.artist || 'Unknown Artist';
    currentTrackTitle.textContent = title;
    currentTrackArtist.textContent = artist;
    miniCurrentTrackTitle.textContent = title;
    miniCurrentTrackArtist.textContent = artist;
}

// Toggle play/pause
function togglePlay() {
    if (!audio) {
        console.warn("No audio loaded to play/pause.");
        showNotification("Select a track to play.");
        return;
    }

    if (isPlaying) {
        audio.pause();
        playBtn.textContent = '▶';
        miniPlayBtn.textContent = '▶';
    } else {
        audio.play()
          .then(() => {
                playBtn.textContent = '⏸';
                miniPlayBtn.textContent = '⏸';
           })
          .catch(error => {
                console.error("Error resuming playback:", error);
                showNotification("Could not resume playback.");
           });
    }
    isPlaying =!isPlaying;
}

// Seek to position in track on progress bar click
function seek(e) {
    if (!audio || isNaN(audio.duration) || audio.duration <= 0) {
        console.warn("Cannot seek: No audio or invalid duration.");
        return;
    }

    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;
    const pos = offsetX / width;

    audio.currentTime = pos * audio.duration;
    console.log("Seeking to:", audio.currentTime, "seconds");
}

// Handle volume changes
function handleVolumeChange(e) {
    if (audio && audio.volume!== undefined) {
        audio.volume = e.target.value / 100;
        console.log("Volume set to:", audio.volume);
    }
}

// Set up search functionality
function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        if (currentSection === 'home') {
            renderMusicGrid();
        } else if (currentSection === 'library') {
            renderTrackList();
        }
    });
}

// Set up drag and drop for a specific drop zone
function setupDragAndDrop(dropZoneElement, fileInputElement, progressContainerElement, progressBarElement) {
    if (!dropZoneElement ||!fileInputElement ||!progressContainerElement ||!progressBarElement) {
        console.error("Could not set up drag and drop: Missing element(s).");
        return;
    }

    // Prevent default drag behaviors within the drop zone
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZoneElement.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZoneElement.addEventListener(eventName, () => highlight(dropZoneElement), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZoneElement.addEventListener(eventName, () => unhighlight(dropZoneElement), false);
    });

    // Handle dropped files
    dropZoneElement.addEventListener('drop', (e) => handleDrop(e, progressContainerElement, progressBarElement), false);

    // Handle file input click
    const relatedUploadButton = dropZoneElement.querySelector('.btn');
    if (relatedUploadButton) {
        relatedUploadButton.addEventListener('click', () => fileInputElement.click());
        fileInputElement.addEventListener('change', (e) => handleFiles(e.target.files, progressContainerElement, progressBarElement));
    } else {
        console.warn("Could not find upload button within drop zone:", dropZoneElement);
        fileInputElement.addEventListener('change', (e) => handleFiles(e.target.files, progressContainerElement, progressBarElement));
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(element) {
    element.classList.add('drag-over');
}

function unhighlight(element) {
    element.classList.remove('drag-over');
}

function handleDrop(e, progressContainerElement, progressBarElement) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files, progressContainerElement, progressBarElement);
}

// Process and upload files to Firebase Storage
async function handleFiles(files, progressContainerElement, progressBarElement) {
    if (!files || files.length === 0) {
        console.log("No files selected.");
        return;
    }

    if (!currentUser) {
        showNotification('Please sign in to upload files.');
        showLoginModal();
        return;
    }

    console.log(`Handling ${files.length} file(s)...`);
    progressContainerElement.style.display = 'block';

    const { storage, ref, uploadBytesResumable, db, collection, addDoc } = window.firebaseApp;
    const uploadPromises = [];
    let completedUploads = 0;
    let totalBytes = 0;
    let uploadedBytes = 0;

    Array.from(files).forEach(file => {
        const filePath = `uploads/${currentUser.uid}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, filePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
                progressBarElement.style.width = `${progress * 100}%`;
            },
            (error) => {
                console.error("File upload failed:", error);
                showNotification(`Upload of "${file.name}" failed: ${error.message}`);
            },
            () => {
                console.log(`"${file.name}" uploaded successfully.`);

                getDownloadURL(uploadTask.snapshot.ref)
                 .then(async (downloadURL) => {
                        console.log('File available at', downloadURL);

                        const trackMetadata = {
                            name: file.name,
                            title: file.name.replace(/\.[^/.]+$/, ""),
                            artist: 'Unknown Artist',
                            duration: '0:00',
                            fileURL: downloadURL,
                            filePath: filePath,
                            size: file.size,
                            type: file.type,
                            uploadedBy: currentUser.uid,
                            uploadedAt: new Date()
                        };

                        try {
                            const docRef = await addDoc(collection(db, "tracks"), trackMetadata);
                            console.log("Track metadata written to Firestore with ID:", docRef.id);
                        } catch (firestoreError) {
                            console.error("Error writing track metadata to Firestore:", firestoreError);
                            showNotification(`Failed to save metadata for "${file.name}".`);
                        }
                  })
                 .catch((urlError) => {
                        console.error("Error getting download URL:", urlError);
                        showNotification(`Failed to get download URL for "${file.name}".`);
                  });
            }
        );

        uploadPromises.push(uploadTask);
    });

    Promise.all(uploadPromises)
     .then(() => {
            console.log("All files finished uploading (successfully or with errors).");
            progressContainerElement.style.display = 'none';
            progressBarElement.style.width = '0%';
            showNotification(`${files.length} file(s) uploaded and processed!`);
            loadTracks();
      })
     .catch(error => {
            console.error("An error occurred during Promise.all for uploads:", error);
      });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);