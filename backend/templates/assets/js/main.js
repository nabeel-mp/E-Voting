// backend/templates/assets/js/main.js
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) { return null; }
}

const token = localStorage.getItem("admin_token");
const user = parseJwt(token);

// Redirect to login if no token is found (unless already on login page)
if (!token && window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login";
}

const navList = document.getElementById("navList");
if (navList && user) {
    // Shared links for all admin levels
    const links = [
        { title: "Dashboard", href: "/admin/dashboard", icon: "📊" },
        { title: "Results", href: "/admin/results", icon: "📈" },
        { title: "Settings", href: "/admin/settings", icon: "⚙️" },
    ];

    // Conditional links based on permissions/roles
    if (user.is_super || user.role === "SUPER_ADMIN") {
        links.push({ title: "Create Role", href: "/admin/roles/create", icon: "🛡️" });
        links.push({ title: "Add Staff", href: "/admin/staff/add", icon: "👤" });
        links.push({ title: "Audit Logs", href: "/admin/audit-logs", icon: "📋" });
        links.push({ title: "Manage Candidates", href: "/admin/candidates", icon: "🗳️" });
    }

    // Voters link usually requires 'register_voter' permission
    links.push({ title: "Manage Voters", href: "/admin/voters", icon: "👥" });

    navList.innerHTML = links.map(link => `
        <li>
            <a href="${link.href}" class="flex items-center space-x-3 py-2 px-4 rounded transition hover:bg-indigo-100 hover:text-indigo-700">
                <span>${link.icon}</span>
                <span>${link.title}</span>
            </a>
        </li>
    `).join('') + `
        <li class="mt-10 border-t pt-4">
            <button onclick="logout()" class="flex items-center space-x-3 py-2 px-4 w-full text-left rounded text-red-600 hover:bg-red-50">
                <span>🚪</span> <span>Logout</span>
            </button>
        </li>
    `;
}

function logout() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
}