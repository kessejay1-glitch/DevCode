// -----------------------------
// Files
// -----------------------------
let files = {};
let currentFile = "";

// -----------------------------
// Base64 encode/decode for project
// -----------------------------
function encodeProject(code) {
    return btoa(unescape(encodeURIComponent(code)));
}
function decodeProject(code) {
    return decodeURIComponent(escape(atob(code)));
}

// -----------------------------
// Tabs
// -----------------------------
function renderTabs() {
    const tabs = document.getElementById("fileTabs");
    tabs.innerHTML = "";
    for (let name in files) {
        const tab = document.createElement("button");
        tab.textContent = name;
        tab.className = (name === currentFile ? "active" : "");
        tab.onclick = () => openFile(name);
        tabs.appendChild(tab);
    }
}

// Open file
function openFile(name) {
    saveCurrent();
    currentFile = name;
    document.getElementById("codeArea").value = files[name];
    renderTabs();
}

// Save current editor
function saveCurrent() {
    if (currentFile) files[currentFile] = document.getElementById("codeArea").value;
}

// Create new file
function createFile() {
    let name = prompt("File name");
    if (!name) return;
    if (files[name]) { alert("File exists"); return; }
    files[name] = "";
    currentFile = name;
    renderTabs();
    openFile(name);
}

// Clear editor
function clearCode() {
    document.getElementById("codeArea").value = "";
    saveCurrent();
}

// -----------------------------
// Download
// -----------------------------
function downloadCurrent() {
    saveCurrent();
    const blob = new Blob([files[currentFile]], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = currentFile;
    a.click();
}

async function downloadProject() {
    saveCurrent();
    const zip = new JSZip();
    for (let name in files) {
        zip.file(name, files[name]);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "project.zip";
    a.click();
}

// -----------------------------
// Invite links
// -----------------------------
function generateInvite() {
    saveCurrent();
    let data = { files };
    let encoded = encodeProject(JSON.stringify(data));
    let link = location.origin + location.pathname + "?project=" + encoded;
    document.getElementById("inviteLink").value = link;
}

function updateURL() {
    saveCurrent();
    let data = { files };
    let encoded = encodeProject(JSON.stringify(data));
    history.replaceState(null, null, "?project=" + encoded);
}

function loadProject() {
    const params = new URLSearchParams(location.search);
    const proj = params.get("project");
    if (proj) {
        try {
            const decoded = decodeProject(proj);
            const obj = JSON.parse(decoded);
            files = obj.files;
            currentFile = Object.keys(files)[0] || "";
        } catch {}
    } else {
        files["index.html"] = "<!DOCTYPE html>\n<html>\n<head>\n<title>Project</title>\n</head>\n<body>\n\n</body>\n</html>";
        currentFile = "index.html";
    }
    renderTabs();
    openFile(currentFile);
}

// -----------------------------
// Chat & Bug
// -----------------------------
function sendMessage() {
    const input = document.getElementById("msgInput");
    if (!input.value) return;
    const div = document.createElement("div");
    div.className = "message";
    div.textContent = "User: " + input.value;
    document.getElementById("messages").appendChild(div);
    input.value = "";
}

function reportBug() {
    const input = document.getElementById("bugInput");
    if (!input.value) return;
    const div = document.createElement("div");
    div.className = "bug";
    div.textContent = "Bug: " + input.value;
    document.getElementById("bugs").appendChild(div);
    input.value = "";
}

// -----------------------------
// Auto-save editor
// -----------------------------
document.getElementById("codeArea").addEventListener("input", () => saveCurrent());

// -----------------------------
// Init
// -----------------------------
window.onload = loadProject;