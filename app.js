/* ==========================================================================
   RAIL-GUARD AI - INTERACTIVE APPLICATION LOGIC (SIH 2026)
   ========================================================================== */

let anomalyData = [
  {
    defect_id: "DEF-9041",
    timestamp: "2026-08-05 23:40:12",
    train_no: "12675",
    train_name: "Cheran Express",
    track_id: "TRK-SR-402B",
    km_mark: "142.8",
    speed_kmh: 88,
    gps_coords: "13.0827° N, 80.2707° E",
    defect_type: "Transverse Rail Crack",
    severity: "CRITICAL",
    confidence: "96.4%",
    image_file: "https://images.unsplash.com/photo-1515165562839-9784018e00bf?auto=format&fit=crop&w=600&q=80",
    status: "DISPATCHED"
  },
  {
    defect_id: "DEF-9040",
    timestamp: "2026-08-05 23:15:00",
    train_no: "16340",
    train_name: "Nagercoil Express",
    track_id: "TRK-SR-512A",
    km_mark: "310.4",
    speed_kmh: 75,
    gps_coords: "11.6643° N, 78.1460° E",
    defect_type: "Missing Track Fastener",
    severity: "WARNING",
    confidence: "91.2%",
    image_file: "https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=600&q=80",
    status: "INVESTIGATING"
  },
  {
    defect_id: "DEF-9039",
    timestamp: "2026-08-05 22:50:33",
    train_no: "12007",
    train_name: "Shatabdi Express",
    track_id: "TRK-SR-201C",
    km_mark: "89.2",
    speed_kmh: 110,
    gps_coords: "12.9716° N, 79.1585° E",
    defect_type: "Minor Surface Wear",
    severity: "LOW",
    confidence: "88.0%",
    image_file: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
    status: "MONITORED"
  },
  {
    defect_id: "DEF-9038",
    timestamp: "2026-08-05 21:10:05",
    train_no: "22625",
    train_name: "Double Decker",
    track_id: "TRK-SR-104D",
    km_mark: "12.0",
    speed_kmh: 45,
    gps_coords: "13.0800° N, 80.2750° E",
    defect_type: "Fishplate Bolt Loose",
    severity: "CRITICAL",
    confidence: "94.8%",
    image_file: "https://images.unsplash.com/photo-1515165562839-9784018e00bf?auto=format&fit=crop&w=600&q=80",
    status: "REPAIRED"
  }
];

let speedChartInstance = null;
let pieChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initNavigation();
  renderOverviewTable();
  renderAnomalyCards('all');
  initCharts();
  initSimulationButton();
  updateRawInspector();
  calculateAIRisk();
});

// Clock
function initClock() {
  const clockEl = document.getElementById('live-clock');
  setInterval(() => {
    const now = new Date();
    clockEl.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' IST';
  }, 1000);
}

// Navigation / Tab Switching
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));

  const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  const activePage = document.getElementById(`tab-${tabId}`);

  if (activeNav) activeNav.classList.add('active');
  if (activePage) activePage.classList.add('active');
}

