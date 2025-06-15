// ==== Utilities ====
function getNotes() {
  return JSON.parse(localStorage.getItem("notes-list") || "[]");
}
function saveNotes(notes) {
  localStorage.setItem("notes-list", JSON.stringify(notes));
}
function formatDateISO(dt) {
  const d = new Date(dt);
  return d.toLocaleString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
}
function weekKey(date) {
  const d = new Date(date);
  const firstDayOfWeek = new Date(d);
  firstDayOfWeek.setDate(d.getDate() - d.getDay());
  return firstDayOfWeek.toISOString().split('T')[0];
}

// ==== Abelion Notes Animation ====
window.addEventListener('DOMContentLoaded', ()=>{
  let spans = document.querySelectorAll('#abelion-text span');
  spans.forEach((sp,i)=>{
    setTimeout(()=>sp.classList.add('ani'), i*70+180);
  });
  setTimeout(()=>{
    spans.forEach((sp,i)=>sp.classList.add('ani'));
  }, 1900);
});

// ==== Snackbar ====
function showSnackbar(msg="Tersimpan!") {
  const sb = document.getElementById("snackbar");
  sb.textContent = msg;
  sb.className = "show";
  setTimeout(()=>sb.className="",1800);
}

// ==== Mood Tracker Mini ====
function renderMoodMini() {
  const notes = getNotes();
  // Ambil mood 7 hari terakhir
  const moodData = {};
  notes.forEach(n=>{
    const wk = weekKey(n.createdAt);
    if (!moodData[wk]) moodData[wk]={smile:0,flat:0,sad:0};
    if (n.mood==="smile") moodData[wk].smile++;
    else if (n.mood==="flat") moodData[wk].flat++;
    else if (n.mood==="sad") moodData[wk].sad++;
  });
  const weeks = Object.keys(moodData).sort().slice(-2); // 2 minggu terakhir
  let html = `<div style="font-weight:600;font-size:1.01em;margin-bottom:2px;">Mood Mingguan</div>`;
  weeks.forEach(wk=>{
    const d = new Date(wk);
    html += `<div style="opacity:.85;font-size:.98em;">${d.toLocaleDateString("id-ID",{day:"2-digit",month:"short"})}:</div>
      <div class="mood-graph">
        <div class="mood-bar smile" title="Senang">${"😄".repeat(moodData[wk].smile)}${moodData[wk].smile>0?`<div class="mood-count">${moodData[wk].smile}</div>`:""}</div>
        <div class="mood-bar flat" title="Biasa">${"😐".repeat(moodData[wk].flat)}${moodData[wk].flat>0?`<div class="mood-count">${moodData[wk].flat}</div>`:""}</div>
        <div class="mood-bar sad" title="Sedih">${"😢".repeat(moodData[wk].sad)}${moodData[wk].sad>0?`<div class="mood-count">${moodData[wk].sad}</div>`:""}</div>
      </div>`;
  });
  if(!weeks.length) html += `<div class="mood-graph"><span style="font-size:1.09em;opacity:.7;">Belum ada data mood minggu ini.</span></div>`;
  document.getElementById("mood-mini").innerHTML = html;
}

// ==== Grafik Mood Harian ====
function renderMoodDaily() {
  const notes = getNotes();
  // 7 hari terakhir
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate()-i);
    days.push(d);
  }
  let html = `<div style="font-weight:600;font-size:1.01em;margin-bottom:2px;">Mood Harian</div><div class="mood-days">`;
  days.forEach(day=>{
    const key = day.toISOString().slice(0,10);
    const n = notes.filter(nt=>nt.createdAt && new Date(nt.createdAt).toISOString().slice(0,10)===key);
    let m = "none";
    if(n.length){
      // mayoritas mood
      const count = {smile:0,flat:0,sad:0};
      n.forEach(x=>{if(count[x.mood]!=null)count[x.mood]++;});
      m = Object.entries(count).sort((a,b)=>b[1]-a[1])[0][0];
    }
    html += `<div class="mood-day-bar ${m}" title="${n.length?n.length+' catatan':''}">
      ${m==="smile"?"😄":m==="flat"?"😐":m==="sad"?"😢":"–"}
      <div class="mood-day-label">${day.toLocaleDateString("id-ID",{weekday:"short"})}</div>
    </div>`;
  });
  html += "</div>";
  document.getElementById("mood-graph-daily").innerHTML = html;
}

