<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notes App</title>
    <style>
    body, html {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    height: 100%;
}
.app-container {
    display: flex;
    height: 100%;
    background: linear-gradient(to bottom right, #9333ea, #2563eb, #111827);
}
.sidebar {
    width: 25%;
    padding: 1rem;
    overflow-y: auto;
    background-color: rgba(255, 255, 255, 0.1);
}
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
}
.note-header {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background-color: white;
    z-index: 10;
}
.note-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}
.button {
    background-color: #000000;
    border: none;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
}
.icon-button {
    background-color: transparent;
    border: 1px solid #ccc;
    padding: 5px;
    cursor: pointer;
    border-radius: 4px;
}
.note-card {
    background-color: white;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 4px;
}
.note-card.selected {
    background-color: #e6f3ff;
}
.note-title {
    font-size: 1.5rem;
    font-weight: bold;
    width: 50%;
    border: none;
    outline: none;
}
.note-textarea {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
}
.popup {
    display: none;
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    padding: 1rem;
    z-index: 100;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.lock-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom right, #9333ea, #2563eb, #111827);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.pin-entry {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
}
.pin-input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
    </style>
</head>
<body>
    <div id="lockScreen" class="lock-screen">
        <div class="pin-entry">
            <h2 id="pinTitle">Enter PIN</h2>
            <input type="password" id="pinInput" class="pin-input" maxlength="4" placeholder="Enter PIN">
            <input type="password" id="confirmPinInput" class="pin-input" maxlength="4" placeholder="Confirm PIN" style="display: none;">
            <button id="pinSubmit" class="button">Unlock</button>
            <p id="pinError" style="color: red;"></p>
        </div>
    </div>
    <div class="app-container">
        <div class="sidebar">
            <button id="addNote" class="button">Add Note</button>
            <div id="notesList"></div>
        </div>
        <div class="main-content">
            <div class="note-header">
                <input type="text" id="noteTitle" class="note-title" placeholder="Note Title">
                <div>
                    <button id="searchButton" class="icon-button">
                        <img src="search.svg" alt="Search" width="20" height="20">
                    </button>
                    <button id="summarizeButton" class="icon-button">
                        <img src="summarization.svg" alt="Summarize" width="20" height="20">
                    </button>
                    <button id="deleteButton" class="icon-button">
                        <img src="delete.svg" alt="Delete" width="20" height="20">
                    </button>
                    <button id="lockButton" class="icon-button">
                        <img src="lock.svg" alt="Lock" width="20" height="20">
                    </button>
                    <button id="closeButton" class="icon-button">
                        <img src="close.svg" alt="Close" width="20" height="20">
                    </button>
                </div>
            </div>
            <div class="note-content">
                <textarea id="noteContent" class="note-textarea" placeholder="Start typing your note here..."></textarea>
            </div>
        </div>
    </div>
    <div id="searchPopup" class="popup">
        <input type="text" id="searchInput" placeholder="Search notes...">
        <div id="searchResults"></div>
    </div>
    <div id="summaryPopup" class="popup">
        <h3>Summary</h3>
        <p id="summaryContent"></p>
    </div>
    <script>
        let notes = [];
        let selectedNote = null;
        let pin = localStorage.getItem('notesAppPin') || '';

        const notesList = document.getElementById('notesList');
        const noteTitle = document.getElementById('noteTitle');
        const noteContent = document.getElementById('noteContent');
        const addNoteButton = document.getElementById('addNote');
        const searchButton = document.getElementById('searchButton');
        const summarizeButton = document.getElementById('summarizeButton');
        const deleteButton = document.getElementById('deleteButton');
        const lockButton = document.getElementById('lockButton');
        const closeButton = document.getElementById('closeButton');
        const searchPopup = document.getElementById('searchPopup');
        const searchInput = document.getElementById('searchInput');
        const summaryPopup = document.getElementById('summaryPopup');
        const summaryContent = document.getElementById('summaryContent');
        const lockScreen = document.getElementById('lockScreen');
        const pinTitle = document.getElementById('pinTitle');
        const pinInput = document.getElementById('pinInput');
        const confirmPinInput = document.getElementById('confirmPinInput');
        const pinSubmit = document.getElementById('pinSubmit');
        const pinError = document.getElementById('pinError');

        function initApp() {
            loadNotes();
            renderNotesList();
            addEventListeners();
            if (pin) {
                showLockScreen();
            } else {
                showSetupPinScreen();
            }
        }

        function loadNotes() {
            const savedNotes = localStorage.getItem('notes');
            if (savedNotes) {
                notes = JSON.parse(savedNotes);
            }
        }

        function saveNotes() {
            localStorage.setItem('notes', JSON.stringify(notes));
        }

        function renderNotesList() {
            notesList.innerHTML = '';
            notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = `note-card ${selectedNote && selectedNote.id === note.id ? 'selected' : ''}`;
                noteElement.innerHTML = `
                    <h3>${note.title}</h3>
                    <p>${note.createdAt}</p>
                `;
                noteElement.addEventListener('click', () => selectNote(note));
                notesList.appendChild(noteElement);
            });
        }

        function selectNote(note) {
            selectedNote = note;
            noteTitle.value = note.title;
            noteContent.value = note.content;
            renderNotesList();
        }

        function createNote() {
            const newNote = {
                id: Date.now(),
                title: 'New Note',
                content: '',
                createdAt: new Date().toLocaleString()
            };
            notes.push(newNote);
            saveNotes();
            selectNote(newNote);
            renderNotesList();
        }

        function updateNote() {
            if (selectedNote) {
                selectedNote.title = noteTitle.value;
                selectedNote.content = noteContent.value;
                saveNotes();
                renderNotesList();
            }
        }

        function deleteNote() {
            if (selectedNote) {
                notes = notes.filter(note => note.id !== selectedNote.id);
                saveNotes();
                selectedNote = null;
                noteTitle.value = '';
                noteContent.value = '';
                renderNotesList();
            }
        }

        function searchNotes() {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredNotes = notes.filter(note =>
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm)
            );
            renderSearchResults(filteredNotes);
        }

        function renderSearchResults(filteredNotes) {
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = '';
            if (filteredNotes.length === 0) {
                searchResults.innerHTML = '<p>No results found</p>';
            } else {
                filteredNotes.forEach(note => {
                    const noteElement = document.createElement('div');
                    noteElement.className = 'note-card';
                    noteElement.innerHTML = `
                        <h3>${note.title}</h3>
                        <p>${note.content.substring(0, 50)}...</p>
                    `;
                    noteElement.addEventListener('click', () => {
                        selectNote(note);
                        searchPopup.style.display = 'none';
                    });
                    searchResults.appendChild(noteElement);
                });
            }
        }

        function summarizeNote() {
            if (selectedNote) {
                const words = selectedNote.content.split(' ');
                const summaryWords = words.slice(0, 30).join(' ');
                summaryContent.textContent = summaryWords + (words.length > 30 ? '...' : '');
                summaryPopup.style.display = 'block';
            } else {
                alert('Please select a note to summarize');
            }
        }

        function showLockScreen() {
            lockScreen.style.display = 'flex';
            pinTitle.textContent = 'Enter PIN';
            pinInput.style.display = 'block';
            confirmPinInput.style.display = 'none';
            pinSubmit.textContent = 'Unlock';
        }

        function showSetupPinScreen() {
            lockScreen.style.display = 'flex';
            pinTitle.textContent = 'Set up PIN';
            pinInput.style.display = 'block';
            confirmPinInput.style.display = 'block';
            pinSubmit.textContent = 'Set PIN';
        }

        function handlePinSubmit() {
            const enteredPin = pinInput.value;
            if (!pin) {
                // Setting up new PIN
                const confirmedPin = confirmPinInput.value;
                if (enteredPin.length !== 4) {
                    pinError.textContent = 'PIN must be 4 digits';
                    return;
                }
                if (enteredPin !== confirmedPin) {
                    pinError.textContent = 'PINs do not match';
                    return;
                }
                pin = enteredPin;
                localStorage.setItem('notesAppPin', pin);
                lockScreen.style.display = 'none';
            } else if (enteredPin === pin) {
                // Correct PIN entered
                lockScreen.style.display = 'none';
            } else {
                // Incorrect PIN
                pinError.textContent = 'Incorrect PIN';
            }
        }

        function addEventListeners() {
            addNoteButton.addEventListener('click', createNote);
            noteTitle.addEventListener('input', updateNote);
            noteContent.addEventListener('input', updateNote);
            searchButton.addEventListener('click', () => {
                searchPopup.style.display = 'block';
                searchInput.value = '';
                searchInput.focus();
                searchNotes();
            });
            summarizeButton.addEventListener('click', summarizeNote);
            deleteButton.addEventListener('click', deleteNote);
            lockButton.addEventListener('click', showLockScreen);
            closeButton.addEventListener('click', () => {
                selectedNote = null;
                noteTitle.value = '';
                noteContent.value = '';
                renderNotesList();
            });
            searchInput.addEventListener('input', searchNotes);
            pinSubmit.addEventListener('click', handlePinSubmit);
            document.addEventListener('click', (e) => {
                if (!searchPopup.contains(e.target) && e.target !== searchButton) {
                    searchPopup.style.display = 'none';
                }
                if (!summaryPopup.contains(e.target) && e.target !== summarizeButton) {
                    summaryPopup.style.display = 'none';
                }
            });
        }

        initApp();
    </script>
</body>
</html>
