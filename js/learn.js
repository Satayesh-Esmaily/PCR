import { loadProgress, saveProgress } from './storage.js';
import { updateCapsuleProgress } from './library.js';

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let currentCapsule = null;
let currentIndex = 0;
let progress = { bestScore: 0, knownFlashcards: [] };

//  DOM Elements 
const notesListEl = $('#notesList');
const notesSearchEl = $('#noteSearch');
const flashcardContainer = $('#flashcard');
const prevBtn = $('#prevCard');
const nextBtn = $('#nextCard');
const markKnownBtn = $('#markKnown');
const markUnknownBtn = $('#markUnknown');
const quizContainer = $('#quizArea');

// Tabs 
const learnTabs = document.querySelectorAll('#learnTabs .nav-link');
const learnSections = document.querySelectorAll('.learn-section');

learnTabs.forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const target = tab.dataset.section;
    learnTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    learnSections.forEach(sec => sec.classList.add('d-none'));
    document.querySelector(`#section-${target}`).classList.remove('d-none');

    if (target === 'notes') renderNotes();
    if (target === 'flashcards') renderFlashcard();
    if (target === 'quiz') renderQuiz();
    if (target === 'books') renderBooks();
    if (target === 'videos') renderVideos();
  });
});

//  Load Capsule 
export function loadCapsuleForLearn(capsule) {
  currentCapsule = capsule;
  progress = loadProgress(capsule.id) || { bestScore: 0, knownFlashcards: [] };
  currentIndex = 0;

  renderNotes();
  renderFlashcard();
  renderQuiz();
  renderBooks();
  renderVideos();
}

//  Notes 
function renderNotes() {
  if (!currentCapsule) return;
  notesListEl.innerHTML = '';
  const query = notesSearchEl.value.toLowerCase();
  (currentCapsule.notes || []).forEach(note => {
    if (note.toLowerCase().includes(query)) {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = note;
      notesListEl.appendChild(li);
    }
  });
  if (!notesListEl.children.length) {
    const empty = document.createElement('li');
    empty.className = 'list-group-item text-muted';
    empty.textContent = 'No matching notes found.';
    notesListEl.appendChild(empty);
  }
}
notesSearchEl?.addEventListener('input', renderNotes);

// Flashcards 
function renderFlashcard() {
  if (!currentCapsule?.flashcards?.length) {
    flashcardContainer.innerHTML = '<p class="text-muted">No flashcards available.</p>';
    return;
  }

  const card = currentCapsule.flashcards[currentIndex];
  const known = progress.knownFlashcards.includes(currentIndex);

  flashcardContainer.innerHTML = `
    <div class="flashcard ${known ? 'known' : ''}" id="flashcardCard">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <strong>Front:</strong> ${card.front || '(empty)'}
        </div>
        <div class="flashcard-back">
          <strong>Back:</strong> ${card.back || '(empty)'}
        </div>
        <div class="flashcard-counter">${currentIndex + 1}/${currentCapsule.flashcards.length}</div>
      </div>
    </div>
  `;

  const fcEl = document.getElementById('flashcardCard');
  fcEl.classList.remove('flipped'); 

  fcEl.addEventListener('click', () => fcEl.classList.toggle('flipped'));
}

//  Flashcard Navigation 
prevBtn?.addEventListener('click', () => {
  if (!currentCapsule?.flashcards?.length) return;
  currentIndex = (currentIndex - 1 + currentCapsule.flashcards.length) % currentCapsule.flashcards.length;
  renderFlashcard();
});

nextBtn?.addEventListener('click', () => {
  if (!currentCapsule?.flashcards?.length) return;
  currentIndex = (currentIndex + 1) % currentCapsule.flashcards.length;
  renderFlashcard();
});

//  Known / Unknown 
markKnownBtn?.addEventListener('click', () => {
  if (!currentCapsule?.flashcards?.length) return;
  if (!progress.knownFlashcards.includes(currentIndex)) progress.knownFlashcards.push(currentIndex);
  saveProgress(currentCapsule.id, progress);


  updateCapsuleProgress(currentCapsule.id, 'flash', progress.knownFlashcards);

  const fcEl = $('#flashcardCard');
  fcEl?.classList.add('flipped');
});

markUnknownBtn?.addEventListener('click', () => {
  if (!currentCapsule?.flashcards?.length) return;
  progress.knownFlashcards = progress.knownFlashcards.filter(i => i !== currentIndex);
  saveProgress(currentCapsule.id, progress);


  updateCapsuleProgress(currentCapsule.id, 'flash', progress.knownFlashcards);

  const fcEl = $('#flashcardCard');
  fcEl?.classList.add('flipped');
});

// Quiz 
let currentQuestionIndex = 0;
let quizScore = 0;

function renderQuiz() {
  if (!currentCapsule?.quiz?.length) {
    quizContainer.innerHTML = '<p class="text-muted">No quiz available.</p>';
    return;
  }
  currentQuestionIndex = 0;
  quizScore = 0;
  showQuestion();
}

