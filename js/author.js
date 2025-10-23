import { saveCapsule, loadCapsule } from './storage.js';

let flashcards = [];
let quiz = [];
let editingId = null;
let currentCapsule = { books: [], videos: [] };

// Render Flashcards 
function renderFlashcards(container, addBtn) {
  container.querySelectorAll('.flashcard-row').forEach(e => e.remove());
  flashcards.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'd-flex gap-2 mb-2 flashcard-row';

    const front = document.createElement('input');
    front.type = 'text';
    front.placeholder = 'Front';
    front.value = f.front;
    front.className = 'form-control';
    front.oninput = e => f.front = e.target.value;

    const back = document.createElement('input');
    back.type = 'text';
    back.placeholder = 'Back';
    back.value = f.back;
    back.className = 'form-control';
    back.oninput = e => f.back = e.target.value;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-remove';
    del.textContent = 'Remove';
    del.onclick = () => {
      flashcards.splice(i, 1);
      renderFlashcards(container, addBtn);
    };

    div.append(front, back, del);
    container.appendChild(div);
  });
}

//  Render Quiz 
function renderQuiz(container, addBtn) {
  container.querySelectorAll('.quiz-row').forEach(e => e.remove());
  quiz.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'border p-2 mb-2 quiz-row';

    const qInput = document.createElement('input');
    qInput.type = 'text';
    qInput.placeholder = 'Question';
    qInput.value = q.question || '';
    qInput.className = 'form-control mb-1';
    qInput.oninput = e => q.question = e.target.value;
    div.appendChild(qInput);

    q.choices = q.choices || ['', '', '', ''];
    for (let j = 0; j < 4; j++) {
      const c = document.createElement('input');
      c.type = 'text';
      c.placeholder = `Choice ${j + 1}`;
      c.value = q.choices[j] || '';
      c.className = 'form-control mb-1';
      c.oninput = e => q.choices[j] = e.target.value;
      div.appendChild(c);
    }

    const correct = document.createElement('select');
    correct.className = 'form-select mb-1';
    for (let j = 0; j < 4; j++) {
      const opt = document.createElement('option');
      opt.value = j;
      opt.textContent = `Correct: Choice ${j + 1}`;
      if (j === q.correctIndex) opt.selected = true;
      correct.appendChild(opt);
    }
    correct.onchange = e => q.correctIndex = parseInt(e.target.value);
    div.appendChild(correct);

    const expl = document.createElement('input');
    expl.type = 'text';
    expl.placeholder = 'Explanation';
    expl.value = q.explanation || '';
    expl.className = 'form-control mb-1';
    expl.oninput = e => q.explanation = e.target.value;
    div.appendChild(expl);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-remove';
    del.textContent = 'Remove';
    del.onclick = () => {
      quiz.splice(i, 1);
      renderQuiz(container, addBtn);
    };
    div.appendChild(del);

    container.appendChild(div);
  });
}

// Render Books 
function renderBooks() {
  const container = document.querySelector('#booksContainer');
  container.innerHTML = '';
  (currentCapsule.books || []).forEach((b, i) => {
    const div = document.createElement('div');
    div.className = 'learn-card d-flex justify-content-between align-items-center flex-wrap';

    const span = document.createElement('span');
    span.textContent = 'Book';
    span.className = 'fw-semibold';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-warning btn-sm';
    del.textContent = 'Remove';
    del.onclick = () => {
      currentCapsule.books.splice(i, 1);
      renderBooks();
    };

    div.append(span, del);
    container.appendChild(div);
  });
}

// Render Videos 
function renderVideos() {
  const container = document.querySelector('#videosContainer');
  container.innerHTML = '';
  (currentCapsule.videos || []).forEach((v, i) => {
    const div = document.createElement('div');
    div.className = 'learn-card d-flex justify-content-between align-items-center flex-wrap';

    const span = document.createElement('span');
    span.textContent = 'Video';
    span.className = 'fw-semibold';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-warning btn-sm';
    del.textContent = 'Remove';
    del.onclick = () => {
      currentCapsule.videos.splice(i, 1);
      renderVideos();
    };

    div.append(span, del);
    container.appendChild(div);
  });
}

