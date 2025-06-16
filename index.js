// --- Live time pojok kanan atas ---
function updateTime() {
  const el = document.getElementById('top-time');
  if (!el) return;
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
setInterval(updateTime, 1000);
updateTime();

// --- Animasi Intro 0-100% slow, fade out ---
window.addEventListener('DOMContentLoaded', ()=>{
  let p = 0;
  const pt = document.getElementById('progress-text');
  const intro = document.getElementById('intro-anim');
  const main = document.getElementById('main-content');
  let interval = setInterval(()=>{
    p = Math.min(100, p+Math.floor(Math.random()*7+1));
    pt.textContent = p+"%";
    if(p>=100){
      clearInterval(interval);
      intro.style.opacity = 0;
      setTimeout(()=>{
        intro.style.display="none";
        main.classList.remove('hidden');
        setTimeout(()=>document.querySelector('.title-abelion').classList.add('animated'),100);
      },1300);
    }
  }, 40);
});

// --- Data dummy (replace with localStorage for persistent) ---
let notes = [
  {
    id: "1",
    icon: "⭐", title: "Rencana Bulan Juni",
    content: "<ul><li>Fokus UTBK</li><li>Kerjakan <i>proyek FocusTimerin</i></li><li>Belajar AI &amp; UI/UX</li></ul>",
    date: "2025-06-15",
    pinned: true
  },
  {
    id: "2",
    icon: "", title: "Matematika",
    content: "<ul><li>Diskusi di sesi tutor</li></ul>",
    date: "2025-06-12",
    pinned: false
  },
  {
    id: "3",
    icon: "", title: "oke",
    content: "oke",
    date: "2025-06-16",
    pinned: false
  }
];

// --- Mood harian dummy ---
const moods = [
  {day:"Sen",emoji:"😄"}, {day:"Sel",emoji:"😄"},
  {day:"Rab",emoji:"😐"}, {day:"Kam",emoji:"😄"},
  {day:"Jum",emoji:"😢"}, {day:"Sab",emoji:"😐"},
  {day:"Min",emoji:"😄"}
];

// --- Mood Graph harian (centered) ---
function renderMoodGraph() {
  let el = document.getElementById("mood-graph");
  el.innerHTML = moods.map(m=>`
    <div class="mood-bar">
      <div class="mood-emoji">${m.emoji}</div>
      <div class="mood-date">${m.day}</div>
    </div>
  `).join("");
}

// --- Format tanggal Indonesia ---
function formatTanggal(tglStr) {
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const d = new Date(tglStr);
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

// --- Notes Card (klik = ke note.html?id=..., ada pin/delete) ---
function renderNotes() {
  let grid = document.getElementById("notes-grid");
  // Sort pinned di atas, lalu urut tanggal desc
  let sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });
  grid.innerHTML = sorted.map(n=>`
    <div class="note-card" data-id="${n.id}" tabindex="0" role="link">
      <div class="note-actions">
        <button class="action-btn pin${n.pinned?' pin-active':''}" data-action="pin" title="Pin/Unpin">${n.pinned?'📌':'📍'}</button>
        <button class="action-btn delete" data-action="delete" title="Hapus">🗑️</button>
      </div>
      <div class="note-title">
        ${n.icon?`<span class="icon">${n.icon}</span>`:""}${n.title}
      </div>
      <div class="note-content">${n.content}</div>
      <div class="note-date">Ditulis: ${formatTanggal(n.date)}</div>
    </div>
  `).join("");

  // Attach events
  grid.querySelectorAll('.note-card').forEach(card => {
    // Card click: redirect to note.html?id=...
    card.addEventListener('click', function(e) {
      // If action button is clicked, don't trigger card click
      if(e.target.classList.contains('action-btn')) return;
      window.location.href = `note.html?id=${card.getAttribute('data-id')}`;
    });
    // Accessibility: Enter/Space
    card.onkeydown = function(e) {
      if(e.key==='Enter' || e.key===' ') {
        window.location.href = `note.html?id=${card.getAttribute('data-id')}`;
      }
    };
    // Pin/Delete events
    card.querySelectorAll('.action-btn').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const id = card.getAttribute('data-id');
        const idx = notes.findIndex(n=>n.id===id);
        if(idx<0) return;
        const note = notes[idx];
        if(this.dataset.action==="pin") {
          note.pinned = !note.pinned;
        } else if(this.dataset.action==="delete") {
          if(confirm('Hapus catatan ini?')) {
            notes.splice(idx,1);
          }
        }
        renderNotes();
      }
    });
  });
}

// --- About Modal (nav About Me) ---
const aboutModal = document.getElementById("about-modal");
document.getElementById("nav-about").onclick = function(e) {
  e.preventDefault();
  aboutModal.classList.add("show");
};
document.getElementById("about-close").onclick = function() {
  aboutModal.classList.remove("show");
};
document.getElementById("nav-home").onclick = function(e) {
  e.preventDefault();
  aboutModal.classList.remove("show");
};
window.onclick = function(e) {
  if(e.target === aboutModal) aboutModal.classList.remove("show");
};

// --- Tambah catatan baru (dummy) ---
document.getElementById('add-note-btn').onclick = function() {
  let title = prompt("Judul catatan:");
  if(!title) return;
  let content = prompt("Isi catatan (boleh pakai - untuk membuat list):");
  if(!content) return;
  let icon = prompt("Emoji/icon catatan (boleh kosong):") || "";
  let lines = content.split('\n');
  let htmlList = lines.length > 1 ? '<ul>' + lines.map(x=>`<li>${x}</li>`).join('') + '</ul>' : content;
  let now = new Date();
  let tgl = now.toISOString().slice(0,10);
  notes.unshift({
    id: String(Date.now()),
    icon,
    title,
    content: htmlList,
    date: tgl,
    pinned: false
  });
  renderNotes();
};

// --- Inisialisasi semua ---
window.addEventListener('DOMContentLoaded', ()=>{
  renderMoodGraph();
  renderNotes();
});
