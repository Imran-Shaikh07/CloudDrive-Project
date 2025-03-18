// DOM Elements
const sharedContainer = document.getElementById('shared-container');
const sharedSection = document.getElementById('shared-section');
const emptyState = document.getElementById('empty-state');
const fileSearch = document.getElementById('file-search');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');
const usernameDisplay = document.getElementById('username-display');
const driveSection = document.getElementById('drive-section');
const decryptModal = document.getElementById('decrypt-modal');
const decryptKeyInput = document.getElementById('decrypt-key-input');

// Variables
let currentUser = null;
let files = JSON.parse(localStorage.getItem('files') || '[]');

// Check Authentication
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    usernameDisplay.textContent = currentUser.username;
    driveSection.classList.remove('hidden');
    setupEventListeners();
    loadSharedFiles();
});

// Event Listeners
function setupEventListeners() {
    // Search
    fileSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const files = document.querySelectorAll('.file-item');
        
        files.forEach(file => {
            const fileName = file.querySelector('.file-name').textContent.toLowerCase();
            if (fileName.includes(searchTerm)) {
                file.style.display = 'block';
            } else {
                file.style.display = 'none';
            }
        });
    });

    // View Toggle
    gridViewBtn.addEventListener('click', () => {
        sharedContainer.className = 'files-grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    });

    listViewBtn.addEventListener('click', () => {
        sharedContainer.className = 'files-list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// File Display Functions
function loadSharedFiles() {
    // Get shared files (files that have been accessed via share link)
    const sharedFiles = files.filter(file => {
        const lastAccessed = localStorage.getItem(`file_${file.id}_lastAccessed`);
        return lastAccessed && file.userId !== currentUser.username;
    });
    
    if (sharedFiles.length > 0) {
        emptyState.classList.add('hidden');
        sharedContainer.innerHTML = '';
        sharedFiles.forEach(file => displayFile(file));
    } else {
        emptyState.classList.remove('hidden');
        sharedContainer.innerHTML = '';
    }
}

function displayFile(file) {
    const fileElement = document.createElement('div');
    fileElement.className = 'file-item fade-in';
    
    const fileSize = formatFileSize(file.size);
    const lastAccessed = new Date(parseInt(localStorage.getItem(`file_${file.id}_lastAccessed`))).toLocaleDateString();
    
    fileElement.innerHTML = `
        <i class="fas ${getFileIcon(file.type)} fa-3x"></i>
        <p class="file-name">${file.name}</p>
        <p class="file-info">${fileSize} • Last accessed: ${lastAccessed}</p>
        <div class="file-actions">
            <button onclick="decryptAndDownload('${file.id}')" class="btn btn-download">
                <i class="fas fa-download"></i> Download
            </button>
        </div>
    `;
    
    sharedContainer.appendChild(fileElement);
}

// File Actions
function decryptAndDownload(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        decryptModal.dataset.fileId = fileId;
        decryptModal.classList.remove('hidden');
    }
}

function closeDecryptModal() {
    decryptModal.classList.add('hidden');
    decryptKeyInput.value = '';
}

// Helper Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'fa-image';
    if (fileType.startsWith('video/')) return 'fa-video';
    if (fileType.startsWith('audio/')) return 'fa-music';
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('word')) return 'fa-file-word';
    if (fileType.includes('excel')) return 'fa-file-excel';
    return 'fa-file';
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
} 