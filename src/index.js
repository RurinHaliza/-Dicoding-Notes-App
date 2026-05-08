import './styles.css';
import Swal from 'sweetalert2';
import anime from 'animejs';


class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `.loading`;
     }

  show() {
    this.style.display = 'block';
  }

  hide() {
    this.style.display = 'none';
  }
}
customElements.define('loading-indicator', LoadingIndicator);

class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
        <div class="header-container">
          <div class="logo">
            <span class="logo-icon">📝</span>
            <h1>Notes App</h1>
          </div>
          <div class="stats" data-note-count="0"></div>
        </div>
      `;
  }

  updateStats(activeCount, archivedCount) {
    const statsElement = this.querySelector('.stats');
    statsElement.innerHTML = `
        <span>Active: ${activeCount} | Archived: ${archivedCount}</span>
      `;
  }
}

customElements.define('app-header', AppHeader);

class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
        <p>&copy; ${new Date().getFullYear()} Notes App By Rurin Nurhaliza.</p>
      `;
  }
}

customElements.define('app-footer', AppFooter);

class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div class="note-form-container">
      <h2>Add New Note</h2>
      <form id="noteForm">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" name="title" placeholder="Note title" required maxlength="100">
          <div class="error-message" id="title-error">Title is required</div>
          <div class="char-counter"><span id="title-counter">0</span>/100</div>
        </div>

        <div class="form-group">
          <label for="body">Content</label>
          <textarea id="body" name="body" placeholder="Note content" required maxlength="1000"></textarea>
          <div class="error-message" id="body-error">Content is required</div>
          <div class="char-counter"><span id="body-counter">0</span>/1000</div>
        </div>

        <button type="submit" id="submitBtn" disabled>Add Note</button>
      </form>
    </div>
  `;
  }

  connectedCallback() {
  this.form = this.querySelector('#noteForm');
  this.titleInput = this.querySelector('#title');
  this.bodyInput = this.querySelector('#body');
  this.submitBtn = this.querySelector('#submitBtn');
  this.titleError = this.querySelector('#title-error');
  this.bodyError = this.querySelector('#body-error');
  this.titleCounter = this.querySelector('#title-counter');
  this.bodyCounter = this.querySelector('#body-counter');

  console.log(this.titleInput); // cek

  if (!this.titleInput || !this.bodyInput) return;

  this.titleInput.addEventListener('input', () => {
    this.updateTitleCounter();
    this.validateForm();
  });

  this.bodyInput.addEventListener('input', () => {
    this.updateBodyCounter();
    this.validateForm();
  });

  this.form.addEventListener('submit', (e) => this.handleSubmit(e));
}

  validateTitle() {
    const value = this.titleInput.value.trim();
    this.titleCounter.textContent = value.length;
    this.updateCounterStyle(this.titleCounter.parentElement, value.length, 100);

    if (value.length === 0) {
      this.titleError.style.display = 'block';
      return false;
    } else {
      this.titleError.style.display = 'none';
      return true;
    }
  }

  updateTitleCounter() {
    const value = this.titleInput.value;
    this.titleCounter.textContent = value.length;
    this.updateCounterStyle(this.titleCounter.parentElement, value.length, 100);
  }

  updateBodyCounter() {
    const value = this.bodyInput.value;
    this.bodyCounter.textContent = value.length;
    this.updateCounterStyle(this.bodyCounter.parentElement, value.length, 1000);
  }

  updateCounterStyle(element, current, max) {
    const percentage = (current / max) * 100;
    element.classList.remove('warning', 'error');

    if (percentage > 80 && percentage < 90) {
      element.classList.add('warning');
    } else if (percentage >= 90) {
      element.classList.add('error');
    }
  }

  validateForm() {
    const isTitleValid = this.titleInput.value.trim().length > 0;
    const isBodyValid = this.bodyInput.value.trim().length > 0;

    this.titleError.style.display = isTitleValid ? 'none' : 'block';
    this.bodyError.style.display = isBodyValid ? 'none' : 'block';

    this.submitBtn.disabled = !(isTitleValid && isBodyValid);
    return isTitleValid && isBodyValid;
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.validateForm()) {
      const newNote = {
        title: this.titleInput.value.trim(),
        body: this.bodyInput.value.trim()
      };

      this.dispatchEvent(new CustomEvent('add-note', {
        detail: newNote,
        bubbles: true,
        composed: true
      }));

      this.form.reset();
      this.titleCounter.textContent = '0';
      this.bodyCounter.textContent = '0';
      this.submitBtn.disabled = true;
      this.titleError.style.display = 'none';
      this.bodyError.style.display = 'none';
    }
  }
}

customElements.define('note-form', NoteForm);

class NoteCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const id = this.getAttribute('data-id') || '';
    const title = this.getAttribute('data-title') || '';
    const body = this.getAttribute('data-body') || '';
    const createdAt = this.getAttribute('data-created-at') || '';
    const archived = this.getAttribute('data-archived') === 'true';

    const date = new Date(createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    this.innerHTML = `
      <div class="note-card">
        <h3>${title}</h3>
        <p>${body}</p>
        <div class="note-date">Created: ${formattedDate}</div>
        <div class="note-actions">
          ${archived
            ? `<button class="unarchive-btn" data-id="${id}">Unarchive</button>`
            : `<button class="archive-btn" data-id="${id}">Archive</button>`}
          <button class="delete-btn" data-id="${id}">Delete</button>
        </div>
      </div>
    `;

    const cards = this.querySelectorAll('.note-card');

      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.95, 1],
        duration: 2000,
        easing: 'easeOutExpo'
      });    

    const archiveBtn = this.querySelector('.archive-btn');
    const unarchiveBtn = this.querySelector('.unarchive-btn');
    const deleteBtn = this.querySelector('.delete-btn');

    if (archiveBtn) {
      archiveBtn.addEventListener('click', () => this.handleArchive(id));
    }
    if (unarchiveBtn) {
      unarchiveBtn.addEventListener('click', () => this.handleUnarchive(id));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDelete(id));
    }
  }

  handleArchive(id) {
    this.dispatchEvent(new CustomEvent('archive-note', {
      detail: { id },
      bubbles: true,
      composed: true
    }));
  }

  handleUnarchive(id) {
    this.dispatchEvent(new CustomEvent('unarchive-note', {
      detail: { id },
      bubbles: true,
      composed: true
    }));
  }

  handleDelete(id) {
    this.dispatchEvent(new CustomEvent('delete-note', {
      detail: { id },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('note-card', NoteCard);

class NotesApp {
  constructor() {
    this.notes = this.loadNotes();
  }
  async loadNotes() {
    this.showLoading();
  
    try {
      const [activeResponse, archivedResponse] = await Promise.all([
        fetch('https://notes-api.dicoding.dev/v2/notes'),
        fetch('https://notes-api.dicoding.dev/v2/notes/archived')
      ]);
  
      const activeResult = await activeResponse.json();
      const archivedResult = await archivedResponse.json();
  
      if (activeResult.status === 'success' && archivedResult.status === 'success') {
        this.notes = [...activeResult.data, ...archivedResult.data];
      } else {
        this.notes = [];
        throw new Error(activeResult.message || archivedResult.message);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Notes',
        text: error.message || 'Please check your internet connection and try again',
        confirmButtonColor: 'var(--primary-color)'
      });
      this.notes = [];
    }
  
    this.hideLoading();
    this.renderNotes();
    this.updateStats();
  }

  async init() {
    await this.loadNotes();
    this.setupEventListeners();
    this.updateStats();
  }

  showLoading() {
    const loadingIndicator = document.querySelector('loading-indicator');
    if (loadingIndicator) loadingIndicator.show();
  }

  hideLoading() {
    const loadingIndicator = document.querySelector('loading-indicator');
    if (loadingIndicator) loadingIndicator.hide();
  }

  saveNotes() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
  renderNotes() {
    const activeNotesContainer = document.getElementById('active-notes');
    const archivedNotesContainer = document.getElementById('archived-notes');

    activeNotesContainer.innerHTML = '';
    archivedNotesContainer.innerHTML = '';

    this.notes.forEach(note => {
      const noteElement = document.createElement('note-card');
      noteElement.setAttribute('data-id', note.id);
      noteElement.setAttribute('data-title', note.title);
      noteElement.setAttribute('data-body', note.body);
      noteElement.setAttribute('data-created-at', note.createdAt);
      noteElement.setAttribute('data-archived', note.archived);

      if (note.archived) {
        archivedNotesContainer.appendChild(noteElement);
      } else {
        activeNotesContainer.appendChild(noteElement);
      }
    });
    console.log(this.notes);
    console.log(activeNotesContainer);
  }

  setupEventListeners() {
    document.addEventListener('add-note', async (e) => {
      const { title, body } = e.detail;
      this.showLoading();

      try {
        const response = await fetch('https://notes-api.dicoding.dev/v2/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, body })
        });

        const result = await response.json();

        if (result.status === 'success') {
          this.notes.unshift(result.data);
          this.renderNotes();
          this.updateStats();
        } else {
          // alert('Gagal menambahkan catatan: ' + (result.message || 'Error tidak diketahui'));
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Gagal menambahkan catatan',
          });  
        }
      } catch (error) {
        console.error('Error adding note:', error);
        // alert('Failed to add note due to network error');
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Terjadi kesalahan saat menambahkan catatan',
        });        
      } finally {
        this.hideLoading();
      }
    });

    document.addEventListener('archive-note', async (e) => {
      const { id } = e.detail;
      this.showLoading();

      try {
        const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${id}/archive`, {
          method: 'POST'
        });

        const result = await response.json();

        if (result.status === 'success') {
          const note = this.notes.find(n => n.id === id);
          if (note) note.archived = true;
          this.renderNotes();
          this.updateStats();
        } else {
          // alert('Gagal mengarsipkan catatan');
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Gagal mengarsipkan catatan',
          });          
        }
      } catch (error) {
        console.error('Gagal archive:', error);
        // alert('Terjadi kesalahan saat mengarsipkan catatan');
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Terjadi kesalahan saat mengarsipkan catatan',
        });
      }

      this.hideLoading();
    });


    document.addEventListener('unarchive-note', async (e) => {
      const { id } = e.detail;
      this.showLoading();

      try {
        const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${id}/unarchive`, {
          method: 'POST'
        });

        const result = await response.json();

        if (result.status === 'success') {
          const note = this.notes.find(n => n.id === id);
          if (note) note.archived = false;
          this.renderNotes();
          this.updateStats();
        } else {
          // alert('Gagal membatalkan arsip catatan');
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Gagal membatalkan arsip catatan',
          });          
        }
      } catch (error) {
        console.error('Gagal unarchive:', error);
        // alert('Terjadi kesalahan saat membatalkan arsip catatan');
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Terjadi kesalahan saat membatalkan arsip catatan',
        });
      }

      this.hideLoading();
    });


    document.addEventListener('delete-note', async (e) => {
      const { id } = e.detail;
      this.showLoading();

      try {
        const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.status === 'success') {
          this.notes = this.notes.filter(n => n.id !== id);
          this.renderNotes();
          this.updateStats();
        } else {
          // alert('Gagal menghapus catatan');
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Gagal menghapus catatan',
          });          
        }
      } catch (error) {
        console.error('Gagal hapus note:', error);
        // alert('Terjadi kesalahan saat menghapus catatan');
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Terjadi kesalahan saat menghapus catatan',
        });
        
      }

      this.hideLoading();
    });

  }

  updateStats() {
    const activeCount = this.notes.filter(note => !note.archived).length;
    const archivedCount = this.notes.filter(note => note.archived).length;

    const header = document.querySelector('app-header');
    if (header) {
      header.updateStats(activeCount, archivedCount);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new NotesApp();
  await app.init();
});

//Untuk Reset data ke notes data, pangggil dari console
window.resetNotesData = () => {
  const app = new NotesApp();
  app.resetNotesData();
};