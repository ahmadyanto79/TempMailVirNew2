const API_KEY = 'ef66e4fffbmshc4ad32b653ea502p1c9116jsnef1759373801';
const API_HOST = 'temp-mail-org4.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}`;

let currentEmail = "";

// Fungsi untuk membuat email baru (Tanpa Error)
async function generateNewEmail() {
    const display = document.getElementById('email-text');
    display.innerText = "Memproses...";
    display.style.color = "#8e8e93";

    try {
        const response = await fetch(`${BASE_URL}/generate`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        
        // Cek struktur data agar tidak 'undefined'
        if (data && data.email) {
            currentEmail = data.email;
        } else if (Array.isArray(data) && data[0]) {
            currentEmail = data[0];
        } else if (typeof data === 'string') {
            currentEmail = data;
        } else {
            throw new Error("Invalid Data Format");
        }

        display.innerText = currentEmail;
        display.style.color = "#1a1a1a";
        
        // Reset list pesan setiap ganti email
        const container = document.getElementById('unread-messages-list');
        container.innerHTML = `<div class="empty-state"><span class="empty-icon">🔔</span><p>Menunggu pesan...</p></div>`;

    } catch (error) {
        console.error("API Error:", error);
        display.innerText = "Gagal (Limit Habis)";
        display.style.color = "red";
    }
}

// Fungsi Cek Pesan
async function checkInbox() {
    if (!currentEmail || currentEmail.includes("...") || currentEmail === "Gagal") return;

    try {
        const response = await fetch(`${BASE_URL}/mailbox/${currentEmail}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });
        const messages = await response.json();

        if (Array.isArray(messages) && messages.length > 0) {
            renderMessages(messages);
        }
    } catch (e) {
        console.log("Polling...");
    }
}

function renderMessages(messages) {
    const container = document.getElementById('unread-messages-list');
    container.innerHTML = "";
    
    messages.forEach(msg => {
        const card = document.createElement('div');
        card.className = 'email-box-card';
        card.style.textAlign = 'left';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between">
                <strong>${msg.from}</strong>
                <span style="color:#007AFF; font-size:10px">NEW</span>
            </div>
            <div style="font-size:13px; margin-top:5px; color:#666">${msg.subject}</div>
        `;
        card.onclick = () => alert(`Isi Pesan:\n${msg.body_text || msg.body}`);
        container.appendChild(card);
    });
}

function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    el.classList.add('active');
}

function copyEmail() {
    const text = document.getElementById('email-text').innerText;
    if (text.includes("@")) {
        navigator.clipboard.writeText(text);
        alert("Email disalin!");
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    generateNewEmail();
    setInterval(checkInbox, 5000);
});