//  Load Capsule for Editing 
export function loadForEdit(id) {
  const titleInput = document.querySelector('#title');
  const subjectInput = document.querySelector('#subject');
  const levelInput = document.querySelector('#level');
  const descriptionInput = document.querySelector('#description');
  const notesInput = document.querySelector('#notes');
  const flashcardsContainer = document.querySelector('#flashcards');
  const quizContainer = document.querySelector('#quiz');
  const addFlashcardBtn = document.querySelector('#addFlashcard');
  const addQuizBtn = document.querySelector('#addQuestion');

  if (!id) {
    editingId = null;
    titleInput.value = '';
    subjectInput.value = '';
    levelInput.value = 'Beginner';
    descriptionInput.value = '';
    notesInput.value = '';
    flashcards = [];
    quiz = [];
    currentCapsule = { books: [], videos: [] };
    renderFlashcards(flashcardsContainer, addFlashcardBtn);
    renderQuiz(quizContainer, addQuizBtn);
    renderBooks();
    renderVideos();
    return;
  }

  const c = loadCapsule(id);
  if (!c) return;
  editingId = c.id;
  titleInput.value = c.title;
  subjectInput.value = c.subject;
  levelInput.value = c.level;
  descriptionInput.value = c.description;
  notesInput.value = (c.notes || []).join('\n');
  flashcards = c.flashcards || [];
  quiz = c.quiz || [];
  currentCapsule = { books: c.books || [], videos: c.videos || [] };
  renderFlashcards(flashcardsContainer, addFlashcardBtn);
  renderQuiz(quizContainer, addQuizBtn);
  renderBooks();
  renderVideos();
}
// Fix Add Flashcard button
const addFlashcardBtn = document.querySelector('#addFlashcard');
addFlashcardBtn.replaceWith(addFlashcardBtn.cloneNode(true));
const newAddFlashcardBtn = document.querySelector('#addFlashcard');
newAddFlashcardBtn.onclick = () => {
  flashcards.push({ front: '', back: '' });
  renderFlashcards(document.querySelector('#flashcards'), newAddFlashcardBtn);
};

// Fix Add Question button
const addQuizBtn = document.querySelector('#addQuestion');
addQuizBtn.replaceWith(addQuizBtn.cloneNode(true));
const newAddQuizBtn = document.querySelector('#addQuestion');
newAddQuizBtn.onclick = () => {
  quiz.push({ question: '', choices: ['', '', '', ''], correctIndex: 0, explanation: '' });
  renderQuiz(document.querySelector('#quiz'), newAddQuizBtn);
};

// Fix Add PDF button
const addBookBtn = document.querySelector('#addBook');
addBookBtn.replaceWith(addBookBtn.cloneNode(true));
const newAddBookBtn = document.querySelector('#addBook');
newAddBookBtn.onclick = () => {
  const link = document.querySelector('#bookFile').value.trim();
  if (!link) return alert('Please enter a PDF link.');
  currentCapsule.books.push({ title: link, url: link });
  renderBooks();
  document.querySelector('#bookFile').value = '';
};

// Fix Add Video button
const addVideoBtn = document.querySelector('#addVideo');
addVideoBtn.replaceWith(addVideoBtn.cloneNode(true));
const newAddVideoBtn = document.querySelector('#addVideo');
newAddVideoBtn.onclick = () => {
  const link = document.querySelector('#videoLink').value.trim();
  if (!link) return alert('Please enter a YouTube link.');
  currentCapsule.videos.push({ url: link });
  renderVideos();
  document.querySelector('#videoLink').value = '';
};