// ==== Render Notes ====
function renderNotes(filter="") {
  const grid = document.getElementById("chapter-grid");
  let notes = getNotes();

  // Search filter
  if (filter) {
    const f = filter.toLowerCase();
    notes = notes.filter(note =>
      note.title.toLowerCase().includes(f) ||
      note.content.toLowerCase().includes(f)
    );
  }

  // Sort: pinned > fav > important > waktu
  notes = notes.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.fav && !b.fav) return -1;
    if (!a.fav && b.fav) return 1;
    if ((a.label||"") === "important" && (b.label||"") !== "important") return -1;
    if ((a.label||"") !== "important" && (b.label||"") === "important") return 1;
    return b.createdAt - a.createdAt;
  });

  grid.innerHTML = notes.map((note, i) => `
    <div class="chapter-card${note.pinned ? ' pinned' : ''}" data-id="${note.id}" style="animation-delay:${i*0.045}s">
      <span class="note-icon" title="Icon Catatan" contenteditable="false" spellcheck="false" data-id="${note.id}">${note.icon||'📝'}</span>
      <div class="note-main" onclick="window.location='note.html?id=${note.id}'">
        <div class="chapter-title">${note.title}</div>
        <div class="note-meta">
          <span class="note-date" title="Dibuat">${formatDateISO(note.createdAt)}</span>
          <span class="note-date" title="Terakhir diedit">Edit: ${formatDateISO(note.lastEdit||note.createdAt)}</span>
          <span class="note-mood" title="Mood">${note.mood==="smile"?"😄":note.mood==="flat"?"😐":note.mood==="sad"?"😢":"❔"}</span>
          ${(note.label?`<span class="note-label label-${note.label}">${note.label==="important"?"Penting":note.label==="medium"?"Medium":"Santai"}</span>`:"")}
        </div>
      </div>
      <div class="card-actions">
        <button class="action-btn pin-btn" title="Pin/Unpin">${note.pinned ? "📌" : "📍"}</button>
        <button class="action-btn fav-btn${note.fav ? ' fav' : ''}" title="Favorit">★</button>
        <button class="action-btn edit-ico-btn" title="Edit Icon">✏️</button>
        <button class="action-btn delete-btn" title="Hapus">🗑️</button>
      </div>
    </div>
  `).join("");
  
  // Pin/Fav/Delete/EditIcon listeners
  document.querySelectorAll('.chapter-card').forEach(card => {
    const noteId = card.getAttribute('data-id');
    // Pin
    card.querySelector('.pin-btn').onclick = function(e) {
      e.stopPropagation(); e.preventDefault();
      let notes = getNotes();
      let idx = notes.findIndex(n => n.id === noteId);
      if (idx >= 0) {
        notes[idx].pinned = !notes[idx].pinned;
        saveNotes(notes);
        renderNotes(document.getElementById("search-notes").value);
      }
    };
    // Fav
    card.querySelector('.fav-btn').onclick = function(e) {
      e.stopPropagation(); e.preventDefault();
      let notes = getNotes();
      let idx = notes.findIndex(n => n.id === noteId);
      if (idx >= 0) {
        notes[idx].fav = !notes[idx].fav;
        saveNotes(notes);
        renderNotes(document.getElementById("search-notes").value);
      }
    };
    // Delete
    card.querySelector('.delete-btn').onclick = function(e) {
      e.stopPropagation(); e.preventDefault();
      if (confirm("Hapus catatan ini?")) {
        let notes = getNotes().filter(n => n.id !== noteId);
        saveNotes(notes);
        renderNotes(document.getElementById("search-notes").value);
        renderMoodMini();
        renderMoodDaily();
      }
    };
    // Edit Icon
    card.querySelector('.edit-ico-btn').onclick = function(e) {
      e.stopPropagation(); e.preventDefault();
      let icon = prompt('Pilih emoji/icon untuk catatan ini:', card.querySelector('.note-icon').textContent);
      if (icon && icon.length <= 3) {
        let notes = getNotes();
        let idx = notes.findIndex(n => n.id === noteId);
        if (idx >= 0) {
          notes[idx].icon = icon;
          notes[idx].lastEdit = Date.now();
          saveNotes(notes);
          renderNotes(document.getElementById("search-notes").value);
        }
      }
    };
  });
}

