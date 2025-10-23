import { getCapsulesIndex, loadCapsule, deleteCapsule, exportCapsule } from './storage.js';
const $ = s => document.querySelector(s);
const capsuleListEl = $('#capsuleList');


export function renderLibrary() {
  const index = getCapsulesIndex();
  capsuleListEl.innerHTML = '';

  if (!index.length) {
    capsuleListEl.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <h5 class="fw-light">📚 No capsules yet</h5>
        <p class="small">Click <span class="text-success fw-bold">+ New Capsule</span> to create your first one.</p>
      </div>
    `;
    return;
  }
  function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', { 
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
}


  index.forEach(item => {
    const capsule = loadCapsule(item.id);
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';

  
    const prog = JSON.parse(localStorage.getItem(`pc_progress_${item.id}`)) || {};
    const knownFlashcards = prog.knownFlashcards || [];
    const quizScore = prog.quizScore || 0;

    const totalFlashcards = capsule.flashcards?.length || 1;
    const totalQuiz = capsule.quiz?.length || 0;

    const flashProgress = Math.round((knownFlashcards.length / totalFlashcards) * 100);
    const quizProgress = totalQuiz ? Math.round((quizScore / totalQuiz) * 100) : 0;

    const progressPercent = Math.round((flashProgress + quizProgress) / 2);

    col.innerHTML = `
     <div class="card library-card shadow-sm h-100 rounded-4 hover-card" data-id="${item.id}" style="background-color: #0C3B2E; color: #FFBA00;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title fw-bold mb-1">${item.title}</h5>
          <p class="card-subtitle small mb-2">${item.subject || 'General'} | ${item.level}</p>
          <p class="small mb-3">${capsule.description ? capsule.description.slice(0, 60) + '…' : 'No description available.'}</p>

          <!-- Progress Bar -->
          <div class="progress-container mb-2">
            <div class="progress" style="height: 8px;">
              <div class="progress-bar bg-warning" id="progress-${item.id}" role="progressbar" 
                   style="width: ${progressPercent}%"></div>
            </div>
            <small class="text-light">${progressPercent}%</small>
          </div>
<p class="mb-1">Flashcards known: <span class="flashcard-progress">${knownFlashcards.length} of ${totalFlashcards}</span></p>
<p class="mb-2">Quiz score: <span class="quiz-progress">${totalQuiz ? Math.round((quizScore / totalQuiz) * 100) : 0}%</span></p>


         <small class="mt-auto mb-3">🕒 Updated: ${formatDate(item.updatedAt)}</small>


          <div class="d-flex flex-wrap gap-2 mt-auto">
            <button class="btn btn-success btn-sm flex-fill learn-btn" data-id="${item.id}">🎓 Learn</button>
            <button class="btn btn-primary btn-sm flex-fill edit-btn" data-id="${item.id}">✏️ Edit</button>
            <button class="btn btn-outline-info btn-sm flex-fill export-btn" data-id="${item.id}">⬇️ Export</button>
            <button class="btn btn-outline-danger btn-sm flex-fill delete-btn" data-id="${item.id}">🗑 Delete</button>
          </div>
        </div>
      </div>
    `;

    capsuleListEl.appendChild(col);
  });
}

export function initLibraryEvents(onLearn, onEdit) {
  capsuleListEl.addEventListener('click', e => {
    const btn = e.target;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains('learn-btn')) {
  const capsule = loadCapsule(id);
  onLearn(capsule);
}

    if (btn.classList.contains('edit-btn')) onEdit(id);
    if (btn.classList.contains('export-btn')) exportCapsule(loadCapsule(id));

    if (btn.classList.contains('delete-btn')) {
      if (confirm('Delete this capsule?')) {
        deleteCapsule(id);
        renderLibrary();
      }
    }
  });
}


export function updateCapsuleProgress(id, type, knownOrScore) {
  const progressBar = document.getElementById(`progress-${id}`);
  const capsule = loadCapsule(id);
  const prog = JSON.parse(localStorage.getItem(`pc_progress_${id}`)) || {};

  if(type === 'flash') {
    prog.knownFlashcards = knownOrScore; 
  } else if(type === 'quiz') {
    prog.quizScore = knownOrScore; 
  }

  localStorage.setItem(`pc_progress_${id}`, JSON.stringify(prog));

  const totalFlashcards = capsule.flashcards?.length || 1;
  const totalQuiz = capsule.quiz?.length || 1;

  const flashProgress = Math.round((prog.knownFlashcards?.length || 0) / totalFlashcards * 100);
  const quizProgress = Math.round((prog.quizScore || 0) / totalQuiz * 100);
  const progressPercent = Math.round((flashProgress + quizProgress) / 2);


  if(progressBar) {
    progressBar.style.width = `${progressPercent}%`;
    const percentText = progressBar.closest('.progress-container')?.querySelector('small');
    if (percentText) percentText.textContent = `${progressPercent}%`;
  }


  const cardEl = document.querySelector(`.library-card[data-id="${id}"]`);
  if(cardEl) {
    const flashEl = cardEl.querySelector('.flashcard-progress');
    const quizEl = cardEl.querySelector('.quiz-progress');

    if(flashEl) flashEl.textContent = `${prog.knownFlashcards?.length || 0} of ${totalFlashcards}`;
    if(quizEl) quizEl.textContent = `${quizProgress}%`;
  }
}