//  DOM Ready 
document.addEventListener('DOMContentLoaded', () => {

 //  Auto-save 
let autoSaveTimer = null;
const AUTO_SAVE_DELAY = 1000; 
let lastSavedCapsule = null;


const statusEl = document.createElement('div');
statusEl.style.fontSize = '0.85rem';
statusEl.style.color = '#6c757d';
statusEl.style.marginTop = '5px';
statusEl.textContent = 'Status: Idle';
document.querySelector('#authorForm').appendChild(statusEl);

function scheduleAutoSave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    const titleInput = document.querySelector('#title');
    const subjectInput = document.querySelector('#subject');
    const levelInput = document.querySelector('#level');
    const descriptionInput = document.querySelector('#description');
    const notesInput = document.querySelector('#notes');

    if (!titleInput.value.trim()) return; 

    const c = {
      id: editingId || crypto.randomUUID(),
      title: titleInput.value,
      subject: subjectInput.value,
      level: levelInput.value,
      description: descriptionInput.value,
      notes: notesInput.value.split('\n').filter(n => n.trim()),
      flashcards,
      quiz,
      books: currentCapsule.books,
      videos: currentCapsule.videos
    };


    if (JSON.stringify(c) !== JSON.stringify(lastSavedCapsule)) {
      saveCapsule(c);
      editingId = c.id;
      lastSavedCapsule = JSON.parse(JSON.stringify(c));
      statusEl.textContent = `Auto-saved: ${new Date().toLocaleTimeString()}`;
    } else {
      statusEl.textContent = 'No changes';
    }
  }, AUTO_SAVE_DELAY);
}


const inputsToWatch = [
  '#title', '#subject', '#level', '#description', '#notes',
  '#flashcards', '#quiz', '#bookFile', '#videoLink'
];

inputsToWatch.forEach(selector => {
  const el = document.querySelector(selector);
  if (el) {
    el.addEventListener('input', scheduleAutoSave);
  }
});


addFlashcardBtn.addEventListener('click', scheduleAutoSave);
addQuizBtn.addEventListener('click', scheduleAutoSave);
addBookBtn.addEventListener('click', scheduleAutoSave);
addVideoBtn.addEventListener('click', scheduleAutoSave);

  const titleInput = document.querySelector('#title');
  const subjectInput = document.querySelector('#subject');
  const levelInput = document.querySelector('#level');
  const descriptionInput = document.querySelector('#description');
  const notesInput = document.querySelector('#notes');
  const flashcardsContainer = document.querySelector('#flashcards');
  const quizContainer = document.querySelector('#quiz');
  const addFlashcardBtn = document.querySelector('#addFlashcard');
  const addQuizBtn = document.querySelector('#addQuestion');
  const form = document.querySelector('#authorForm');

  const bookFileInput = document.querySelector('#bookFile');
  const addBookBtn = document.querySelector('#addBook');
  const videoLinkInput = document.querySelector('#videoLink');
  const addVideoBtn = document.querySelector('#addVideo');

  // Add flashcard
  addFlashcardBtn.onclick = () => {
    flashcards.push({ front: '', back: '' });
    renderFlashcards(flashcardsContainer, addFlashcardBtn);
  };

  // Add quiz question
  addQuizBtn.onclick = () => {
    quiz.push({ question: '', choices: ['', '', '', ''], correctIndex: 0, explanation: '' });
    renderQuiz(quizContainer, addQuizBtn);
  };

  // Add PDF
  addBookBtn.onclick = () => {
    const link = bookFileInput.value.trim();
    if (!link) return alert('Please enter a PDF link.');
    currentCapsule.books.push({ title: link, url: link });
    renderBooks();
    bookFileInput.value = '';
  };

  // Add Video
  addVideoBtn.onclick = () => {
    const link = videoLinkInput.value.trim();
    if (!link) return alert('Please enter a YouTube link.');
    currentCapsule.videos.push({ url: link });
    renderVideos();
    videoLinkInput.value = '';
  };

  // Save Capsule
form.onsubmit = e => {
  e.preventDefault();
  if (!titleInput.value.trim()) return alert('Title is required');

  const c = {
    id: editingId || crypto.randomUUID(),
    title: titleInput.value,
    subject: subjectInput.value,
    level: levelInput.value,
    description: descriptionInput.value,
    notes: notesInput.value.split('\n').filter(n => n.trim()),
    flashcards,
    quiz,
    books: currentCapsule.books,
    videos: currentCapsule.videos
  };

  saveCapsule(c);
  editingId = c.id;
  alert('Capsule saved!');

  
  import('./library.js').then(mod => mod.renderLibrary());

 
  if (window.activeView === 'learn' && window.currentCapsule?.id === c.id) {
    import('./learn.js').then(mod => mod.loadCapsuleForLearn(c));
  }
};
}
)
