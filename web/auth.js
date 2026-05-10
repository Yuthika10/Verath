/**
 * Verath Auth Logic
 * Connects to FastAPI backend
 */

// Dynamically determine API base URL to allow access from other devices on the same network
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || !window.location.hostname
    ? "http://127.0.0.1:8000"
    : `${window.location.protocol}//${window.location.hostname}:8000`;

// Tab switching
function showLogin() {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const btn = document.getElementById('login-btn');
    const errorEl = document.getElementById('login-error');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';
    errorEl.textContent = '';

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('verath_token', data.access_token);
            localStorage.setItem('verath_username', username);
            window.location.href = 'index.html';
        } else {
            errorEl.textContent = data.detail || 'Invalid credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = 'Could not connect to server. Please check if the backend is running.';
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Sign in <i class="fa-solid fa-arrow-right"></i>';
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const btn = document.getElementById('register-btn');
    const errorEl = document.getElementById('register-error');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account...';
    errorEl.textContent = '';

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            errorEl.style.color = 'var(--accent-secondary)';
            errorEl.textContent = 'Account created! Redirecting...';
            localStorage.setItem('verath_token', data.access_token);
            localStorage.setItem('verath_username', username);
            setTimeout(() => window.location.href = 'index.html', 500);
        } else {
            errorEl.style.color = 'var(--danger)';
            errorEl.textContent = data.detail || 'Registration failed';
        }
    } catch (error) {
        console.error('Register error:', error);
        errorEl.style.color = 'var(--danger)';
        errorEl.textContent = 'Could not connect to server.';
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Create account <i class="fa-solid fa-arrow-right"></i>';
    }
}

// Check system status on load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        const statText = document.querySelector('.stat-pill span:last-child');
        const statDot = document.querySelector('.stat-dot');
        
        if (data.overall === 'healthy') {
            statText.textContent = 'System Online';
            statDot.style.background = 'var(--accent-secondary)';
        } else {
            statText.textContent = 'System Degraded';
            statDot.style.background = 'var(--accent-warm)';
        }
    } catch (error) {
        const statText = document.querySelector('.stat-pill span:last-child');
        const statDot = document.querySelector('.stat-dot');
        statText.textContent = 'System Offline';
        statDot.style.background = 'var(--danger)';
    }
});
