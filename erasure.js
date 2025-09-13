// Erasure page JavaScript
let erasureConfig = {
    target: '',
    algorithm: 'aes256',
    verifyWipe: true,
    generateCert: true,
    secureLog: false
};

let erasureState = {
    isRunning: false,
    currentPhase: 0,
    progress: 0,
    startTime: null,
    phaseData: [
        { name: 'Encryption', duration: 25, icon: 'fas fa-lock' },
        { name: 'Overwriting', duration: 45, icon: 'fas fa-eraser' },
        { name: 'Key Destruction', duration: 5, icon: 'fas fa-key' },
        { name: 'Verification', duration: 25, icon: 'fas fa-check-double' }
    ],
    logs: [],
    stats: {
        dataProcessed: 0,
        throughput: 0
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeErasurePage();
});

function initializeErasurePage() {
    setupEventListeners();
    setupAlgorithmSelection();
    setupDriveSelection();
    initializeProgressRing();
}

function setupEventListeners() {
    // Drive selection
    const driveSelect = document.getElementById('driveSelect');
    driveSelect?.addEventListener('change', function() {
        erasureConfig.target = this.value;
        updateStartButton();
    });

    // Start button
    const startButton = document.getElementById('startErasure');
    startButton?.addEventListener('click', showConfirmationModal);

    // Modal buttons
    const confirmButton = document.getElementById('confirmErasure');
    const cancelButton = document.getElementById('cancelErasure');
    
    confirmButton?.addEventListener('click', startErasureProcess);
    cancelButton?.addEventListener('click', hideConfirmationModal);

    // Emergency stop
    const stopButton = document.getElementById('emergencyStop');
    stopButton?.addEventListener('click', emergencyStop);

    // Options checkboxes
    const checkboxes = ['verifyWipe', 'generateCert', 'secureLog'];
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        checkbox?.addEventListener('change', function() {
            erasureConfig[id] = this.checked;
        });
    });
}

function setupAlgorithmSelection() {
    const algorithmCards = document.querySelectorAll('.algorithm-card');
    
    algorithmCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active from all cards
            algorithmCards.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked card
            this.classList.add('active');
            
            // Update config
            erasureConfig.algorithm = this.dataset.algorithm;
        });
    });
}

function setupDriveSelection() {
    const driveSelect = document.getElementById('driveSelect');
    
    // Simulate drive detection
    const simulatedDrives = [
        { value: 'C:', label: 'C: System Drive (256.7 GB)', size: '256.7 GB' },
        { value: 'D:', label: 'D: Data Drive (1.2 TB)', size: '1.2 TB' },
        { value: 'USB', label: 'USB Drive (64 GB)', size: '64 GB' },
        { value: 'folder', label: 'Documents Folder (15.3 GB)', size: '15.3 GB' }
    ];

    // Update existing options with size info
    if (driveSelect) {
        Array.from(driveSelect.options).forEach((option, index) => {
            if (index > 0 && simulatedDrives[index - 1]) {
                option.textContent = simulatedDrives[index - 1].label;
                option.dataset.size = simulatedDrives[index - 1].size;
            }
        });
    }
}

function updateStartButton() {
    const startButton = document.getElementById('startErasure');
    if (!startButton) return;

    const hasTarget = erasureConfig.target !== '';
    startButton.disabled = !hasTarget;
    
    if (hasTarget) {
        startButton.classList.add('pulse-animation');
    } else {
        startButton.classList.remove('pulse-animation');
    }
}

function showConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    const driveSelect = document.getElementById('driveSelect');
    const selectedOption = driveSelect?.selectedOptions[0];
    
    if (!modal || !selectedOption) return;

    // Populate confirmation details
    document.getElementById('confirmTarget').textContent = selectedOption.textContent;
    document.getElementById('confirmAlgorithm').textContent = getAlgorithmName(erasureConfig.algorithm);
    document.getElementById('confirmSize').textContent = selectedOption.dataset.size || 'Unknown';

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function getAlgorithmName(algorithm) {
    const names = {
        'aes256': 'AES-256 Cryptographic',
        'dod': 'DoD 5220.22-M',
        'gutmann': 'Gutmann 35-Pass'
    };
    return names[algorithm] || 'Unknown';
}

function startErasureProcess() {
    hideConfirmationModal();
    
    // Switch to progress step
    switchStep('step-progress');
    
    // Initialize erasure state
    erasureState.isRunning = true;
    erasureState.startTime = Date.now();
    erasureState.currentPhase = 0;
    erasureState.progress = 0;
    erasureState.logs = [];

    // Show certificate link
    const certLink = document.getElementById('certificateLink');
    if (certLink) certLink.classList.remove('hidden');

    // Start the erasure simulation
    simulateErasureProcess();
    
    // Start stats updates
    updateStats();
}

