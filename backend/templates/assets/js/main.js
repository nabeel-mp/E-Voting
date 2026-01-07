const navList = document.getElementById("navList");
const links = [
  { title: "Dashboard", href: "dashboard.html" },
  { title: "Voters", href: "voters.html" },
  { title: "Candidates", href: "candidates.html" },
  { title: "Results", href: "results.html" },
  { title: "Settings", href: "settings.html" },
];

links.forEach(link => {
  const li = document.createElement("li");
  li.innerHTML = `
    <a href="${link.href}" class="block py-2 px-4 rounded hover:bg-indigo-100 hover:text-indigo-700">
      ${link.title}
    </a>`;
  navList.appendChild(li);
});
