// DOM Elements
const fileInput = document.getElementById('file-input');
const filesContainer = document.getElementById('files-container');
const filesSection = document.getElementById('files-section');
const emptyState = document.getElementById('empty-state');
const fileSearch = document.getElementById('file-search');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');
const usernameDisplay = document.getElementById('username-display');
const driveSection = document.getElementById('drive-section');

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
    loadFiles();
});

// Event Listeners
function setupEventListeners() {
    // File Upload
    fileInput.addEventListener('change', handleFileSelect);

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
        filesContainer.className = 'files-grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    });

    listViewBtn.addEventListener('click', () => {
        filesContainer.className = 'files-list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// File Handling
function handleFileSelect(e) {
    const selectedFiles = e.target.files;
    handleFiles(selectedFiles);
}

function handleFiles(fileList) {
    Array.from(fileList).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = {
                id: Date.now().toString(),
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                content: e.target.result,
                encryptionKey: generateEncryptionKey(),
                userId: currentUser.username
            };
            
            encryptAndStore(fileData);
            showToast('File uploaded successfully!');
        };
        reader.readAsDataURL(file);
    });
}

function loadFiles() {
    const files = JSON.parse(localStorage.getItem('files') || '[]');
    const userFiles = files.filter(file => file.userId === currentUser.username);
    
    if (userFiles.length > 0) {
        emptyState.classList.add('hidden');
        filesContainer.innerHTML = '';
        userFiles.forEach(file => displayFile(file));
    } else {
        emptyState.classList.remove('hidden');
        filesContainer.innerHTML = '';
    }
}

function displayFile(file) {
    const fileElement = document.createElement('div');
    fileElement.className = 'file-item fade-in';
    
    const fileSize = formatFileSize(file.size);
    const lastModified = new Date(file.lastModified).toLocaleDateString();
    
    fileElement.innerHTML = `
        <i class="fas ${getFileIcon(file.type)} fa-3x"></i>
        <p class="file-name">${file.name}</p>
        <p class="file-info">${fileSize} • ${lastModified}</p>
        <div class="file-actions">
            <button onclick="shareFile('${file.id}')" class="btn btn-share">
                <i class="fas fa-share-alt"></i> Share
            </button>
            <button onclick="downloadFile('${file.id}')" class="btn btn-download">
                <i class="fas fa-download"></i> Download
            </button>
            <button onclick="deleteFile('${file.id}')" class="btn btn-delete">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    filesContainer.appendChild(fileElement);
}

// Helper Functions
function generateEncryptionKey() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
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