// ==== Add/Edit Note Modal ====
function showAddNoteDialog(editNote) {
  // Buat mini modal dialog
  const div = document.createElement("div");
  div.style = `
    position:fixed;z-index:200;
    left:0;top:0;width:100vw;height:100vh;
    background:rgba(60,40,130,0.08);
    display:flex;align-items:center;justify-content:center;`;
  div.innerHTML = `
    <form id="note-form" style="background:#fff;padding:26px 20px 21px 20px;max-width:390px;width:97vw;border-radius:17px;box-shadow:0 6px 50px #667eea31;display:flex;flex-direction:column;gap:10px;animation:fadeInMorph .29s;">
      <div style="display:flex;align-items:center;gap:12px;">
        <input id="note-icon" value="${editNote?editNote.icon||'📝':'📝'}" maxlength="3" style="font-size:1.52em;width:2.2em;text-align:center;border-radius:8px;"/>
        <input id="note-title" type="text" required placeholder="Judul catatan" maxlength="60" value="${editNote?editNote.title:''}" style="font-size:1.09em;flex:1;padding:7px 10px;border-radius:8px;border:1px solid #ddd;" />
      </div>
      <textarea id="note-content" required placeholder="Isi catatan..." style="width:100%;min-height:80px;resize:vertical;font-size:1.05em;padding:7px 10px;border-radius:8px;border:1px solid #ddd;">${editNote?editNote.content:""}</textarea>
      <div class="edit-label">
        <label for="note-label">Label:</label>
        <select id="note-label">
          <option value="important"${editNote&&editNote.label==="important"?' selected':''}>Penting</option>
          <option value="medium"${editNote&&editNote.label==="medium"?' selected':''}>Medium</option>
          <option value="low"${editNote&&editNote.label==="low"?' selected':''}>Santai</option>
        </select>
      </div>
      <div class="edit-mood">
        <label for="note-mood">Mood:</label>
        <select id="note-mood">
          <option value="smile"${editNote&&editNote.mood==="smile"?' selected':''}>😄 Senang</option>
          <option value="flat"${editNote&&editNote.mood==="flat"?' selected':''}>😐 Biasa</option>
          <option value="sad"${editNote&&editNote.mood==="sad"?' selected':''}>😢 Sedih</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
        <button type="button" id="cancel-btn" class="cancel-btn">Batal</button>
        <button type="submit" class="save-btn">Simpan</button>
      </div>
    </form>
  `;
  document.body.appendChild(div);
  setTimeout(()=>div.style.background="rgba(60,40,130,0.19)",10);
  // Enter: multi-line di textarea, submit di tombol
  const form = div.querySelector("#note-form");
  const titleInput = form.querySelector("#note-title");
  const contentInput = form.querySelector("#note-content");
  titleInput.focus();
  // Save or update
  form.onsubmit = function(e) {
    e.preventDefault();
    let notes = getNotes();
    let now = Date.now();
    if(editNote) {
      let idx = notes.findIndex(n => n.id === editNote.id);
      if(idx>=0) {
        notes[idx].title = titleInput.value.trim();
        notes[idx].content = contentInput.value;
        notes[idx].icon = form.querySelector("#note-icon").value || "📝";
        notes[idx].label = form.querySelector("#note-label").value;
        notes[idx].mood = form.querySelector("#note-mood").value;
        notes[idx].lastEdit = now;
      }
    } else {
      notes.push({
        id: now.toString(),
        title: titleInput.value.trim(),
        content: contentInput.value,
        icon: form.querySelector("#note-icon").value || "📝",
        label: form.querySelector("#note-label").value,
        mood: form.querySelector("#note-mood").value,
        createdAt: now,
        lastEdit: now,
        pinned: false,
        fav: false
      });
    }
    saveNotes(notes);
    renderNotes(document.getElementById("search-notes").value);
    renderMoodMini();
    renderMoodDaily();
    showSnackbar("Tersimpan!");
    document.body.removeChild(div);
  };
  form.querySelector("#cancel-btn").onclick = function() {
    document.body.removeChild(div);
  };
}

// ==== Edit Note Shortcut (dari card) ====
window.editNoteFromCard = function(noteid) {
  const notes = getNotes();
  const note = notes.find(n=>n.id===noteid);
  if(note) showAddNoteDialog(note);
}

// ==== Search Bar ====
document.getElementById("search-notes").addEventListener("input", function(){
  renderNotes(this.value);
});

// ==== Add Note Button ====
document.getElementById("add-note-btn").onclick = ()=>showAddNoteDialog();

// ==== Card Double Click Edit ====
document.getElementById("chapter-grid").addEventListener("dblclick", function(e){
  let card = e.target.closest(".chapter-card");
  if(card) {
    const noteId = card.getAttribute('data-id');
    const notes = getNotes();
    const note = notes.find(n=>n.id===noteId);
    if(note) showAddNoteDialog(note);
  }
});

// ==== Initial Render ====
renderNotes();
renderMoodMini();
renderMoodDaily();
