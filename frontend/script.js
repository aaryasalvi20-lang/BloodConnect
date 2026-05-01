// Base URL for API
const API_URL = 'http://localhost:5000/api';

// --- Theme Management ---
const themeToggleBtn = document.getElementById('theme-toggle');
const darkIcon = document.getElementById('moon-icon');
const lightIcon = document.getElementById('sun-icon');

function updateThemeIcons() {
    if(!themeToggleBtn || !darkIcon || !lightIcon) return;
    if (document.documentElement.classList.contains('dark')) {
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
    } else {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
    }
}

// Check for saved theme preference or system preference
if (sessionStorage.getItem('color-theme') === 'dark' || (!('color-theme' in sessionStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
updateThemeIcons();

if(themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
        if (sessionStorage.getItem('color-theme')) {
            if (sessionStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                sessionStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                sessionStorage.setItem('color-theme', 'light');
            }
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                sessionStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                sessionStorage.setItem('color-theme', 'dark');
            }
        }
        updateThemeIcons();
    });
}

// --- Auth Utilities ---
function getToken() {
    return sessionStorage.getItem('token');
}

function getUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function loginSuccess(data) {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify({id: data.id, name: data.name, role: data.role}));
    window.location.href = `${data.role}/${data.role}-dashboard.html`;
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    const isSubfolder = window.location.pathname.includes('/donor/') || window.location.pathname.includes('/hospital/') || window.location.pathname.includes('/camp/');
    window.location.href = isSubfolder ? '../login.html' : 'login.html';
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`Fetching: ${API_URL}${endpoint}`, options);
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
    } else {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
    }

    if (!response.ok) {
        if (response.status === 401) {
            logout();
        }
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

// Basic Setup for Pages that require Auth
function checkAuth() {
    const user = getUser();
    const path = window.location.pathname;
    
    // Pages that don't need auth
    const publicPages = ['login.html', 'register.html', 'index.html', '/'];
    const isPublic = publicPages.some(p => path.includes(p) || path === '/');

    if (!user && !isPublic) {
        const isSubfolder = path.includes('/donor/') || path.includes('/hospital/') || path.includes('/camp/');
        window.location.href = isSubfolder ? '../login.html' : 'login.html';
    }

    // Role-specific protection
    if (user) {
        if (path.includes('/donor/') && user.role !== 'donor') {
            window.location.href = `../${user.role}/${user.role}-dashboard.html`;
        }
        if (path.includes('/hospital/') && user.role !== 'hospital') {
            window.location.href = `../${user.role}/${user.role}-dashboard.html`;
        }
        if (path.includes('/camp/') && user.role !== 'camp') {
            window.location.href = `../${user.role}/${user.role}-dashboard.html`;
        }
    }

    return user;
}

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    
    // Wire up generic logout buttons
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Populate generic UI based on user role
    if (user) {
        // Update user name and initials
        const userNameDisplays = document.querySelectorAll('.user-name-display');
        userNameDisplays.forEach(el => el.textContent = user.name);
        if (user.name) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            document.querySelectorAll('.user-init').forEach(el => el.textContent = initials);
        }

        // Sidebar dynamic injection if requested
        const sidebarNav = document.getElementById('sidebar-nav');
        if (sidebarNav) {
            renderSidebar(sidebarNav, user);
        }

        // Fallback for hardcoded sidebars with data-role-only
        const roleElements = document.querySelectorAll('[data-role-only]');
        roleElements.forEach(el => {
            if (el.getAttribute('data-role-only') !== user.role) {
                el.remove();
            } else {
                el.classList.remove('hidden');
            }
        });

        // Update generic dashboard links
        const dashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');
        dashboardLinks.forEach(link => {
            const isSubfolder = window.location.pathname.includes('/donor/') || window.location.pathname.includes('/hospital/') || window.location.pathname.includes('/camp/');
            link.href = isSubfolder ? `../${user.role}/${user.role}-dashboard.html` : `${user.role}/${user.role}-dashboard.html`;
        });
    }
});

function renderSidebar(container, user) {
    const path = window.location.pathname;
    const isSubfolder = path.includes('/donor/') || path.includes('/hospital/') || path.includes('/camp/');
    const up = isSubfolder ? '../' : '';

    const navItems = [
        { name: 'Dashboard', icon: 'fas fa-home', href: isSubfolder ? `${user.role}-dashboard.html` : `${user.role}/${user.role}-dashboard.html` },
        { name: 'Donors Directory', icon: 'fas fa-users', href: isSubfolder ? 'donors.html' : 'hospital/donors.html', role: 'hospital' },
        { name: 'Our Requests', icon: 'fas fa-hand-holding-medical', href: `${up}requests.html`, role: 'donor' },
        { name: 'Manage Requests', icon: 'fas fa-tasks', href: `${up}requests.html`, role: 'hospital' },
        
        // Hospital Additional Items
        { name: 'View Camps', icon: 'fas fa-eye', href: isSubfolder ? 'view-camps.html' : 'hospital/view-camps.html', role: 'hospital' },
        { name: 'Blood Inventory', icon: 'fas fa-vials', href: isSubfolder ? 'blood-inventory.html' : 'hospital/blood-inventory.html', role: 'hospital' },
        
        // Donor Additional Items
        { name: 'Nearby Camps', icon: 'fas fa-campground', href: isSubfolder ? 'nearby-camps.html' : 'donor/nearby-camps.html', role: 'donor' },
        { name: 'Donation History', icon: 'fas fa-history', href: isSubfolder ? 'donation-history.html' : 'donor/donation-history.html', role: 'donor' },

        // Camp Items
        { name: 'Create Camp', icon: 'fas fa-plus-circle', href: isSubfolder ? 'create-camp.html' : 'camp/create-camp.html', role: 'camp' },
        { name: 'Manage Camp', icon: 'fas fa-calendar-alt', href: isSubfolder ? 'manage-camps.html' : 'camp/manage-camps.html', role: 'camp' },
        { name: 'Registered Donors', icon: 'fas fa-user-check', href: isSubfolder ? 'registered-donors.html' : 'camp/registered-donors.html', role: 'camp' },
        { name: 'Hospitals Nearby', icon: 'fas fa-hospital', href: isSubfolder ? 'nearby-hospitals.html' : 'camp/nearby-hospitals.html', role: 'camp' },
        
        { name: 'Notifications', icon: 'fas fa-bell', href: `${up}notifications.html` },
        { name: 'Profile Settings', icon: 'fas fa-user-cog', href: `${up}profile.html` }
    ];

    container.innerHTML = navItems
        .filter(item => !item.role || item.role === user.role)
        .map(item => {
            const isActive = path.includes(item.href.replace('../', ''));
            return `
            <a href="${item.href}" class="group flex items-center px-3 py-2 text-base font-medium rounded-md transition ${isActive ? 'bg-red-50 text-primary dark:bg-gray-700 dark:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}">
                <i class="${item.icon} w-6 text-center mr-3"></i> ${item.name}
            </a>
        `}).join('');
    updateThemeIcons();
}
