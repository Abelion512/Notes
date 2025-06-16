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

// --- Theme & Branding ---
const THEMES = ["cream","blue","pink","dark"];
function setTheme(theme) {
  if(!THEMES.includes(theme)) theme = "cream";
  document.body.classList.remove(...THEMES.map(t=>"theme-"+t));
  document.body.classList.add("theme-"+theme);
  localStorage.setItem("abelion-theme", theme);
  document.querySelectorAll('.theme-btn').forEach(btn=>{
    btn.classList.toggle('selected', btn.dataset.theme === theme);
  });
}
function initTheme() {
  let theme = localStorage.getItem("abelion-theme") || "cream";
  setTheme(theme);
  document.querySelectorAll('.theme-btn').forEach(btn=>{
    btn.onclick = ()=>setTheme(btn.dataset.theme);
  });
}

// --- Quotes random ---
const QUOTES = [
  "Menulis adalah cara otak bernapas.",
  "Catatan kecil, langkah besar.",
  "Progres hari ini lebih baik dari kemarin.",
  "Jangan takut gagal, takutlah kalau tidak mencoba.",
  "Tuliskan idemu, jangan biarkan hilang.",
  "Sukses berawal dari satu catatan.",
  "Gagal sekali, sukses seribu kali.",
  "Tidak ada ide yang sia-sia.",
  "Catat. Pahami. Eksekusi.",
  "Belajar bukan untuk siapa-siapa, tapi untuk diri sendiri."
];
function showRandomQuote() {
  const q = QUOTES[Math.floor(Math.random()*QUOTES.length)];
  document.getElementById('random-quote').textContent = q;
}

// --- Notes: localStorage
const LS_KEY = 'abelion-notes-v2';
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch { return []; }
}
function saveNotes() {
  localStorage.setItem(LS_KEY, JSON.stringify(notes));
}
let notes = loadNotes();

// Mood harian dummy
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

// --- Search Functionality ---
let searchQuery = '';
function renderSearchBar() {
  let searchDiv = document.getElementById('search-bar');
  if(!searchDiv) {
    searchDiv = document.createElement('div');
    searchDiv.id = 'search-bar';
    searchDiv.innerHTML = `
      <input id="search-input" class="search-input" type="text" placeholder="Cari catatan..." autocomplete="off"/>
    `;
    const notesGrid = document.getElementById('notes-grid');
    notesGrid.parentNode.insertBefore(searchDiv, notesGrid);
    document.getElementById('search-input').addEventListener('input', function(){
      searchQuery = this.value.trim().toLowerCase();
      renderNotes();
    });
  }
}

// --- Notes Card (klik ke note.html?id=..., pin/delete/copy interaktif, search) ---
function renderNotes() {
  let grid = document.getElementById("notes-grid");
  if (!notes.length) {
    grid.innerHTML = `<div style="color:#aaa;text-align:center;margin:38px auto 0 auto;font-size:1.1em;">Belum ada catatan.<br>Yuk tambah catatan baru!</div>`;
    return;
  }
  let filtered = notes.filter(n => {
    if(!searchQuery) return true;
    let contentText = n.content.replace(/<[^>]+>/g, '').toLowerCase();
    return n.title.toLowerCase().includes(searchQuery) || contentText.includes(searchQuery);
  });
  let sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });
  if (!sorted.length) {
    grid.innerHTML = `<div style="color:#aaa;text-align:center;margin:38px auto 0 auto;font-size:1.1em;">Catatan tidak ditemukan.</div>`;
    return;
  }
  grid.innerHTML = sorted.map(n=>`
    <div class="note-card" data-id="${n.id}" tabindex="0" role="link">
      <div class="note-actions">
        <button class="action-btn pin${n.pinned?' pin-active':''}" data-action="pin" title="Pin/Unpin" aria-label="Pin/Unpin catatan">
          <span class="pin-inner">${n.pinned?'📌':'📍'}</span>
        </button>
        <button class="action-btn copy-btn" data-action="copy" title="Copy" aria-label="Copy catatan">
          <span>📋</span>
        </button>
        <button class="action-btn delete" data-action="delete" title="Hapus" aria-label="Hapus catatan">
          <span class="delete-inner">🗑️</span>
        </button>
      </div>
      <div class="note-title">
        ${n.icon?`<span class="icon">${n.icon}</span>`:""}${n.title}
      </div>
      <div class="note-content">${n.content}</div>
      <div class="note-date">Ditulis: ${formatTanggal(n.date)}</div>
    </div>
  `).join("");

  // Interaktif event
  grid.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if(e.target.closest('.action-btn')) return;
      window.location.href = `note.html?id=${card.getAttribute('data-id')}`;
    });
    card.onkeydown = function(e) {
      if(e.key==='Enter' || e.key===' ') {
        window.location.href = `note.html?id=${card.getAttribute('data-id')}`;
      }
    };
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
          saveNotes();
          this.querySelector('.pin-inner').animate([
            {transform:'scale(1.2)'},{transform:'scale(1)'}
          ],{duration:200});
          renderNotes();
        } else if(this.dataset.action==="copy") {
          // Copy: judul + isi plain text
          const temp = document.createElement('textarea');
          temp.value = (note.icon?note.icon+" ":"") + note.title + "\n\n" + note.content.replace(/<[^>]+>/g, '');
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          temp.remove();
          btn.blur();
          btn.innerHTML = "✅";
          setTimeout(()=>{ btn.innerHTML = "📋"; }, 1000);
        } else if(this.dataset.action==="delete") {
          if(confirm('Hapus catatan ini?')) {
            notes.splice(idx,1);
            saveNotes();
            renderNotes();
          }
        }
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
// --- Tambah catatan baru ---
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
  saveNotes();
  renderNotes();
};
// --- Entrance: skip animasi jika dari note.html (back) ---
window.addEventListener('DOMContentLoaded', ()=>{
  renderMoodGraph(); renderSearchBar(); renderNotes();
  showRandomQuote();
  initTheme();
  // Staggered fade-in
  setTimeout(()=>document.body.classList.add('loaded'), 300);
  if(sessionStorage.getItem('skipIntro')) {
    document.getElementById('intro-anim').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    document.querySelector('.title-abelion').classList.add('animated');
    sessionStorage.removeItem('skipIntro');
    return;
  }
  // --- Animasi Intro 0-100% slow, fade out ---
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
