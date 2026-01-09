// backend/templates/assets/js/main.js

const API_BASE_URL = "http://localhost:3000";

// --- 1. AUTHENTICATION & TOKEN HANDLING ---

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) { return null; }
}

const token = localStorage.getItem("admin_token");
const user = parseJwt(token);

// Redirect to login if no token is found and we are not on the login page
if (!token && window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login";
}

// --- 2. SIDEBAR CONFIGURATION ---

const menuItems = [
    { title: "Overview", path: "/admin/dashboard", reqPermission: null, icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>` },
    { title: "Voters", path: "/admin/voters", reqPermission: "register_voter", icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>` },
    { title: "Candidates", path: "/admin/candidates", reqPermission: "SUPER_ADMIN", icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>` },
    { title: "Results", path: "/admin/results", reqPermission: "view_results", icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>` },
    { title: "Manage Staff", path: "/admin/staff/add", reqPermission: "manage_admins", icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>` },
    { title: "System Admins", path: "/admin/system-admins", reqPermission: "SUPER_ADMIN", icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>` },
    { title: "Manage Roles", path: "/admin/roles/create", reqPermission: "SUPER_ADMIN", icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>` },
    { title: "Audit Logs", path: "/admin/audit-logs", reqPermission: "SUPER_ADMIN", icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v.001M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>` },
    { title: "Settings", path: "/admin/settings", reqPermission: null, icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>` }
];

function renderSidebar() {
    const navList = document.getElementById("navList");
    const userInfo = document.getElementById("userInfo");
    
    if (!navList || !user) return;

    const isSuperAdmin = user.is_super || user.role === "SUPER_ADMIN";
    const userPermissions = (user.permissions || "").split(","); 
    const currentPath = window.location.pathname;

    const visibleItems = menuItems.filter(item => {
        if (!item.reqPermission) return true;
        if (isSuperAdmin) return true;
        return userPermissions.includes(item.reqPermission);
    });

    navList.innerHTML = visibleItems.map(item => {
        // We add a 'nav-link' class to easily find these later
        return `
        <li>
            <a href="${item.path}" class="nav-link group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-1 transition-all">
                <span class="nav-icon transition-colors">${item.icon}</span>
                <span class="font-medium">${item.title}</span>
            </a>
        </li>
    `}).join('') + `
        <li class="mt-8 pt-4 border-t border-slate-700/50">
            <button onclick="logout()" class="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group">
                <svg class="w-5 h-5 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <span class="font-medium">Sign Out</span>
            </button>
        </li>
    `;

    // Render User Info
    if (userInfo && userInfo.innerHTML.trim() === "") {
        const roleDisplay = user.role.replace(/_/g, ' ');
        userInfo.innerHTML = `
            <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                ${user.role.substring(0, 2).toUpperCase()}
            </div>
            <div class="text-sm overflow-hidden">
                <p class="font-medium text-white truncate">Admin User</p>
                <p class="text-xs text-indigo-400 truncate font-semibold tracking-wide">${roleDisplay}</p>
            </div>
        `;
    }
    
    // Set initial active state based on current URL
    updateSidebarActiveState();
}

function updateSidebarActiveState() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
        const path = link.getAttribute('href');
        const icon = link.querySelector('.nav-icon');
        
        // Classes for Active State
        const activeClasses = ["bg-indigo-600/20", "text-indigo-300", "border-indigo-500/20", "shadow-sm"];
        const inactiveClasses = ["text-slate-400", "hover:bg-slate-800", "hover:text-white", "border-transparent"];

        if (path === currentPath) {
            link.classList.add(...activeClasses);
            link.classList.remove(...inactiveClasses);
            if(icon) {
                icon.classList.add('text-indigo-400');
                icon.classList.remove('group-hover:text-indigo-400');
            }
        } else {
            link.classList.remove(...activeClasses);
            link.classList.add(...inactiveClasses);
            if(icon) {
                icon.classList.remove('text-indigo-400');
                icon.classList.add('group-hover:text-indigo-400');
            }
        }
    });
}

function logout() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
}


// --- 3. SPA NAVIGATION (PREVENTS FULL RELOAD) ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render of Sidebar
    renderSidebar();

    // Intercept Link Clicks to prevent default refresh
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        
        // Only intercept internal admin links
        // Ignore links with target="_blank" or download attributes
        if (link && 
            link.getAttribute('href') && 
            link.href.startsWith(window.location.origin + '/admin') && 
            !link.hasAttribute('target') && 
            !link.hasAttribute('download')) {
            
            e.preventDefault();
            navigateTo(link.href);
        }
    });

    // Handle Browser Back/Forward buttons
    window.addEventListener('popstate', () => {
        loadPage(window.location.href);
    });
});

async function navigateTo(url) {
    // Update browser history URL without reloading
    history.pushState(null, null, url);
    await loadPage(url);
}

async function loadPage(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load page");

        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // 1. Update Document Title
        document.title = doc.title;

        // 2. Swap ONLY the <main> content (Preserves Sidebar)
        // This keeps the sidebar fixed and only refreshes the main content area
        const newMain = doc.querySelector('main');
        const currentMain = document.querySelector('main');

        if (newMain && currentMain) {
            currentMain.replaceWith(newMain);
        } else {
            // Fallback if structure is missing
            window.location.reload();
            return;
        }

        // 3. Execute Scripts found in the new content
        // (innerHTML replacement does not auto-execute script tags, so we do it manually)
        const scripts = newMain.querySelectorAll('script');
        scripts.forEach(oldScript => {
            // Avoid re-running main.js itself
            if (oldScript.src && oldScript.src.includes('main.js')) return;

            const newScript = document.createElement('script');
            // Copy all attributes (src, type, etc.)
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            // Copy inline content
            newScript.textContent = oldScript.textContent;
            // Append to document to execute
            newMain.appendChild(newScript); 
        });

        // 4. Update Sidebar Active Highlight without re-rendering the whole sidebar
        updateSidebarActiveState();

    } catch (err) {
        console.error("Navigation error:", err);
        // Fallback to full reload if fetch fails
        window.location.href = url;
    }
}