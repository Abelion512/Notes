function getNotes() {
  return JSON.parse(localStorage.getItem("notes-list") || "[]");
}
function saveNotes(notes) {
  localStorage.setItem("notes-list", JSON.stringify(notes));
}

function renderNotes() {
  const grid = document.getElementById("chapter-grid");
  let notes = getNotes();

  // Sort: pinned (true) di atas, urut fav (true) di atas, baru urut waktu desc
  notes = notes
    .sort((a, b) => {
      // Pin
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Fav
      if (a.fav && !b.fav) return -1;
      if (!a.fav && b.fav) return 1;
      // Time (desc)
      return b.createdAt - a.createdAt;
    });

  grid.innerHTML = notes.map((note, i) => `
    <div class="chapter-card${note.pinned ? ' pinned' : ''}" data-id="${note.id}">
      <div class="card-actions">
        <button class="action-btn pin-btn" title="Pin/Unpin">${note.pinned ? "📌" : "📍"}</button>
        <button class="action-btn fav-btn${note.fav ? ' fav' : ''}" title="Favorite (Bintang)">★</button>
        <button class="action-btn delete-btn" title="Hapus">🗑️</button>
      </div>
      <a href="note.html?id=${note.id}" class="chapter-link" style="text-decoration:none;color:inherit;">
        <div class="chapter-number">${i + 1}</div>
        <h2 class="chapter-title">${note.title}</h2>
      </a>
    </div>
  `).join("");
  
  // Event listeners untuk pin, fav, delete
  document.querySelectorAll('.chapter-card').forEach(card => {
    const noteId = card.getAttribute('data-id');
    // Pin
    card.querySelector('.pin-btn').onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      let notes = getNotes();
      let idx = notes.findIndex(n => n.id === noteId);
      if (idx >= 0) {
        notes[idx].pinned = !notes[idx].pinned;
        saveNotes(notes);
        renderNotes();
      }
    };
    // Fav
    card.querySelector('.fav-btn').onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      let notes = getNotes();
      let idx = notes.findIndex(n => n.id === noteId);
      if (idx >= 0) {
        notes[idx].fav = !notes[idx].fav;
        saveNotes(notes);
        renderNotes();
      }
    };
    // Delete
    card.querySelector('.delete-btn').onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      if (confirm("Hapus catatan ini?")) {
        let notes = getNotes().filter(n => n.id !== noteId);
        saveNotes(notes);
        renderNotes();
      }
    };
  });
}

document.getElementById("add-note-btn").onclick = function() {
  const title = prompt("Judul catatan:");
  if (!title) return;
  const content = prompt("Isi catatan:");
  let notes = getNotes();
  const id = Date.now().toString();
  notes.push({
    id,
    title,
    content,
    createdAt: Date.now(),
    pinned: false,
    fav: false
  });
  saveNotes(notes);
  renderNotes();
};

renderNotes();