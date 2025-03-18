// State Management
let currentUser = null;
let files = JSON.parse(localStorage.getItem('files') || '[]');

// DOM Elements
const authSection = document.getElementById('auth-section');
const driveSection = document.getElementById('drive-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabButtons = document.querySelectorAll('.tab-btn');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const filesContainer = document.getElementById('files-container');
const filesSection = document.getElementById('files-section');
const shareModal = document.getElementById('share-modal');
const decryptModal = document.getElementById('decrypt-modal');
const shareLink = document.getElementById('share-link');
const decryptionKey = document.getElementById('decryption-key');
const decryptKeyInput = document.getElementById('decrypt-key-input');
const usernameDisplay = document.getElementById('username-display');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initially hide the drive section and show auth section
    driveSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    
    checkAuth();
    setupEventListeners();
});

// Authentication Functions
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showDriveSection();
    } else {
        showAuthSection();
    }
}

function setupEventListeners() {
    // Auth Tab Switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            if (button.dataset.tab === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
        });
    });

    // Login Form
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.querySelector('input[type="text"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = { username };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast('Login successful!');
            showDriveSection();
        } else {
            showToast('Invalid credentials', 'error');
        }
    });

    // Register Form
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = registerForm.querySelector('input[type="text"]').value;
        const password = registerForm.querySelector('input[type="password"]').value;
        const confirmPassword = registerForm.querySelector('input[type="password"]:last-of-type').value;

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.username === username)) {
            showToast('Username already exists', 'error');
            return;
        }

        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = { username };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showToast('Registration successful!');
        showDriveSection();
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        files = [];
        filesContainer.innerHTML = '';
        showToast('Logged out successfully!');
        showAuthSection();
    });

    // File Upload
    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('click', () => fileInput.click());
    
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
        const droppedFiles = e.dataTransfer.files;
        handleFiles(droppedFiles);
    });

    // Modal Controls
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            shareModal.classList.add('hidden');
            decryptModal.classList.add('hidden');
        });
    });

    // Copy Buttons
    document.getElementById('copy-link').addEventListener('click', () => {
        shareLink.select();
        document.execCommand('copy');
        showToast('Link copied to clipboard!');
    });

    document.getElementById('copy-key').addEventListener('click', () => {
        decryptionKey.select();
        document.execCommand('copy');
        showToast('Decryption key copied to clipboard!');
    });

    // Decrypt File
    document.getElementById('decrypt-file').addEventListener('click', () => {
        const key = decryptKeyInput.value;
        const fileId = decryptModal.dataset.fileId;
        const file = files.find(f => f.id === fileId);
        
        if (file && key === file.encryptionKey) {
            decryptAndDownload(file);
            showToast('File decrypted and downloading...');
        } else {
            showToast('Invalid decryption key!', 'error');
        }
    });
}

// UI Functions
function showAuthSection() {
    authSection.classList.remove('hidden');
    driveSection.classList.add('hidden');
    // Clear forms
    loginForm.reset();
    registerForm.reset();
    // Set login tab as active by default
    tabButtons[0].click();
}

function showDriveSection() {
    authSection.classList.add('hidden');
    driveSection.classList.remove('hidden');
    usernameDisplay.textContent = currentUser.username;
    loadFiles();
}

// File Handling Functions
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
    files.push(fileData);
    localStorage.setItem('files', JSON.stringify(files));
    displayFile(fileData);
    filesSection.classList.remove('hidden');
}

function loadFiles() {
    // Filter files for current user
    const userFiles = files.filter(file => file.userId === currentUser.username);
    const emptyState = document.getElementById('empty-state');
    
    filesSection.classList.remove('hidden');
    
    if (userFiles.length > 0) {
        filesContainer.innerHTML = '';
        emptyState.classList.add('hidden');
        userFiles.forEach(file => displayFile(file));
    } else {
        filesContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
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

function shareFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        shareLink.value = `${window.location.origin}?file=${fileId}`;
        decryptionKey.value = file.encryptionKey;
        shareModal.classList.remove('hidden');
    }
}

function downloadFile(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        decryptModal.dataset.fileId = fileId;
        decryptModal.classList.remove('hidden');
    }
}

function deleteFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        files = files.filter(f => f.id !== fileId);
        localStorage.setItem('files', JSON.stringify(files));
        loadFiles();
        showToast('File deleted successfully!');
        
        if (files.length === 0) {
            filesSection.classList.add('hidden');
        }
    }
}

function decryptAndDownload(file) {
    try {
        const decryptedContent = CryptoJS.AES.decrypt(
            file.content,
            file.encryptionKey
        ).toString(CryptoJS.enc.Utf8);

        const link = document.createElement('a');
        link.href = decryptedContent;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        decryptModal.classList.add('hidden');
        showToast('File downloaded successfully!');
    } catch (error) {
        showToast('Error decrypting file!', 'error');
    }
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

// URL Parameter Handling
function checkUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const fileId = params.get('file');
    
    if (fileId) {
        const file = files.find(f => f.id === fileId);
        if (file) {
            decryptModal.dataset.fileId = fileId;
            decryptModal.classList.remove('hidden');
        }
    }
}

// Initialize
checkUrlParameters(); 