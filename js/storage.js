export const STORAGE_KEYS = {
  INDEX: 'pc_capsules_index',
  CAPSULE: id=>`pc_capsule_${id}`,
  PROGRESS: id=>`pc_progress_${id}`
};

export function getCapsulesIndex(){
  const raw = localStorage.getItem(STORAGE_KEYS.INDEX);
  return raw?JSON.parse(raw):[];
}

export function saveCapsule(c){
  const index = getCapsulesIndex();
  const now = new Date().toISOString();
  const existing = index.find(i=>i.id===c.id);
  c.updatedAt=now;
  if(!existing) index.push({id:c.id,title:c.title,subject:c.subject,level:c.level,updatedAt:now});
  else Object.assign(existing,{title:c.title,subject:c.subject,level:c.level,updatedAt:now});
  localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(index));
  localStorage.setItem(STORAGE_KEYS.CAPSULE(c.id), JSON.stringify(c));
}

export function loadCapsule(id){
  const raw = localStorage.getItem(STORAGE_KEYS.CAPSULE(id));
  return raw?JSON.parse(raw):null;
}

export function deleteCapsule(id){
  const index = getCapsulesIndex().filter(i=>i.id!==id);
  localStorage.setItem(STORAGE_KEYS.INDEX, JSON.stringify(index));
  localStorage.removeItem(STORAGE_KEYS.CAPSULE(id));
  localStorage.removeItem(STORAGE_KEYS.PROGRESS(id));
}

export function saveProgress(id, progress){
  localStorage.setItem(STORAGE_KEYS.PROGRESS(id), JSON.stringify(progress));
}

export function loadProgress(id){
  const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS(id));
  return raw?JSON.parse(raw):{bestScore:0,knownFlashcards:[]};
}


export function exportCapsule(c){
  const blob = new Blob([JSON.stringify({...c, schema:'pocket-classroom/v1'}, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${c.title.replace(/\s+/g,'_')}.json`;
  a.click();
}


export function importCapsule(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        
        const capsules = Array.isArray(data)
          ? data
          : (Array.isArray(data.capsules) ? data.capsules : [data]);

        const imported = [];

        capsules.forEach(c => {
          
          if (c.schema && c.schema !== 'pocket-classroom/v1') {
            throw new Error('Invalid capsule schema');
          }

          
          if(!c.title || (!c.notes?.length && !c.flashcards?.length && !c.quiz?.length)) {
            throw new Error('Invalid capsule data');
          }

          
          if (!c.schema) alert('Imported capsule has no schema field; assuming legacy format.');

          
          c.id = crypto.randomUUID();

          
          saveCapsule(c);

          imported.push(c);
        });

        
        resolve(imported.length === 1 ? imported[0] : imported);

      } catch (e) {
        reject(e);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
// Select the theme toggle button
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;

// Set default theme to light
body.classList.remove('dark-theme'); 
themeToggleBtn.textContent = '🌙'; // Moon icon for dark mode

// Toggle theme on button click
themeToggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  
  // Change button icon based on current theme
  if(body.classList.contains('dark-theme')) {
    themeToggleBtn.textContent = '☀️'; // Sun icon for light mode
  } else {
    themeToggleBtn.textContent = '🌙'; // Moon icon for dark mode
  }
});
