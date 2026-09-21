// Každá otázka se ptá VÝHRADNĚ na podmět, nebo VÝHRADNĚ na přísudek — možnosti
// jsou jen samotná slova/výrazy z věty (bez prozrazující nálepky typu "(podmět)"),
// takže má vždy přesně jednu správnou odpověď.
const quizQuestions = [
  { sentence: "Pes hlasitě štěká na listonoše.", type: "podmet", correct: "Pes", distractors: ["štěká", "na listonoše"], explain: "Podmět (Kdo? Co?): Pes. Přísudek (co dělá?): štěká. „na listonoše“ je příslovečné určení." },
  { sentence: "Maminka nám dnes uvaří chutnou večeři.", type: "prisudek", correct: "uvaří", distractors: ["Maminka", "chutnou večeři"], explain: "Přísudek: uvaří — co maminka udělá. Podmět: Maminka. „chutnou večeři“ je předmět." },
  { sentence: "Na zahradě si hrají dvě malé děti.", type: "podmet", correct: "dvě malé děti", distractors: ["si hrají", "Na zahradě"], explain: "I když sloveso stojí na začátku věty, podmětem zůstává dvě malé děti (Kdo si hraje?). Přísudek: si hrají." },
  { sentence: "Tomáš a Klára stavěli na pláži velký písečný hrad.", type: "podmet", correct: "Tomáš a Klára", distractors: ["stavěli", "velký písečný hrad"], explain: "Podmět bývá i víceslovný, spojený spojkou a: Tomáš a Klára. Přísudek: stavěli." },
  { sentence: "Dědeček bude vyprávět dětem napínavou pohádku.", type: "prisudek", correct: "bude vyprávět", distractors: ["Dědeček", "napínavou pohádku"], explain: "Budoucí čas tvoří dvouslovný přísudek: bude vyprávět. Podmět: Dědeček." },
  { sentence: "Žáci musí odevzdat domácí úkol do pátku.", type: "prisudek", correct: "musí odevzdat", distractors: ["Žáci", "domácí úkol"], explain: "Způsobové sloveso + infinitiv tvoří přísudek: musí odevzdat. Podmět: Žáci." },
  { sentence: "Za starým lesem se schovává malá chaloupka.", type: "podmet", correct: "malá chaloupka", distractors: ["se schovává", "Za starým lesem"], explain: "Podmět: malá chaloupka (Co se schovává?). Přísudek: se schovává." },
  { sentence: "V zimě padá studený bílý sníh.", type: "podmet", correct: "studený bílý sníh", distractors: ["padá", "V zimě"], explain: "Podmět: studený bílý sníh (Co padá?). Přísudek: padá." },
  { sentence: "Kluci celé odpoledne běhali a skákali na hřišti.", type: "prisudek", correct: "běhali a skákali", distractors: ["Kluci", "na hřišti"], explain: "Přísudek může být i dvojnásobný, spojený spojkou a: běhali a skákali. Podmět: Kluci." },
  { sentence: "Moje nejlepší kamarádka mi včera napsala dlouhý dopis.", type: "podmet", correct: "Moje nejlepší kamarádka", distractors: ["napsala", "dlouhý dopis"], explain: "Podmět: Moje nejlepší kamarádka (Kdo napsala?). Přísudek: napsala." },
  { sentence: "Kdo zaklepal na dveře?", type: "podmet", correct: "Kdo", distractors: ["zaklepal", "na dveře"], explain: "I tázací zájmeno Kdo může být podmětem — ptáme se jím přímo. Přísudek: zaklepal." },
  { sentence: "Housenka se promění za pár týdnů v pestrobarevného motýla.", type: "prisudek", correct: "se promění", distractors: ["Housenka", "v pestrobarevného motýla"], explain: "Zvratné sloveso se promění je přísudek. Podmět: Housenka." },
  { sentence: "Naši noví sousedé stěhují nábytek do nového bytu.", type: "podmet", correct: "Naši noví sousedé", distractors: ["stěhují", "do nového bytu"], explain: "Podmět: Naši noví sousedé (Kdo stěhuje?). Přísudek: stěhují." },
  { sentence: "Na vrcholu vysoké hory stál osamělý strom.", type: "podmet", correct: "osamělý strom", distractors: ["stál", "Na vrcholu vysoké hory"], explain: "Podmět: osamělý strom (Co stálo?). Přísudek: stál." },
  { sentence: "Babička a dědeček nám každé léto vyprávějí staré příběhy.", type: "prisudek", correct: "vyprávějí", distractors: ["Babička a dědeček", "staré příběhy"], explain: "Přísudek: vyprávějí — co dělají babička a dědeček. Podmět: Babička a dědeček." }
];

let qIndex = 0;
let qScore = 0;
let quizOrder = [];
let currentOptions = [];
let currentCorrectIndex = -1;

function $(id){return document.getElementById(id)}

function renderQuiz(){
  const q = quizOrder[qIndex];
  const askingSubject = q.type === "podmet";
  $("quiz-question").textContent = `${askingSubject ? "Najdi PODMĚT" : "Najdi PŘÍSUDEK"} ve větě: „${q.sentence}“`;
  $("quiz-helper").textContent = askingSubject ? "Nápověda: ptej se Kdo? nebo Co?" : "Nápověda: ptej se, co podmět dělá.";
  const host = $("quiz-answers"); host.innerHTML = "";

  currentOptions = [q.correct, ...q.distractors];
  shuffle(currentOptions);
  currentCorrectIndex = currentOptions.indexOf(q.correct);

  currentOptions.forEach((opt, i)=>{
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'answer-button'; btn.textContent = opt;
    btn.addEventListener('click', ()=>{
      // prevent double clicks
      if(btn.disabled) return;
      btn.disabled = true;
      const correct = i === currentCorrectIndex;
      if(correct){ qScore++; btn.classList.add('correct'); }
      else { btn.classList.add('wrong');
        // highlight correct answer
        const correctBtn = Array.from(host.querySelectorAll('.answer-button'))[currentCorrectIndex];
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
        if(qIndex>=quizOrder.length){ showQuizResult(); }
        else{ renderQuiz(); }
      },1600);
    });
    host.appendChild(btn);
  });
  $("quiz-progress").textContent = `Otázka ${qIndex+1} z ${quizOrder.length} — Skóre: ${qScore}`;
}

function showQuizResult(){
  $("quiz-question").textContent = `Hotovo! Správně ${qScore} z ${quizOrder.length}.`;
  $("quiz-answers").innerHTML = '';
  $("quiz-helper").textContent = '';
  $("quiz-progress").textContent = '';
}

function startQuiz(){
  quizOrder = quizQuestions.slice();
  shuffle(quizOrder);
  qIndex = 0; qScore = 0;
  renderQuiz();
}

$("quiz-restart").addEventListener('click', startQuiz);

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
startQuiz();
renderGame();
