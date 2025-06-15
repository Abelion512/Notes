// --- Animasi Intro 0-100% lalu fade out ---
window.addEventListener('DOMContentLoaded', ()=>{
  let p = 0;
  const pt = document.getElementById('progress-text');
  const intro = document.getElementById('intro-anim');
  const main = document.getElementById('main-content');
  let interval = setInterval(()=>{
    p = Math.min(100,p+Math.floor(Math.random()*11+2));
    pt.textContent = p+"%";
    if(p>=100){
      clearInterval(interval);
      intro.style.opacity = 0;
      setTimeout(()=>{
        intro.style.display="none";
        main.classList.remove('hidden');
        setTimeout(()=>document.querySelector('.title-abelion').classList.add('animated'),50);
      },700);
    }
  }, 32);
});

// --- Data dummy (bisa diganti localStorage, dsb) ---
const notes = [
  {
    icon: "⭐", title: "Rencana Bulan Juni",
    content: "<ul><li>Fokus UTBK</li><li>Kerjakan <i>proyek FocusTimerin</i></li><li>Belajar AI &amp; UI/UX</li></ul>",
    date: "20 Mei 2024"
  },
  {
    icon: "", title: "Matematika",
    content: "<ul><li>Diskusi di sesi tutor</li></ul>",
    date: "18 Mei 2024"
  },
  {
    icon: "⚡", title: "Ide Aplikasi",
    content: "<ul><li>Task manager untuk mahasiswa</li></ul>",
    date: "14 Mei 2024"
  },
  {
    icon: "", title: "To-Do Harian",
    content: "<ul><li>Olahraga pagi</li><li>Review materi</li></ul>",
    date: "12 Mei 2024"
  },
];

// --- Mood harian dummy ---
const moods = [
  {day:"Sen",emoji:"😄"}, {day:"Sel",emoji:"😄"},
  {day:"Rab",emoji:"😐"}, {day:"Kam",emoji:"😄"},
  {day:"Jum",emoji:"😢"}, {day:"Sab",emoji:"😐"},
  {day:"Min",emoji:"😄"}
];

// --- Mood Graph harian ---
function renderMoodGraph() {
  let el = document.getElementById("mood-graph");
  el.innerHTML = moods.map(m=>`
    <div class="mood-bar">
      <div class="mood-emoji">${m.emoji}</div>
      <div class="mood-date">${m.day}</div>
    </div>
  `).join("");
}

// --- Notes Card ---
function renderNotes() {
  let grid = document.getElementById("notes-grid");
  grid.innerHTML = notes.map(n=>`
    <div class="note-card">
      <div class="note-title">${n.icon?`<span class="icon">${n.icon}</span>`:""}${n.title}</div>
      <div class="note-content">${n.content}</div>
      <div class="note-date">Ditulis: ${n.date}</div>
    </div>
  `).join("");
}

// --- Inisialisasi semua ---
window.addEventListener('DOMContentLoaded', ()=>{
  renderMoodGraph();
  renderNotes();
});