function showQuestion() {
  const q = currentCapsule.quiz[currentQuestionIndex];

  
  if (!q || !Array.isArray(q.choices) || q.correctIndex === undefined) {
    quizContainer.innerHTML = `<p class="text-danger">❌ Invalid quiz data at question ${currentQuestionIndex + 1}</p>`;
    return;
  }

  quizContainer.innerHTML = `
    <div class="quiz-card">
      <p><strong>Q${currentQuestionIndex + 1}:</strong> ${q.question}</p>
      ${q.choices.map((choice, i) =>
        `<button class="choice-btn btn btn-outline-primary m-1" data-index="${i}">${choice}</button>`
      ).join('')}
    </div>
  `;

  $$('.choice-btn').forEach(btn => {
    btn.onclick = () => {
      const selected = parseInt(btn.dataset.index);
      const correctChoice = q.choices[q.correctIndex] || 'Unknown';
      const explanation = q.explanation ? `\n💡 ${q.explanation}` : '';

      if (selected === q.correctIndex) {
        btn.classList.add('btn-success');
        quizScore++;
      } else {
        btn.classList.add('btn-danger');
        alert(`✅ Correct answer: ${correctChoice}${explanation}`);
      }

      setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentCapsule.quiz.length) {
          showQuestion();
        } else {
          const percent = Math.round((quizScore / currentCapsule.quiz.length) * 100);
          alert(`🏁 Quiz finished! Score: ${percent}%`);

          if (percent > progress.bestScore) {
            progress.bestScore = percent;
            saveProgress(currentCapsule.id, progress);
          }

          updateCapsuleProgress(currentCapsule.id, 'quiz', quizScore);
          renderQuiz();
        }
      }, 400);
    };
  });
}

// Books 
function renderBooks() {
  const area = $('#booksArea');
  if (!area) return;

  area.innerHTML = '';

  if (!currentCapsule?.books?.length) {
    area.innerHTML = '<p class="text-muted text-center">No books available.</p>';
    return;
  }

  currentCapsule.books.forEach(book => {
    const titleText = book.title.startsWith('http') ? 'Book' : book.title;
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="learn-card">
        <h5>${titleText}</h5>
        <p>${book.description || ''}</p>
        <a href="${book.url}" target="_blank" class="btn btn-primary w-100">Open Book</a>
      </div>
    `;
    area.appendChild(col);
  });
}

// Videos 
function renderVideos() {
  const area = $('#videosArea');
  if(!area) return;
  area.innerHTML = '';
  if(!currentCapsule?.videos?.length){ area.innerHTML='<p class="text-muted">No videos available.</p>'; return; }
  currentCapsule.videos.forEach(video => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="learn-card">
        <h5>${video.title || 'Video'}</h5>
        <p>${video.description || ''}</p>
        <a href="${video.url}" target="_blank" class="btn btn-primary w-100">Watch Video</a>
      </div>
    `;
    area.appendChild(col);
  });
}
import { getCapsulesIndex, loadCapsule } from './storage.js';



// Keyboard Shortcuts
// Space: flip flashcard
// [   : previous tab
// ]   : next tab
// 
document.addEventListener('keydown', e => {
  if(!currentCapsule) return;

  const activeTab = [...learnTabs].findIndex(t => t.classList.contains('active'));
  let newIndex = activeTab;

  if(e.code === 'Space') {
    const fcEl = document.getElementById('flashcardCard');
    if(fcEl) fcEl.classList.toggle('flipped');
  }

  if(e.key === '[') { // Previous tab
    newIndex = (activeTab - 1 + learnTabs.length) % learnTabs.length;
  }

  if(e.key === ']') { // Next tab
    newIndex = (activeTab + 1) % learnTabs.length;
  }

  if(newIndex !== activeTab) {
    learnTabs[newIndex].click();
  }
});
export function initCapsuleSelector(onSelect) {
  const selector = document.getElementById('capsuleSelector');
  if (!selector) return;

  function populateSelector() {
    selector.innerHTML = '';
    const capsules = [];

   
    for (let key in localStorage) {
      if (key.startsWith('pc_capsule_')) {
        try {
          const capsule = JSON.parse(localStorage.getItem(key));
          if (capsule && capsule.title) capsules.push(capsule);
        } catch {}
      }
    }

    if (capsules.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'No capsules available';
      opt.disabled = true;
      selector.appendChild(opt);
      return;
    }

    capsules.forEach((cap, i) => {
      const opt = document.createElement('option');
      opt.value = cap.id;
      opt.textContent = cap.title || `Capsule ${i + 1}`;
      selector.appendChild(opt);
    });

   
    onSelect(capsules[0]);

    selector.onchange = e => {
      const id = e.target.value;
      const selectedCapsule = capsules.find(c => c.id === id);
      if (selectedCapsule) onSelect(selectedCapsule);
    };
  }

  
  document.querySelector('[data-view="learn"]').addEventListener('click', populateSelector);
}