// Render Overview Recent Table
function renderOverviewTable() {
  const tbody = document.getElementById('overview-recent-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  anomalyData.forEach(item => {
    const tr = document.createElement('tr');
    const badgeClass = item.severity === 'CRITICAL' ? 'red' : (item.severity === 'WARNING' ? 'amber' : 'green');
    
    tr.innerHTML = `
      <td>${item.timestamp}</td>
      <td><strong>${item.train_no}</strong> (${item.train_name})</td>
      <td>${item.track_id}</td>
      <td>KM ${item.km_mark}</td>
      <td>${item.defect_type}</td>
      <td><span class="badge ${badgeClass}">${item.severity}</span></td>
      <td><small>${item.status}</small></td>
      <td><button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="openModal('${item.defect_id}')">Inspect</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Anomaly Cards
function renderAnomalyCards(filter = 'all') {
  const container = document.getElementById('anomaly-cards-container');
  if (!container) return;
  container.innerHTML = '';

  const filtered = filter === 'all' ? anomalyData : anomalyData.filter(d => d.severity === filter);

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = `anomaly-card ${item.severity.toLowerCase()}`;
    card.onclick = () => openModal(item.defect_id);

    card.innerHTML = `
      <div class="card-media">
        <img src="${item.image_file}" alt="Defect Snapshot">
        <div class="bounding-box-sim">
          <span class="box-label">${item.defect_type} (${item.confidence})</span>
        </div>
        <span class="media-tag">KM ${item.km_mark}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h4>${item.defect_type}</h4>
          <span class="badge ${item.severity === 'CRITICAL' ? 'red' : (item.severity === 'WARNING' ? 'amber' : 'green')}">${item.severity}</span>
        </div>
        <ul class="telemetry-list">
          <li><strong>Train:</strong> ${item.train_no} - ${item.train_name}</li>
          <li><strong>Speed:</strong> ${item.speed_kmh} km/h</li>
          <li><strong>Track ID:</strong> ${item.track_id}</li>
          <li><strong>GPS Location:</strong> ${item.gps_coords}</li>
          <li><strong>Detected At:</strong> ${item.timestamp}</li>
        </ul>
      </div>
    `;
    container.appendChild(card);
  });

  // Filter Buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAnomalyCards(btn.getAttribute('data-filter'));
    };
  });
}

// Modal Inspection Dialog
function openModal(defectId) {
  const item = anomalyData.find(d => d.defect_id === defectId);
  if (!item) return;

  const modal = document.getElementById('inspection-modal');
  const body = document.getElementById('modal-body-content');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align:center; margin-bottom:14px;">
      <img src="${item.image_file}" style="max-width:100%; height:200px; object-fit:cover; border-radius:8px; border:1px solid var(--neon-cyan);">
    </div>
    <h4>${item.defect_type} <span class="badge ${item.severity === 'CRITICAL' ? 'red' : 'amber'}">${item.severity}</span></h4>
    <p style="font-size:13px; color:var(--text-muted); margin-top:8px;">
      <strong>Defect ID:</strong> ${item.defect_id}<br>
      <strong>Track Milestone:</strong> ${item.km_mark} KM (${item.track_id})<br>
      <strong>Train Telemetry:</strong> ${item.train_no} (${item.train_name}) @ ${item.speed_kmh} km/h<br>
      <strong>GPS Coordinates:</strong> ${item.gps_coords}<br>
      <strong>AI Model Confidence:</strong> ${item.confidence}<br>
      <strong>Detected Timestamp:</strong> ${item.timestamp}
    </p>
    <div style="margin-top:16px; display:flex; gap:10px;">
      <button class="btn btn-primary" onclick="copyTicketToClipboard()"><i class="fa-solid fa-copy"></i> Copy Emergency Work Order</button>
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
    </div>
  `;

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('inspection-modal');
  if (modal) modal.classList.remove('open');
}

// Interactive Track Node Inspector
function inspectNode(km, defect, detail, status) {
  const box = document.getElementById('node-inspection-box');
  if (!box) return;
  box.innerHTML = `
    <p>📍 <strong>Track Milestone:</strong> ${km} | <strong>Status:</strong> <span class="badge ${status === 'CRITICAL' ? 'red' : (status === 'WARNING' ? 'amber' : 'green')}">${status}</span></p>
    <p>🔍 <strong>Condition:</strong> ${defect} (${detail})</p>
    <p>⚙️ <strong>AI Recommendation:</strong> ${status === 'CRITICAL' ? 'Impose speed restriction PSR 20 km/h immediately!' : 'Normal operational speed permitted.'}</p>
  `;
}

// Interactive AI Derailment Risk Calculator
function calculateAIRisk() {
  const speed = parseFloat(document.getElementById('slider-speed')?.value || 88);
  const crack = parseFloat(document.getElementById('slider-crack')?.value || 4.2);

  const speedEl = document.getElementById('val-calc-speed');
  const crackEl = document.getElementById('val-calc-crack');
  if (speedEl) speedEl.textContent = speed;
  if (crackEl) crackEl.textContent = crack;

  // Derailment Risk Formula: (Speed * 0.42) + (CrackDepth * 9.8)
  let riskScore = (speed * 0.42) + (crack * 9.8);
  if (riskScore > 99) riskScore = 99.4;

  const scoreEl = document.getElementById('calc-risk-score');
  const actionEl = document.getElementById('calc-risk-action');

  if (scoreEl) {
    scoreEl.textContent = `${riskScore.toFixed(1)}% (${riskScore > 65 ? 'CRITICAL RISK' : (riskScore > 40 ? 'MODERATE RISK' : 'LOW RISK')})`;
    scoreEl.style.color = riskScore > 65 ? '#ff4b4b' : (riskScore > 40 ? '#ffb703' : '#06d6a0');
  }

  if (actionEl) {
    actionEl.textContent = riskScore > 65 ? "Immediate Speed Restriction (PSR 20 km/h) Required!" : "Monitor during scheduled maintenance window.";
  }
}

// Chart.js Setup
function initCharts() {
  const ctxLine = document.getElementById('speedDefectChart');
  if (ctxLine) {
    speedChartInstance = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['23:00', '23:10', '23:20', '23:30', '23:40', '23:50'],
        datasets: [
          {
            label: 'Train Speed (km/h)',
            data: [95, 92, 88, 85, 88, 90],
            borderColor: '#00f2fe',
            borderWidth: 2,
            tension: 0.3,
            fill: false
          },
          {
            label: 'Edge AI Vibrational Risk Spike',
            data: [10, 15, 85, 20, 12, 18],
            borderColor: '#ff4b4b',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#8a99ad' } } },
        scales: {
          x: { ticks: { color: '#8a99ad' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#8a99ad' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  const ctxPie = document.getElementById('defectPieChart');
  if (ctxPie) {
    pieChartInstance = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Rail Cracks', 'Missing Fasteners', 'Fishplate Loose', 'Ballast Void'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: ['#ff4b4b', '#ffb703', '#00f2fe', '#06d6a0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#8a99ad', font: { size: 11 } } } }
      }
    });
  }
}

// Live Simulation Event Trigger
function initSimulationButton() {
  const btn = document.getElementById('btn-trigger-sim');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const newDefect = {
      defect_id: `DEF-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      train_no: "12675",
      train_name: "Cheran Express",
      track_id: "TRK-SR-402B",
      km_mark: (142.8 + Math.random() * 0.5).toFixed(1),
      speed_kmh: 84,
      gps_coords: "13.0827° N, 80.2707° E",
      defect_type: "CRITICAL RAIL FRACTURE",
      severity: "CRITICAL",
      confidence: "98.9%",
      image_file: "https://images.unsplash.com/photo-1515165562839-9784018e00bf?auto=format&fit=crop&w=600&q=80",
      status: "NEW ALERT"
    };

    anomalyData.unshift(newDefect);

    renderOverviewTable();
    renderAnomalyCards('all');
    updateRawInspector();

    document.getElementById('val-defects').textContent = anomalyData.length;
    document.getElementById('val-risk').textContent = "CRITICAL (78%)";
    document.getElementById('val-risk').style.color = "#ff4b4b";

    triggerVoiceAlert(`Alert! Critical Rail Fracture detected on Track SR 402B at Kilometer ${newDefect.km_mark}. Imposing emergency speed restriction.`);
    
    alert(`⚡ NEW EDGE ANOMALY DETECTED!\nDefect: ${newDefect.defect_type}\nLocation: KM ${newDefect.km_mark}\nSent to Control Room Dashboard instantly!`);
  });
}

// Voice Alert Speech Synthesis
function triggerVoiceAlert(text) {
  const isChecked = document.getElementById('voice-alert-checkbox')?.checked;
  if (!isChecked || !('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// AI Copilot Chatbot Logic
function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function fillChatQuery(text) {
  const input = document.getElementById('chat-input-field');
  if (input) {
    input.value = text;
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById('chat-input-field');
  const container = document.getElementById('chat-messages-container');
  if (!input || !input.value.trim() || !container) return;

  const query = input.value.trim();

  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.innerHTML = `
    <div class="msg-avatar" style="background:#4facfe;"><i class="fa-solid fa-user"></i></div>
    <div class="msg-bubble">${query}</div>
  `;
  container.appendChild(userMsg);
  input.value = '';

  setTimeout(() => {
    let reply = "I have scanned the latest edge telemetry packets. All tracks on Section SR-200 are currently operating within nominal safety thresholds.";

    if (query.toLowerCase().includes('critical') || query.toLowerCase().includes('crack')) {
      reply = "<strong>AI Analysis:</strong> There is 1 Critical Rail Fracture logged at KM 142.8 on Track SR-402B. Recommended Action: Issue a Temporary Speed Restriction (TSR) of 20 km/h for Train 12675 immediately.";
    } else if (query.toLowerCase().includes('risk') || query.toLowerCase().includes('derailment')) {
      reply = "<strong>Derailment Risk Matrix:</strong> Calculated Risk Level is 78.4% (CRITICAL) due to train speed (88 km/h) and a 4.2mm transverse rail break at KM 142.8.";
    } else if (query.toLowerCase().includes('ticket') || query.toLowerCase().includes('repair')) {
      reply = "<strong>Work Order Generated:</strong> Emergency repair ticket #WO-2026-0805-442 created and staged for dispatch to the Salem Division engineering unit.";
    }

    const aiMsg = document.createElement('div');
    aiMsg.className = 'message assistant';
    aiMsg.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="msg-bubble">${reply}</div>
    `;
    container.appendChild(aiMsg);
    container.scrollTop = container.scrollHeight;
  }, 600);
}

function copyTicketToClipboard() {
  const text = `SOUTHERN RAILWAYS EMERGENCY WORK ORDER #WO-2026-0805-442\nLocation: Track SR-402B | KM 142.8\nDefect: Transverse Rail Crack\nAction: 20 km/h PSR & Emergency Weld Team Dispatch`;
  navigator.clipboard.writeText(text).then(() => {
    alert("Work Order text copied to clipboard!");
  });
}

function updateRawInspector() {
  const el = document.getElementById('raw-json-inspector');
  if (el) {
    el.textContent = JSON.stringify(anomalyData, null, 2);
  }
}

function exportOverviewReport() {
  alert("Generating SIH Executive Summary Report (PDF)...\nReport contains: System uptime, total defects logged, risk breakdown, and active maintenance dispatches.");
}