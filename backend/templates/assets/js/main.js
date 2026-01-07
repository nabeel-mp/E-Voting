// Helper to parse JWT without a library
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        return null;
    }
}

const navList = document.getElementById("navList");
const token = localStorage.getItem("admin_token");
const user = parseJwt(token);

// Define all possible links and their required roles/permissions
const allLinks = [
    { title: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { title: "Manage Voters", href: "/admin/voters", icon: "👥" },
    { title: "Register Voter", href: "/admin/voter/register", icon: "📝", permission: "register_voter" },
    { title: "Results", href: "/admin/results", icon: "📈" },
];

// Super Admin specific links
const superAdminLinks = [
    { title: "Create Role", href: "/admin/roles/create", icon: "🛡️" },
    { title: "Add Staff", href: "/admin/staff/add", icon: "👤" },
    { title: "Audit Logs", href: "/admin/audit-logs", icon: "📋" },
];

if (user) {
    let linksToShow = [...allLinks];

    // Add Super Admin links if applicable
    if (user.is_super || user.role === "SUPER_ADMIN") {
        linksToShow = [...linksToShow, ...superAdminLinks];
    }

    // Render the sidebar
    linksToShow.forEach(link => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="${link.href}" class="flex items-center space-x-3 py-2 px-4 rounded transition hover:bg-indigo-100 hover:text-indigo-700">
                <span>${link.icon}</span>
                <span>${link.title}</span>
            </a>`;
        navList.appendChild(li);
    });

    // Add Logout Button
    const logoutLi = document.createElement("li");
    logoutLi.className = "mt-10 border-t pt-4";
    logoutLi.innerHTML = `
        <button onclick="logout()" class="flex items-center space-x-3 py-2 px-4 w-full text-left rounded text-red-600 hover:bg-red-50">
            <span>🚪</span>
            <span>Logout</span>
        </button>`;
    navList.appendChild(logoutLi);
}

function logout() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
}