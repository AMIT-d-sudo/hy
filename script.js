// ===== CONFIGURATION =====
const CONFIG = {
    STORAGE_KEY: 'jigyasa_file_sharing_system',
    PASSWORD_KEY: 'jigyasa_access_password',
    PASSWORD: 'jigyasa', // Default password
    MAX_STORAGE: 1 * 1024 * 1024 * 1024, // 1GB in bytes
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB per file
    ITEMS_PER_PAGE: 6, // Reduced for mobile
    SUPPORTED_TYPES: {
        'pdf': ['pdf'],
        'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
        'document': ['doc', 'docx', 'rtf', 'odt'],
        'spreadsheet': ['xls', 'xlsx', 'csv'],
        'presentation': ['ppt', 'pptx'],
        'text': ['txt', 'md', 'json', 'xml']
    }
};

// ===== STATE =====
let state = {
    files: [],
    selectedFiles: [],
    currentPage: 1,
    searchQuery: '',
    sortBy: 'newest',
    stats: {
        totalFiles: 0,
        totalSize: 0,
        totalViews: 0,
        totalDownloads: 0,
        filesToday: 0
    },
    currentPreviewFile: null,
    isAuthenticated: false
};

// ===== DOM ELEMENTS =====
const elements = {
    // Password Screen
    passwordScreen: document.getElementById('passwordScreen'),
    passwordInput: document.getElementById('passwordInput'),
    passwordToggle: document.getElementById('passwordToggle'),
    passwordSubmit: document.getElementById('passwordSubmit'),
    passwordError: document.getElementById('passwordError'),
    
    // Loading
    loadingScreen: document.getElementById('loadingScreen'),
    loadingStatus: document.getElementById('loadingStatus'),
    
    // Main App
    mainApp: document.getElementById('mainApp'),
    
    // Logout
    logoutBtn: document.getElementById('logoutBtn'),
    mobileLogoutBtn: document.getElementById('mobileLogoutBtn'),
    
    // Mobile elements
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),
    mobileMenuClose: document.getElementById('mobileMenuClose'),
    mobileClearAllBtn: document.getElementById('mobileClearAllBtn'),
    mobileMenuBottomBtn: document.getElementById('mobileMenuBottomBtn'),
    clearSelectedBtn: document.getElementById('clearSelectedBtn'),
    
    // Storage
    usedStorage: document.getElementById('usedStorage'),
    totalStorage: document.getElementById('totalStorage'),
    freeStorage: document.getElementById('freeStorage'),
    usedPercent: document.getElementById('usedPercent'),
    storageMeter: document.getElementById('storageMeter'),
    
    // Stats
    totalFiles: document.getElementById('totalFiles'),
    totalViews: document.getElementById('totalViews'),
    totalDownloads: document.getElementById('totalDownloads'),
    filesToday: document.getElementById('filesToday'),
    
    // Upload
    fileInput: document.getElementById('fileInput'),
    browseBtn: document.getElementById('browseBtn'),
    uploadArea: document.getElementById('uploadArea'),
    dropArea: document.getElementById('dropArea'),
    selectedFiles: document.getElementById('selectedFiles'),
    selectedCount: document.getElementById('selectedCount'),
    filesListPreview: document.getElementById('filesListPreview'),
    uploadProgress: document.getElementById('uploadProgress'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    currentFile: document.getElementById('currentFile'),
    uploadSpeed: document.getElementById('uploadSpeed'),
    uploadBtn: document.getElementById('uploadBtn'),
    
    // Files
    filesGrid: document.getElementById('filesGrid'),
    emptyState: document.getElementById('emptyState'),
    searchBox: document.getElementById('searchBox'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    sortSelect: document.getElementById('sortSelect'),
    
    // Pagination
    pagination: document.getElementById('pagination'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageNumbers: document.getElementById('pageNumbers'),
    
    // Modals
    previewModal: document.getElementById('previewModal'),
    closePreviewBtn: document.getElementById('closePreviewBtn'),
    previewBody: document.getElementById('previewBody'),
    previewFileName: document.getElementById('previewFileName'),
    previewFileSize: document.getElementById('previewFileSize'),
    previewFileDate: document.getElementById('previewFileDate'),
    previewFileViews: document.getElementById('previewFileViews'),
    downloadPreviewBtn: document.getElementById('downloadPreviewBtn'),
    sharePreviewBtn: document.getElementById('sharePreviewBtn'),
    deletePreviewBtn: document.getElementById('deletePreviewBtn'),
};

// ===== PASSWORD AUTHENTICATION =====
function initPasswordAuth() {
    // Check if already authenticated
    const savedAuth = localStorage.getItem(CONFIG.PASSWORD_KEY);
    if (savedAuth === 'authenticated') {
        showMainApp();
        return;
    }
    
    // Show password screen
    elements.passwordScreen.style.display = 'flex';
    
    // Password toggle visibility
    elements.passwordToggle.addEventListener('click', () => {
        const type = elements.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        elements.passwordInput.setAttribute('type', type);
        elements.passwordToggle.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Enter key to submit
    elements.passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // Submit button
    elements.passwordSubmit.addEventListener('click', checkPassword);
}

function checkPassword() {
    const enteredPassword = elements.passwordInput.value.trim();
    
    if (enteredPassword === CONFIG.PASSWORD) {
        // Successful authentication
        elements.passwordError.style.display = 'none';
        localStorage.setItem(CONFIG.PASSWORD_KEY, 'authenticated');
        showMainApp();
    } else {
        // Wrong password
        elements.passwordError.style.display = 'flex';
        elements.passwordInput.value = '';
        elements.passwordInput.focus();
        
        // Shake animation
        elements.passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.passwordInput.style.animation = '';
        }, 500);
    }
}

function showMainApp() {
    elements.passwordScreen.style.display = 'none';
    elements.loadingScreen.style.display = 'flex';
    
    // Simulate loading process
    const loadingMessages = [
        'सिस्टम तैयार हो रहा है',
        'फाइलें लोड हो रही हैं',
        'सुरक्षा जाँच हो रही है',
        'लगभग तैयार...'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length) {
            elements.loadingStatus.textContent = loadingMessages[messageIndex];
            messageIndex++;
        } else {
            clearInterval(messageInterval);
            elements.loadingScreen.style.display = 'none';
            elements.mainApp.style.display = 'block';
            state.isAuthenticated = true;
            initApp();
        }
    }, 800);
}

