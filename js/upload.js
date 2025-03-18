// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadProgress = document.getElementById('upload-progress');
const progressBars = document.getElementById('progress-bars');
const progressStatus = document.getElementById('progress-status');
const recentUploads = document.getElementById('recent-uploads');
const recentFiles = document.getElementById('recent-files');
const usernameDisplay = document.getElementById('username-display');
const driveSection = document.getElementById('drive-section');

// Variables
let currentUser = null;
let uploadQueue = [];
let uploadedFiles = [];

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
});

// Event Listeners
function setupEventListeners() {
    // File Input Change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// File Handling
function handleFiles(files) {
    uploadQueue = files;
    uploadedFiles = [];
    showUploadProgress();
    processUploadQueue();
}

function showUploadProgress() {
    dropZone.classList.add('hidden');
    uploadProgress.classList.remove('hidden');
    progressBars.innerHTML = '';
    
    uploadQueue.forEach((file, index) => {
        const progressBar = createProgressBar(file, index);
        progressBars.appendChild(progressBar);
    });
    
    updateProgressStatus();
}

function createProgressBar(file, index) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
        <div class="progress-info">
            <span class="file-name">${file.name}</span>
            <span class="progress-percentage">0%</span>
        </div>
        <div class="progress-bar">
            <div class="progress" id="progress-${index}" style="width: 0%"></div>
        </div>
    `;
    return progressContainer;
}

function processUploadQueue() {
    if (uploadQueue.length === 0) {
        showRecentUploads();
        return;
    }

    const totalFiles = uploadQueue.length + uploadedFiles.length;
    uploadQueue.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            simulateUploadProgress(index, () => {
                const fileData = {
                    id: Date.now().toString() + index,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                    content: e.target.result,
                    encryptionKey: generateEncryptionKey(),
                    userId: currentUser.username
                };
                
                encryptAndStore(fileData);
                uploadedFiles.push(fileData);
                updateProgressStatus();
                
                if (uploadedFiles.length === totalFiles) {
                    setTimeout(showRecentUploads, 500);
                }
            });
        };
        reader.readAsDataURL(file);
    });
}

function simulateUploadProgress(index, onComplete) {
    let progress = 0;
    const progressElement = document.getElementById(`progress-${index}`);
    const progressText = progressElement.parentElement.previousElementSibling.querySelector('.progress-percentage');
    
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            onComplete();
        }
        progressElement.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }, 200);
}

function updateProgressStatus() {
    const total = uploadQueue.length + uploadedFiles.length;
    progressStatus.textContent = `${uploadedFiles.length} of ${total} files completed`;
}

function showRecentUploads() {
    uploadProgress.classList.add('hidden');
    recentUploads.classList.remove('hidden');
    recentFiles.innerHTML = '';
    
    uploadedFiles.forEach(file => {
        const fileElement = createFileElement(file);
        recentFiles.appendChild(fileElement);
    });
}

function createFileElement(file) {
    const fileElement = document.createElement('div');
    fileElement.className = 'file-item fade-in';
    
    const fileSize = formatFileSize(file.size);
    const lastModified = new Date(file.lastModified).toLocaleDateString();
    
    fileElement.innerHTML = `
        <i class="fas ${getFileIcon(file.type)} fa-3x"></i>
        <p class="file-name">${file.name}</p>
        <p class="file-info">${fileSize} • ${lastModified}</p>
        <div class="upload-success">
            <i class="fas fa-check-circle"></i> Upload Complete
        </div>
    `;
    
    return fileElement;
}

function clearUploadArea() {
    recentUploads.classList.add('hidden');
    dropZone.classList.remove('hidden');
    fileInput.value = '';
    uploadQueue = [];
    uploadedFiles = [];
}

// Helper Functions
function generateEncryptionKey() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

function encryptAndStore(fileData) {
    const encryptedContent = CryptoJS.AES.encrypt(
        fileData.content,
        fileData.encryptionKey
    ).toString();

    fileData.content = encryptedContent;
    
    // Get existing files
    const files = JSON.parse(localStorage.getItem('files') || '[]');
    files.push(fileData);
    localStorage.setItem('files', JSON.stringify(files));
}

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