import { renderLibrary, initLibraryEvents } from './library.js';
import { loadForEdit } from './author.js';
import { loadCapsuleForLearn } from './learn.js';
import { importCapsule } from './storage.js';
import { initCapsuleSelector } from './learn.js';
import { loadCapsule } from './storage.js'; 

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const views = {
  library: $('#view-library'),
  author: $('#view-author'),
  learn: $('#view-learn')
};

let activeView = 'library';

function showView(view) {
  if (!views[view]) return;
  Object.values(views).forEach(v => v.classList.add('d-none'));
  views[view].classList.remove('d-none');
  activeView = view;
  $$('a.nav-link').forEach(link =>
    link.classList.toggle('active', link.dataset.view === view)
  );
}

// Navbar
$$('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showView(link.dataset.view);
  });
});

function handleLearn(capsuleOrId) {

  const capsule = typeof capsuleOrId === 'object'
    ? capsuleOrId
    : loadCapsule(capsuleOrId);

  if (!capsule) return;


  loadCapsuleForLearn(capsule);
  showView('learn');


  initCapsuleSelector(selected => {
    if (selected.id === capsule.id) {
      loadCapsuleForLearn(selected);
    }
  });
}


function handleEdit(id) {
  loadForEdit(id);
  showView('author');
}

initLibraryEvents(handleLearn, handleEdit);
renderLibrary();

// New Capsule
$('#newCapsule').addEventListener('click', () => {
  loadForEdit(null);
  showView('author');
});

// Import JSON
const importBtn = $('#import-json');
const importInput = $('#importJSON');

importBtn.addEventListener('click', () => importInput.click());

importInput.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    await importCapsule(file);
    renderLibrary();
    alert('Capsule imported successfully!');
  } catch (err) {
    console.error(err);
    alert('Import failed: ' + err.message);
  }

  initCapsuleSelector(capsule => {
  loadCapsuleForLearn(capsule);
});

  e.target.value = '';
});

// Learn keyboard shortcuts
document.addEventListener('keydown', e => {
  if (activeView === 'learn') {
    if (e.code === 'Space') {
      e.preventDefault();
      $('.flashcard')?.classList.toggle('flipped');
    }
    const tabOrder = ['notes', 'flashcards', 'quiz'];
    let idx = tabOrder.indexOf(
      $('.nav-link.active[data-tab]')?.dataset.tab || 'notes'
    );
    if (e.key === '[') idx = (idx - 1 + 3) % 3;
    if (e.key === ']') idx = (idx + 1) % 3;
    if (e.key === '[' || e.key === ']') {
      $$('[data-tab]').forEach(t => t.classList.remove('active'));
      $(`[data-tab="${tabOrder[idx]}"]`)?.classList.add('active');
      $('#notesTab').classList.toggle('d-none', tabOrder[idx] !== 'notes');
      $('#flashcardsTab').classList.toggle('d-none', tabOrder[idx] !== 'flashcards');
      $('#quizTab').classList.toggle('d-none', tabOrder[idx] !== 'quiz');
    }
  }
});

const backBtn = $('#backToLibrary');
backBtn.addEventListener('click', () => {
  showView('library');
});

// Learn UI
initCapsuleSelector(capsule => {
  loadCapsuleForLearn(capsule);
});


document.addEventListener('DOMContentLoaded', () => {
  const learnNav = document.querySelector('[data-view="learn"]');
  if (learnNav) {
    learnNav.addEventListener('click', () => {
      const selector = document.getElementById('capsuleSelector');
      if (selector && selector.options.length === 0) {
        const event = new Event('click');
        learnNav.dispatchEvent(event);
      }
    });
  }
});

// Default
showView('library');