function logout() {
    if (confirm('क्या आप वाकई लॉगआउट करना चाहते हैं?')) {
        localStorage.removeItem(CONFIG.PASSWORD_KEY);
        state.isAuthenticated = false;
        elements.mainApp.style.display = 'none';
        elements.passwordScreen.style.display = 'flex';
        elements.passwordInput.value = '';
        elements.passwordError.style.display = 'none';
    }
}

// ===== UTILITY FUNCTIONS =====
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    for (const [type, extensions] of Object.entries(CONFIG.SUPPORTED_TYPES)) {
        if (extensions.includes(ext)) return type;
    }
    return 'other';
}

function getFileIcon(type) {
    const icons = {
        'pdf': 'fa-file-pdf',
        'image': 'fa-file-image',
        'document': 'fa-file-word',
        'spreadsheet': 'fa-file-excel',
        'presentation': 'fa-file-powerpoint',
        'text': 'fa-file-alt',
        'other': 'fa-file'
    };
    return icons[type] || 'fa-file';
}

function getFileColor(type) {
    const colors = {
        'pdf': '#ff6b6b',
        'image': '#4cc9f0',
        'document': '#2a8fff',
        'spreadsheet': '#21bf73',
        'presentation': '#f9c74f',
        'text': '#adb5bd',
        'other': '#757575'
    };
    return colors[type] || '#757575';
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} दिन पहले`;
    if (hours > 0) return `${hours} घंटे पहले`;
    if (minutes > 0) return `${minutes} मिनट पहले`;
    return 'अभी';
}

// ===== MOBILE SPECIFIC FUNCTIONS =====
function initMobileMenu() {
    // Mobile menu toggle
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.add('active');
    });
    
    elements.mobileMenuClose.addEventListener('click', () => {
        elements.mobileMenu.classList.remove('active');
    });
    
    elements.mobileMenuBottomBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.add('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.mobileMenu.contains(e.target) && 
            !elements.mobileMenuBtn.contains(e.target) && 
            !elements.mobileMenuBottomBtn.contains(e.target)) {
            elements.mobileMenu.classList.remove('active');
        }
    });
    
    // Mobile clear all
    elements.mobileClearAllBtn.addEventListener('click', () => {
        clearAllFiles();
        elements.mobileMenu.classList.remove('active');
    });
    
    // Clear selected files
    elements.clearSelectedBtn.addEventListener('click', () => {
        state.selectedFiles = [];
        updateSelectedFilesUI();
    });
    
    // Close menu on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            elements.mobileMenu.classList.remove('active');
        });
    });
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
    
    // Update active state in bottom nav
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

function updateBottomNav() {
    // Update bottom nav based on scroll position
    const sections = ['upload', 'files', 'stats'];
    const scrollPosition = window.scrollY + 100;
    
    let currentSection = 'upload';
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element.offsetTop <= scrollPosition) {
            currentSection = section;
        }
    });
    
    // Update active button
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === getSectionName(currentSection)) {
            btn.classList.add('active');
        }
    });
}

function getSectionName(id) {
    const names = {
        'upload': 'अपलोड',
        'files': 'फाइलें',
        'stats': 'स्टैट्स'
    };
    return names[id] || '';
}

// ===== STORAGE MANAGEMENT =====
function saveToStorage() {
    try {
        const data = {
            files: state.files,
            stats: state.stats,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        updateStorageDisplay();
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        showNotification('स्टोरेज में सेव करने में त्रुटि', 'error');
        return false;
    }
}

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            state.files = data.files || [];
            state.stats = data.stats || {
                totalFiles: 0,
                totalSize: 0,
                totalViews: 0,
                totalDownloads: 0,
                filesToday: 0
            };
            
            // Update stats
            updateStats();
            updateStorageDisplay();
            return true;
        }
    } catch (error) {
        console.error('Load error:', error);
    }
    return false;
}

function updateStorageDisplay() {
    const used = state.stats.totalSize;
    const free = CONFIG.MAX_STORAGE - used;
    const percent = (used / CONFIG.MAX_STORAGE) * 100;
    
    elements.usedStorage.textContent = formatFileSize(used);
    elements.totalStorage.textContent = '1 GB';
    elements.freeStorage.textContent = formatFileSize(free);
    elements.usedPercent.textContent = percent.toFixed(1) + '%';
    elements.storageMeter.style.width = Math.min(percent, 100) + '%';
    
    // Update meter color based on usage
    if (percent > 90) {
        elements.storageMeter.style.background = 'linear-gradient(90deg, #f72585, #ff6b6b)';
    } else if (percent > 75) {
        elements.storageMeter.style.background = 'linear-gradient(90deg, #f8961e, #f9c74f)';
    } else {
        elements.storageMeter.style.background = 'linear-gradient(90deg, #4cc9f0, #4361ee)';
    }
}

function updateStats() {
    // Update from files array
    state.stats.totalFiles = state.files.length;
    state.stats.totalSize = state.files.reduce((sum, file) => sum + file.size, 0);
    state.stats.totalViews = state.files.reduce((sum, file) => sum + file.views, 0);
    state.stats.totalDownloads = state.files.reduce((sum, file) => sum + file.downloads, 0);
    
    // Calculate files uploaded today
    const today = new Date().toDateString();
    state.stats.filesToday = state.files.filter(file => 
        new Date(file.uploadDate).toDateString() === today
    ).length;
    
    // Update DOM
    elements.totalFiles.textContent = state.stats.totalFiles;
    elements.totalViews.textContent = state.stats.totalViews;
    elements.totalDownloads.textContent = state.stats.totalDownloads;
    elements.filesToday.textContent = state.stats.filesToday;
}

// ===== FILE UPLOAD =====
function initUpload() {
    // Browse button
    elements.browseBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    // File input change
    elements.fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Drag and drop
    elements.dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropArea.classList.add('dragover');
    });
    
    elements.dropArea.addEventListener('dragleave', () => {
        elements.dropArea.classList.remove('dragover');
    });
    
    elements.dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // Upload button
    elements.uploadBtn.addEventListener('click', startUpload);
}

function handleFiles(fileList) {
    const files = Array.from(fileList);
    let validFiles = 0;
    
    files.forEach(file => {
        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showNotification(`${file.name} - 50MB से बड़ी फाइल नहीं अपलोड कर सकते`, 'error');
            return;
        }
        
        // Check total storage
        const newTotalSize = state.stats.totalSize + file.size;
        if (newTotalSize > CONFIG.MAX_STORAGE) {
            showNotification('1GB स्टोरेज पूरी हो गई! कुछ फाइलें डिलीट करें', 'error');
            return;
        }
        
        // Check file type
        const type = getFileType(file.name);
        if (type === 'other') {
            showNotification(`${file.name} - यह फाइल टाइप सपोर्टेड नहीं है`, 'error');
            return;
        }
        
        // Add to selected files
        const fileData = {
            id: 'temp_' + Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            type: type,
            progress: 0
        };
        
        state.selectedFiles.push(fileData);
        validFiles++;
    });
    
    if (validFiles > 0) {
        updateSelectedFilesUI();
        showNotification(`${validFiles} फाइलें चुन ली गईं`, 'success');
    }
}

function updateSelectedFilesUI() {
    elements.selectedCount.textContent = state.selectedFiles.length;
    elements.filesListPreview.innerHTML = '';
    
    if (state.selectedFiles.length === 0) {
        elements.uploadBtn.disabled = true;
        elements.selectedFiles.style.display = 'none';
        return;
    }
    
    elements.uploadBtn.disabled = false;
    elements.selectedFiles.style.display = 'block';
    
    state.selectedFiles.forEach((fileData, index) => {
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item-preview';
        fileElement.innerHTML = `
            <div class="file-info-small">
                <div class="file-icon-small ${fileData.type}" style="background: ${getFileColor(fileData.type)}20; color: ${getFileColor(fileData.type)};">
                    <i class="fas ${getFileIcon(fileData.type)}"></i>
                </div>
                <div class="file-details-small">
                    <h5 title="${fileData.name}">${fileData.name}</h5>
                    <p>${formatFileSize(fileData.size)} • ${fileData.type}</p>
                </div>
            </div>
            <button class="btn-remove-file" onclick="removeSelectedFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        elements.filesListPreview.appendChild(fileElement);
    });
}

