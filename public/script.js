const API = window.location.origin;

const queueCount = document.getElementById('queueCount');
const categoriesDiv = document.getElementById('categories');
const toast = document.getElementById('toast');
const customScript = document.getElementById('customScript');

// State untuk toggle
let toggleState = {
    fly: false,
    esp: false
};

document.addEventListener('DOMContentLoaded', () => {
    loadScripts();
    updateQueueStatus();
    setInterval(updateQueueStatus, 2000);
});

async function loadScripts() {
    try {
        const res = await fetch(API + '/api/scripts');
        const data = await res.json();
        displayCategories(data.categories);
    } catch (err) {
        categoriesDiv.innerHTML = '<div class="loading">Failed to load scripts</div>';
    }
}

function displayCategories(categories) {
    if (!categories || categories.length === 0) {
        categoriesDiv.innerHTML = '<div class="loading">No scripts available</div>';
        return;
    }

    let html = '';
    
    categories.forEach(cat => {
        html += `
            <div class="category">
                <div class="category-header">
                    <i class="fas ${cat.icon}"></i>
                    <h2>${cat.name}</h2>
                </div>
                <div class="script-grid">
        `;
        
        cat.scripts.forEach(script => {
            // Semua script jadi toggle
            html += `
                <button class="script-btn ${toggleState[script.id] ? 'active' : ''}" 
                        data-id="${script.id}"
                        onclick="toggleScript('${script.id}')">
                    <i class="fas ${script.icon}"></i>
                    <span>${script.name}</span>
                </button>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    categoriesDiv.innerHTML = html;
}

// Fungsi toggle universal
async function toggleScript(scriptId) {
    const newState = !toggleState[scriptId];
    
    // Kirim command ON atau OFF
    const command = newState ? `_G.${scriptId}.on()` : `_G.${scriptId}.off()`;
    
    try {
        const sendRes = await fetch(API + '/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script: command })
        });
        
        const result = await sendRes.json();
        
        if (result.status === 'ok') {
            // Update state
            toggleState[scriptId] = newState;
            
            // Update tampilan tombol
            const btn = document.querySelector(`[data-id="${scriptId}"]`);
            if (newState) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
            
            showToast(`${scriptId} ${newState ? 'ON' : 'OFF'}`);
            updateQueueStatus();
        }
    } catch (err) {
        showToast('Failed to toggle', 'error');
    }
}

async function sendCustomScript() {
    const script = customScript.value.trim();
    
    if (!script) {
        alert('Please enter a script');
        return;
    }
    
    try {
        const res = await fetch(API + '/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script })
        });
        
        const data = await res.json();
        
        if (data.status === 'ok') {
            customScript.value = '';
            showToast('Custom script sent!');
            updateQueueStatus();
        }
    } catch (err) {
        showToast('Failed to send', 'error');
    }
}

async function clearQueue() {
    if (!confirm('Clear command queue?')) return;
    
    try {
        await fetch(API + '/api/queue', { method: 'DELETE' });
        showToast('Queue cleared');
        updateQueueStatus();
    } catch (err) {
        showToast('Failed to clear', 'error');
    }
}

async function updateQueueStatus() {
    try {
        const res = await fetch(API + '/api/queue');
        const data = await res.json();
        
        queueCount.textContent = data.length;
        document.getElementById('statusText').textContent = 'Connected';
        document.querySelector('.dot').style.background = '#ff3366';
    } catch (err) {
        document.getElementById('statusText').textContent = 'Disconnected';
        document.querySelector('.dot').style.background = '#ff3355';
        queueCount.textContent = '?';
    }
}

function showToast(message, type = 'success') {
    toast.querySelector('span').textContent = message;
    toast.style.borderColor = type === 'error' ? '#ff3355' : '#ff3366';
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        sendCustomScript();
    }
});