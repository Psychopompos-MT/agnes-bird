const quizQuestions = [
  { sentence: "Maminka vaří oběd.", options: ["Maminka (podmět)", "vaří (přísudek)", "oběd (jiné)"] , answer: 0, explain: "Podmět odpovídá na otázku Kdo? — Maminka. Přísudek říká, co dělá — vaří." },
  { sentence: "Pes štěká.", options: ["Pes (přísudek)", "štěká (přísudek)", "Pes (podmět)"], answer: 2, explain: "Podmět je Pes (Kdo? Pes). Přísudek je sloveso štěká — co dělá podmět." },
  { sentence: "Anežka čte knihu.", options: ["Anežka (podmět)", "čte (přísudek)", "knihu (předmět)"], answer: 0, explain: "Podmět: Anežka (Kdo?). Přísudek: čte — co dělá Anežka." },
  { sentence: "Děti si hrají venku.", options: ["hrají (přísudek)", "venku (příslovce)", "Děti (podmět)"], answer: 2, explain: "Podmět: Děti. Přísudek: hrají si — slovese popisuje děj, příslovce venku říká místo." },
  { sentence: "Slunce svítí.", options: ["Slunce (podmět)", "svítí (přísudek)", "oba jsou podmět"], answer: 0, explain: "Podmět: Slunce (Kdo/Co? Slunce). Přísudek: svítí — co Slunce dělá." },
  { sentence: "Kocour spí na křesle.", options: ["Kocour (podmět)", "spí (přísudek)", "křesle (místo)"], answer: 0, explain: "Podmět: Kocour. Přísudek: spí — popisuje děj. 'na křesle' je příslovečné určení místa." },
  { sentence: "Učitel vysvětluje úkol.", options: ["vysvětluje (přísudek)", "úkol (předmět)", "učitel (podmět)"], answer: 2, explain: "Podmět: učitel (Kdo?), přísudek: vysvětluje — co dělá. Úkol je předmět děje." },
  { sentence: "Pták letí vysoko.", options: ["Pták (podmět)", "letí (přísudek)", "vysoko (příslovce)"], answer: 0, explain: "Podmět: Pták. Přísudek: letí — co pták dělá. Vysoko popisuje, jak letí (příslovce)." }
];

let qIndex = 0;
let qScore = 0;

function $(id){return document.getElementById(id)}

function renderQuiz(){
  const q = quizQuestions[qIndex];
  $("quiz-question").textContent = `Věta: ${q.sentence}`;
  const host = $("quiz-answers"); host.innerHTML = "";

    q.options.forEach((opt, i)=>{
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'answer-button'; btn.textContent = opt;
    btn.addEventListener('click', ()=>{
      // prevent double clicks
      if(btn.disabled) return;
      btn.disabled = true;
      const correct = i === q.answer;
      if(correct){ qScore++; btn.classList.add('correct'); }
      else { btn.classList.add('wrong');
        // highlight correct answer
        const correctBtn = Array.from(host.querySelectorAll('.answer-button'))[q.answer];
        if(correctBtn) correctBtn.classList.add('correct');
      }

      // show explanation
      const expl = document.createElement('p');
      expl.className = 'explain-text';
      expl.textContent = q.explain || '';
      $("quiz-helper").textContent = '';
      host.appendChild(expl);

      // next question after short pause so student can read vysvětlení
      setTimeout(()=>{
        qIndex++;
        if(qIndex>=quizQuestions.length){ showQuizResult(); }
        else{ renderQuiz(); }
      },1600);
    });
    host.appendChild(btn);
  });
  $("quiz-progress").textContent = `Otázka ${qIndex+1} z ${quizQuestions.length} — Skóre: ${qScore}`;
}

function showQuizResult(){
  $("quiz-question").textContent = `Hotovo! Správně ${qScore} z ${quizQuestions.length}.`;
  $("quiz-answers").innerHTML = '';
  $("quiz-progress").textContent = '';
}

$("quiz-restart").addEventListener('click', ()=>{ qIndex=0; qScore=0; renderQuiz(); });

// Game: matching subjects to predicates
const pairs = [
  {subject: 'Pes', predicate: 'štěká'},
  {subject: 'Maminka', predicate: 'vaří'},
  {subject: 'Děti', predicate: 'hrají si'},
  {subject: 'Pták', predicate: 'letí'}
];
let selectedSubject = null;
let gameScore = 0;

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} }

function renderGame(){
  gameScore=0; selectedSubject=null;
  const subjectsHost = $("subjects"); const predsHost = $("predicates");
  subjectsHost.innerHTML=''; predsHost.innerHTML='';

  const subjects = pairs.map(p=>p.subject);
  const predicates = pairs.map(p=>p.predicate);
  shuffle(subjects); shuffle(predicates);

  subjects.forEach(s=>{
    const b=document.createElement('button'); b.className='game-item'; b.textContent=s;
    b.addEventListener('click', ()=>{
      selectedSubject = s;
      // highlight
      document.querySelectorAll('#subjects .game-item').forEach(el=>el.classList.toggle('selected', el.textContent===s));
    });
    subjectsHost.appendChild(b);
  });

  predicates.forEach(p=>{
    const b=document.createElement('button'); b.className='game-item'; b.textContent=p;
    b.addEventListener('click', ()=>{
      if(!selectedSubject) return;
      const match = pairs.find(r=>r.subject===selectedSubject && r.predicate===p);
      if(match){ gameScore++; b.classList.add('correct');
        // disable matched subject
        Array.from(document.querySelectorAll('#subjects .game-item')).find(el=>el.textContent===selectedSubject).disabled=true;
      } else { b.classList.add('wrong'); }
      selectedSubject = null;
      document.querySelectorAll('#subjects .game-item').forEach(el=>el.classList.remove('selected'));
      $("game-score").textContent = `Skóre: ${gameScore} / ${pairs.length}`;
    });
    predsHost.appendChild(b);
  });
  $("game-score").textContent = `Skóre: 0 / ${pairs.length}`;
}

$("game-reset").addEventListener('click', ()=>{ renderGame(); });

// init
renderQuiz();
renderGame();