function simulateErasureProcess() {
    const totalDuration = erasureState.phaseData.reduce((sum, phase) => sum + phase.duration, 0);
    let elapsedTime = 0;
    
    const interval = setInterval(() => {
        if (!erasureState.isRunning) {
            clearInterval(interval);
            return;
        }
        
        elapsedTime += 0.5; // Update every 500ms
        
        // Calculate overall progress
        const overallProgress = (elapsedTime / totalDuration) * 100;
        erasureState.progress = Math.min(overallProgress, 100);
        
        // Update current phase
        let phaseStartTime = 0;
        for (let i = 0; i < erasureState.phaseData.length; i++) {
            const phaseEndTime = phaseStartTime + erasureState.phaseData[i].duration;
            
            if (elapsedTime >= phaseStartTime && elapsedTime < phaseEndTime) {
                erasureState.currentPhase = i;
                
                // Update phase progress
                const phaseProgress = ((elapsedTime - phaseStartTime) / erasureState.phaseData[i].duration) * 100;
                updatePhaseProgress(i, phaseProgress);
                break;
            }
            
            phaseStartTime = phaseEndTime;
        }
        
        // Update UI
        updateProgressDisplay();
        updateStatusMessage();
        generateLogEntry();
        
        // Check if complete
        if (elapsedTime >= totalDuration) {
            clearInterval(interval);
            completeErasure();
        }
    }, 500);
}

function updatePhaseProgress(phaseIndex, progress) {
    const phases = document.querySelectorAll('.phase');
    
    phases.forEach((phase, index) => {
        const phaseBar = phase.querySelector('.phase-bar');
        const phaseStatusIcon = phase.querySelector('.phase-status i');
        const phaseStatus = phase.querySelector('.phase-status');

        // Reset classes for each phase state container
        phase.classList.remove('active');
        phaseStatus?.classList.remove('pending', 'active', 'completed');

        if (index < phaseIndex) {
            // Completed phases
            phaseBar.style.width = '100%';
            if (phaseStatusIcon) phaseStatusIcon.className = 'fas fa-check-circle';
            if (phaseStatus) phaseStatus.classList.add('completed');
        } else if (index === phaseIndex) {
            // Current phase
            phaseBar.style.width = `${progress}%`;
            if (phaseStatusIcon) phaseStatusIcon.className = 'fas fa-spinner fa-spin';
            phase.classList.add('active');
            if (phaseStatus) phaseStatus.classList.add('active');
        } else {
            // Pending phases
            phaseBar.style.width = '0%';
            if (phaseStatusIcon) phaseStatusIcon.className = 'fas fa-clock';
            if (phaseStatus) phaseStatus.classList.add('pending');
        }
    });
}

