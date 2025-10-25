// === ADMIN AUTHENTICATION WITH DATABASE ===

const API_URL = 'https://srv96854.seohost.com.pl/api';

// Store session
let adminSession = null;

// Load session from sessionStorage
function loadAdminSession() {
    const stored = sessionStorage.getItem('adminSession');
    if (stored) {
        adminSession = JSON.parse(stored);
        return true;
    }
    return false;
}

// Save session
function saveAdminSession(session) {
    adminSession = session;
    sessionStorage.setItem('adminSession', JSON.stringify(session));
}

// Clear session
function clearAdminSession() {
    adminSession = null;
    sessionStorage.removeItem('adminSession');
}

// Admin Panel Functions
function openAdminLogin(e) {
    e.preventDefault();
    document.getElementById('admin-modal').classList.add('active');
    resetLoginSteps();
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
    resetLoginSteps();
}

function resetLoginSteps() {
    document.querySelectorAll('.login-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step-login').classList.add('active');
    document.getElementById('admin-dashboard').classList.remove('active');
    document.getElementById('admin-login').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('mfa-code-input').value = '';
    document.getElementById('mfa-code-display').textContent = '------';
}

// Step 1: Login with database
async function requestMFA() {
    const username = document.getElementById('admin-login').value;
    const password = document.getElementById('admin-password').value;

    if (!username || !password) {
        showError('step-login', 'Proszę wypełnić wszystkie pola!');
        return;
    }

    // Show loading
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Logowanie...';

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!data.success) {
            showError('step-login', data.error || 'Nieprawidłowe dane logowania');
            return;
        }

        // Success - show MFA step
        document.getElementById('step-login').classList.remove('active');
        document.getElementById('step-mfa').classList.add('active');
        
        // Display MFA code (in production this would be sent via SMS/Email)
        document.getElementById('mfa-code-display').textContent = data.mfaCode;
        
        // Store username for MFA verification
        sessionStorage.setItem('mfaUsername', username);

        console.log('MFA Code:', data.mfaCode);

    } catch (error) {
        console.error('Login error:', error);
        showError('step-login', 'Błąd połączenia z serwerem');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Dalej';
    }
}

// Step 2: Verify MFA code
async function verifyMFA() {
    const username = sessionStorage.getItem('mfaUsername');
    const mfaCode = document.getElementById('mfa-code-input').value;

    if (!mfaCode) {
        showError('step-mfa', 'Proszę wprowadzić kod weryfikacyjny!');
        return;
    }

    // Show loading
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Weryfikacja...';

    try {
        const response = await fetch(`${API_URL}/admin/verify-mfa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, mfaCode })
        });

        const data = await response.json();

        if (!data.success) {
            showError('step-mfa', data.error || 'Nieprawidłowy kod weryfikacyjny');
            return;
        }

        // Success - save session and show dashboard
        saveAdminSession({
            token: data.sessionToken,
            user: data.user,
            loginTime: Date.now()
        });

        sessionStorage.removeItem('mfaUsername');
        
        document.getElementById('step-mfa').classList.remove('active');
        document.getElementById('admin-dashboard').classList.add('active');

        console.log('✅ Logged in as:', data.user.username);

    } catch (error) {
        console.error('MFA verification error:', error);
        showError('step-mfa', 'Błąd połączenia z serwerem');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Weryfikuj';
    }
}

function backToLogin() {
    document.getElementById('step-mfa').classList.remove('active');
    document.getElementById('step-login').classList.add('active');
    sessionStorage.removeItem('mfaUsername');
}

function adminLogout() {
    clearAdminSession();
    closeAdminModal();
    alert('Wylogowano pomyślnie!');
}

// Helper: Show error message
function showError(stepId, message) {
    const step = document.getElementById(stepId);
    
    // Remove old errors
    const oldError = step.querySelector('.error-message');
    if (oldError) oldError.remove();
    
    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    step.insertBefore(errorDiv, step.querySelector('.form-group'));
    
    setTimeout(() => errorDiv.remove(), 3000);
}

// Check if admin is already logged in on page load
if (loadAdminSession()) {
    console.log('✅ Admin session active:', adminSession.user.username);
}