function removeSelectedFile(index) {
    state.selectedFiles.splice(index, 1);
    updateSelectedFilesUI();
}

async function startUpload() {
    if (state.selectedFiles.length === 0) return;
    
    elements.uploadProgress.style.display = 'block';
    elements.uploadBtn.disabled = true;
    
    const totalFiles = state.selectedFiles.length;
    let completed = 0;
    
    for (let i = 0; i < state.selectedFiles.length; i++) {
        const fileData = state.selectedFiles[i];
        
        // Update progress UI
        elements.currentFile.textContent = fileData.name;
        elements.progressPercent.textContent = `${Math.round((completed / totalFiles) * 100)}%`;
        elements.progressFill.style.width = `${(completed / totalFiles) * 100}%`;
        
        try {
            // Read file as Data URL
            const dataUrl = await readFileAsDataURL(fileData.file);
            
            // Create file object
            const fileObj = {
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: fileData.name,
                type: fileData.type,
                size: fileData.size,
                uploadDate: new Date().toISOString(),
                views: 0,
                downloads: 0,
                data: dataUrl
            };
            
            // Add to files array
            state.files.unshift(fileObj);
            
            // Update stats
            state.stats.totalSize += fileData.size;
            
            completed++;
            
            // Update progress
            elements.progressPercent.textContent = `${Math.round((completed / totalFiles) * 100)}%`;
            elements.progressFill.style.width = `${(completed / totalFiles) * 100}%`;
            
        } catch (error) {
            console.error('Upload error:', error);
            showNotification(`${fileData.name} अपलोड में त्रुटि`, 'error');
        }
    }
    
    // Complete
    elements.progressPercent.textContent = '100%';
    elements.progressFill.style.width = '100%';
    elements.currentFile.textContent = 'सभी फाइलें अपलोड हो गईं';
    
    // Save to storage
    updateStats();
    saveToStorage();
    
    // Reset
    setTimeout(() => {
        state.selectedFiles = [];
        elements.uploadProgress.style.display = 'none';
        elements.uploadBtn.disabled = false;
        updateSelectedFilesUI();
        loadFiles();
        
        showNotification(`${totalFiles} फाइलें सफलतापूर्वक अपलोड हो गईं`, 'success');
        
        // Scroll to files section on mobile
        if (window.innerWidth < 768) {
            scrollToSection('files');
        }
    }, 1000);
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ===== FILE MANAGEMENT =====
function loadFiles() {
    // Apply search
    let filteredFiles = state.files.filter(file => 
        file.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
    
    // Apply sort
    filteredFiles.sort((a, b) => {
        switch (state.sortBy) {
            case 'newest':
                return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'oldest':
                return new Date(a.uploadDate) - new Date(b.uploadDate);
            case 'largest':
                return b.size - a.size;
            case 'smallest':
                return a.size - b.size;
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
    
    // Update UI
    if (filteredFiles.length === 0) {
        elements.emptyState.style.display = 'block';
        elements.filesGrid.style.display = 'none';
        elements.pagination.style.display = 'none';
    } else {
        elements.emptyState.style.display = 'none';
        elements.filesGrid.style.display = 'grid';
        renderFilesGrid(filteredFiles);
        
        // Pagination
        const totalPages = Math.ceil(filteredFiles.length / CONFIG.ITEMS_PER_PAGE);
        if (totalPages > 1) {
            elements.pagination.style.display = 'flex';
            renderPagination(totalPages, filteredFiles);
        } else {
            elements.pagination.style.display = 'none';
        }
    }
}

function renderFilesGrid(files) {
    elements.filesGrid.innerHTML = '';
    
    // Get current page files
    const start = (state.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const end = start + CONFIG.ITEMS_PER_PAGE;
    const pageFiles = files.slice(start, end);
    
    pageFiles.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.innerHTML = `
            <div class="file-card-header">
                <div class="file-card-icon ${file.type}" style="background: ${getFileColor(file.type)}20; color: ${getFileColor(file.type)};">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                </div>
                <div class="file-card-title">
                    <h4 title="${file.name}">${file.name}</h4>
                    <p>${getTimeAgo(file.uploadDate)}</p>
                </div>
            </div>
            <div class="file-card-body">
                <div class="file-card-meta">
                    <div class="meta-item">
                        <span class="label">साइज</span>
                        <span class="value">${formatFileSize(file.size)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">व्यू</span>
                        <span class="value">${file.views}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">डाउनलोड</span>
                        <span class="value">${file.downloads}</span>
                    </div>
                </div>
                <div class="file-card-actions">
                    <button class="file-card-btn view" onclick="previewFile('${file.id}')">
                        <i class="fas fa-eye"></i>
                        <span>देखें</span>
                    </button>
                    <button class="file-card-btn download" onclick="downloadFile('${file.id}')">
                        <i class="fas fa-download"></i>
                        <span>डाउनलोड</span>
                    </button>
                    <button class="file-card-btn share" onclick="shareFile('${file.id}')">
                        <i class="fas fa-share-alt"></i>
                        <span>शेयर</span>
                    </button>
                    <button class="file-card-btn delete" onclick="deleteFile('${file.id}')">
                        <i class="fas fa-trash"></i>
                        <span>डिलीट</span>
                    </button>
                </div>
            </div>
        `;
        elements.filesGrid.appendChild(fileCard);
    });
}

function renderPagination(totalPages, filteredFiles) {
    elements.pageNumbers.innerHTML = '';
    
    // Previous button
    elements.prevPageBtn.disabled = state.currentPage === 1;
    elements.prevPageBtn.onclick = () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            loadFiles();
        }
    };
    
    // Page numbers
    const maxVisible = window.innerWidth < 768 ? 3 : 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('span');
        pageBtn.className = `page-number ${i === state.currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            state.currentPage = i;
            loadFiles();
        };
        elements.pageNumbers.appendChild(pageBtn);
    }
    
    // Next button
    elements.nextPageBtn.disabled = state.currentPage === totalPages;
    elements.nextPageBtn.onclick = () => {
        if (state.currentPage < totalPages) {
            state.currentPage++;
            loadFiles();
        }
    };
}

// ===== FILE ACTIONS =====
function previewFile(fileId) {
    const file = state.files.find(f => f.id === fileId);
    if (!file) return;
    
    // Update view count
    file.views++;
    state.stats.totalViews++;
    saveToStorage();
    updateStats();
    
    // Set current file
    state.currentPreviewFile = file;
    
    // Update preview info
    elements.previewFileName.textContent = file.name;
    elements.previewFileSize.textContent = formatFileSize(file.size);
    elements.previewFileDate.textContent = formatDate(file.uploadDate);
    elements.previewFileViews.textContent = `${file.views} व्यू`;
    
    // Clear previous content
    elements.previewBody.innerHTML = '';
    
    // Show appropriate preview
    if (file.type === 'image') {
        // Image preview
        elements.previewBody.innerHTML = `
            <div class="preview-image-container">
                <img src="${file.data}" alt="${file.name}" id="previewImg">
            </div>
        `;
        
        // Initialize image viewer for mobile
        if (window.innerWidth < 768) {
            const viewer = new Viewer(document.getElementById('previewImg'), {
                inline: false,
                toolbar: {
                    zoomIn: 1,
                    zoomOut: 1,
                    oneToOne: 1,
                    reset: 1,
                    prev: 0,
                    play: 0,
                    next: 0,
                    rotateLeft: 1,
                    rotateRight: 1,
                    flipHorizontal: 0,
                    flipVertical: 0,
                },
                movable: true,
                zoomable: true,
                rotatable: true,
                scalable: true
            });
        }
        
    } else if (file.type === 'text') {
        // Text preview
        try {
            // Extract text from data URL
            const base64Data = file.data.split(',')[1];
            const text = atob(base64Data);
            elements.previewBody.innerHTML = `
                <div class="preview-text-container">
                    <pre>${text.substring(0, 3000)}${text.length > 3000 ? '\n\n... (आगे का कंटेंट डाउनलोड करके देखें)' : ''}</pre>
                </div>
            `;
        } catch (e) {
            elements.previewBody.innerHTML = `
                <div class="preview-other-container">
                    <i class="fas fa-file-alt"></i>
                    <h4>टेक्स्ट फाइल</h4>
                    <p>इस फाइल को डाउनलोड करके देखें</p>
                </div>
            `;
        }
    } else {
        // Other file types
        elements.previewBody.innerHTML = `
            <div class="preview-other-container">
                <i class="fas ${getFileIcon(file.type)}"></i>
                <h4>${file.type.toUpperCase()} फाइल</h4>
                <p>इस फाइल को डाउनलोड करके देखें</p>
                <p><small>फाइल साइज: ${formatFileSize(file.size)}</small></p>
            </div>
        `;
    }
    
    // Set up action buttons
    elements.downloadPreviewBtn.onclick = () => downloadFile(file.id);
    elements.sharePreviewBtn.onclick = () => shareFile(file.id);
    elements.deletePreviewBtn.onclick = () => {
        deleteFile(file.id);
        elements.previewModal.style.display = 'none';
    };
    
    // Show modal
    elements.previewModal.style.display = 'flex';
    
    // Prevent body scroll on mobile
    if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
    }
}

function downloadFile(fileId) {
    const file = state.files.find(f => f.id === fileId);
    if (!file) {
        showNotification('फाइल नहीं मिली', 'error');
        return;
    }
    
    try {
        // Create download link
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download count
        file.downloads++;
        state.stats.totalDownloads++;
        saveToStorage();
        updateStats();
        loadFiles();
        
        showNotification(`${file.name} डाउनलोड शुरू हो गया`, 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('डाउनलोड में त्रुटि', 'error');
    }
}

function shareFile(fileId) {
    const file = state.files.find(f => f.id === fileId);
    if (!file) return;
    
    // Generate share URL (simulated)
    const shareUrl = `${window.location.href}#file=${fileId}`;
    
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: file.name,
            text: `${file.name} फाइल देखें - जिज्ञासा`,
            url: shareUrl
        }).then(() => {
            showNotification('फाइल शेयर की गई', 'success');
        }).catch(() => {
            copyToClipboard(shareUrl);
        });
    } else {
        copyToClipboard(shareUrl);
    }
}