function updateProgressDisplay() {
    const progressPercent = document.getElementById('progressPercent');
    const progressLabel = document.getElementById('progressLabel');
    const progressRing = document.querySelector('.progress-ring-progress');
    
    if (progressPercent) {
        progressPercent.textContent = `${Math.round(erasureState.progress)}%`;
    }
    
    if (progressLabel) {
        const currentPhaseName = erasureState.phaseData[erasureState.currentPhase]?.name || 'Processing';
        progressLabel.textContent = currentPhaseName;
    }
    
    if (progressRing) {
        const circumference = 534; // 2 * π * 85
        const offset = circumference - (erasureState.progress / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }
}

function updateStatusMessage() {
    const statusElement = document.getElementById('progressStatus');
    if (!statusElement) return;
    
    const messages = [
        'Encrypting data with AES-256 encryption...',
        'Performing secure overwrite with random data...',
        'Destroying encryption keys...',
        'Verifying complete data destruction...'
    ];
    
    statusElement.textContent = messages[erasureState.currentPhase] || 'Processing...';
}

function generateLogEntry() {
    if (Math.random() < 0.3) { // Generate log entry 30% of the time
        const entries = [
            'Initializing cryptographic subsystem',
            'Generating AES-256 encryption key',
            'Beginning sector-by-sector encryption',
            'Overwriting sector with random data',
            'Verifying data destruction',
            'Key destruction initiated',
            'Secure random number generation',
            'Cryptographic hash verification'
        ];
        
        const timestamp = new Date().toLocaleTimeString();
        const entry = entries[Math.floor(Math.random() * entries.length)];
        const logEntry = `[${timestamp}] ${entry}`;
        
        erasureState.logs.push(logEntry);
        
        const logOutput = document.getElementById('logOutput');
        if (logOutput) {
            logOutput.textContent = erasureState.logs.slice(-10).join('\n');
            logOutput.scrollTop = logOutput.scrollHeight;
        }
    }
}

function updateStats() {
    const interval = setInterval(() => {
        if (!erasureState.isRunning) {
            clearInterval(interval);
            return;
        }
        
        // Update elapsed time
        const elapsed = Date.now() - erasureState.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const elapsedElement = document.getElementById('elapsedTime');
        if (elapsedElement) {
            elapsedElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update data processed (simulated)
        const targetSize = getTargetSize();
        const dataProcessed = (erasureState.progress / 100) * targetSize;
        
        const dataSizeElement = document.getElementById('dataSizeValue');
        if (dataSizeElement) {
            dataSizeElement.textContent = `${dataProcessed.toFixed(1)} GB`;
        }
        
        // Update throughput (simulated)
        const throughput = Math.random() * 100 + 50; // Random throughput between 50-150 MB/s
        const throughputElement = document.getElementById('throughput');
        if (throughputElement) {
            throughputElement.textContent = `${throughput.toFixed(1)} MB/s`;
        }
    }, 1000);
}

function getTargetSize() {
    const driveSelect = document.getElementById('driveSelect');
    const selectedOption = driveSelect?.selectedOptions[0];
    const sizeText = selectedOption?.dataset.size || '256.7 GB';
    
    // Extract numeric value
    const match = sizeText.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 256.7;
}

function completeErasure() {
    erasureState.isRunning = false;
    
    // Store completion data for certificate
    const completionData = {
        target: erasureConfig.target,
        algorithm: erasureConfig.algorithm,
        startTime: erasureState.startTime,
        endTime: Date.now(),
        dataSize: getTargetSize(),
        duration: Date.now() - erasureState.startTime
    };
    
    // Store in localStorage for certificate page
    localStorage.setItem('erasureCompletion', JSON.stringify(completionData));
    
    // Generate certificate data
    generateCertificateData(completionData);
    
    // Switch to completion step
    setTimeout(() => {
        switchStep('step-complete');
        updateCompletionSummary(completionData);
    }, 1000);
}

function generateCertificateData(completionData) {
    // Generate cryptographic proof (simulated)
    const certData = {
        id: generateCertificateId(),
        issuedAt: new Date().toISOString(),
        target: getTargetDisplayName(),
        algorithm: getAlgorithmName(completionData.algorithm),
        dataSize: `${completionData.dataSize} GB`,
        duration: formatDuration(completionData.duration),
        hash: generateSecureHash(),
        signature: generateDigitalSignature(),
        publicKey: generatePublicKey()
    };
    
    localStorage.setItem('certificateData', JSON.stringify(certData));
}

function updateCompletionSummary(completionData) {
    document.getElementById('summaryAlgorithm').textContent = getAlgorithmName(completionData.algorithm);
    document.getElementById('summaryTime').textContent = formatDuration(completionData.duration);
    document.getElementById('summarySize').textContent = `${completionData.dataSize} GB`;
    document.getElementById('summaryTimestamp').textContent = new Date().toLocaleString();
}

function switchStep(targetStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.classList.add('hidden');
        step.classList.remove('active');
    });
    
    const target = document.getElementById(targetStep);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

function emergencyStop() {
    if (confirm('Are you sure you want to stop the erasure process? This may leave data in an inconsistent state.')) {
        erasureState.isRunning = false;
        location.reload();
    }
}

function initializeProgressRing() {
    // Add SVG gradient definition
    const progressRing = document.querySelector('.progress-ring');
    if (progressRing) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        
        gradient.setAttribute('id', 'grad');
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color:#667eea" />
            <stop offset="100%" style="stop-color:#764ba2" />
        `;
        
        defs.appendChild(gradient);
        progressRing.appendChild(defs);
    }
}

// Utility functions
function generateCertificateId() {
    return 'CERT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function generateSecureHash() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}

function generateDigitalSignature() {
    return Array.from(crypto.getRandomValues(new Uint8Array(64)), b => b.toString(16).padStart(2, '0')).join('');
}

function generatePublicKey() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getTargetDisplayName() {
    const driveSelect = document.getElementById('driveSelect');
    const selectedOption = driveSelect?.selectedOptions[0];
    return selectedOption?.textContent || 'Unknown Target';
}

// Add CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
    .pulse-animation {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
        100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
    }
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    }
    
    .confirmation-details {
        margin: 1.5rem 0;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;
    }
    
    .detail-item {
        margin-bottom: 0.5rem;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
    }
`;
document.head.appendChild(style);