function deleteFile(fileId) {
    if (!confirm('क्या आप वाकई इस फाइल को डिलीट करना चाहते हैं?')) {
        return;
    }
    
    const fileIndex = state.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;
    
    const file = state.files[fileIndex];
    
    // Remove file
    state.files.splice(fileIndex, 1);
    
    // Update stats
    state.stats.totalSize -= file.size;
    state.stats.totalViews -= file.views;
    state.stats.totalDownloads -= file.downloads;
    
    // Save and reload
    saveToStorage();
    updateStats();
    loadFiles();
    
    showNotification('फाइल डिलीट हो गई', 'success');
}

function clearAllFiles() {
    if (!confirm('क्या आप सभी फाइलें डिलीट करना चाहते हैं?\nयह एक्शन पूर्ववत नहीं किया जा सकता!')) {
        return;
    }
    
    state.files = [];
    state.stats = {
        totalFiles: 0,
        totalSize: 0,
        totalViews: 0,
        totalDownloads: 0,
        filesToday: 0
    };
    
    saveToStorage();
    updateStats();
    loadFiles();
    
    showNotification('सभी फाइलें डिलीट हो गईं', 'success');
}

// ===== UI CONTROLS =====
function initUIControls() {
    // Logout buttons
    elements.logoutBtn.addEventListener('click', logout);
    elements.mobileLogoutBtn.addEventListener('click', logout);
    
    // Search
    elements.searchBox.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        state.currentPage = 1;
        loadFiles();
    });
    
    elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchBox.value = '';
        state.searchQuery = '';
        state.currentPage = 1;
        loadFiles();
    });
    
    // Sort
    elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        state.currentPage = 1;
        loadFiles();
    });
    
    // Modal controls
    elements.closePreviewBtn.addEventListener('click', () => {
        elements.previewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.previewModal) {
            elements.previewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Touch events for mobile
    if ('ontouchstart' in window) {
        // Add touch feedback
        document.querySelectorAll('.file-card-btn, .btn-browse, .btn-upload, .nav-btn').forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            });
            
            btn.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        });
    }
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 3000;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                max-width: 400px;
            }
            .notification-success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .notification-error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .notification-info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: inherit;
                padding: 0;
                margin-left: 10px;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button
    notification.querySelector('.notification-close').onclick = () => {
        notification.remove();
    };
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('लिंक कॉपी हो गया', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('लिंक कॉपी हो गया', 'success');
    });
}

function scrollToUpload() {
    scrollToSection('upload');
}

// ===== INITIALIZATION =====
function initApp() {
    // Load data from storage
    loadFromStorage();
    
    // Initialize modules
    initMobileMenu();
    initUpload();
    initUIControls();
    
    // Load files
    loadFiles();
    
    // Show welcome message
    setTimeout(() => {
        if (state.files.length === 0) {
            showNotification('जिज्ञासा में आपका स्वागत है! पहली फाइल अपलोड करें', 'info');
        } else {
            showNotification(`जिज्ञासा में वापस आपका स्वागत है! ${state.files.length} फाइलें उपलब्ध हैं`, 'success');
        }
    }, 1500);
    
    // Update bottom nav on scroll
    window.addEventListener('scroll', updateBottomNav);
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(loadFiles, 300);
    });
    
    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            loadFiles();
        }, 250);
    });
    
    // Show bottom nav on mobile
    if (window.innerWidth < 768) {
        document.querySelector('.bottom-nav').style.display = 'flex';
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', initPasswordAuth);
