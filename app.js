const quizCatalog = [
  {
    id: "prvouka",
    icon: "🌿",
    title: "Prvouka",
    description: "Příroda, člověk, bezpečí i svět kolem nás pro 3. třídu.",
    detail: "3 možnosti, 50 otázek",
  },
  {
    id: "matematika",
    icon: "➕",
    title: "Matematika",
    description: "Počítání, násobilka, slovní úlohy a trocha přemýšlení.",
    detail: "3 možnosti, 50 otázek",
  },
  {
    id: "cestina",
    icon: "📚",
    title: "Čeština",
    description: "Slova, věty, slovní druhy i jednoduchá gramatika.",
    detail: "3 možnosti, 50 otázek",
  },
  {
    id: "vyjmenovana-slova",
    icon: "✏️",
    title: "Vyjmenovaná slova",
    description: "Doplňování i/y ve slovech od lehkých po těžší.",
    detail: "3 možnosti, 50 otázek",
  },
  {
    id: "anglictina",
    icon: "🇬🇧",
    title: "Angličtina",
    description: "Uvidíš české slovo a napíšeš anglický překlad.",
    detail: "Textbox, 50 otázek",
  },
];

function difficultyLabel(index, total) {
  const part = (index + 1) / total;
  if (part <= 0.34) {
    return "Lehký start";
  }
  if (part <= 0.68) {
    return "Střední výzva";
  }
  return "Těžší finále";
}

function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function updateMetaContent(id, content) {
  const element = document.getElementById(id);
  if (element) {
    element.setAttribute("content", content);
  }
}

function renderQuizList() {
  const host = document.getElementById("quiz-list");
  if (!host) {
    return;
  }

  host.innerHTML = quizCatalog
    .map((quiz) => `
      <article class="quiz-card">
        <div class="quiz-meta">
          <span class="meta-pill">${quiz.icon} ${quiz.title}</span>
          <span class="meta-pill">${quiz.detail}</span>
        </div>
        <div>
          <h2>${quiz.title}</h2>
          <p>${quiz.description}</p>
        </div>
        <a class="button button-primary" href="quiz.html?quiz=${quiz.id}">Spustit kvíz</a>
      </article>
    `)
    .join("");
}

function startQuizPage() {
  const quizTitle = document.getElementById("quiz-title");
  if (!quizTitle) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const quizId = params.get("quiz");
  const quiz = window.quizData?.[quizId];

  if (!quiz) {
    quizTitle.textContent = "Kvíz se nenašel";
    document.getElementById("quiz-description").textContent = "Vrať se na seznam kvízů a vyber si jiné téma.";
    document.getElementById("quiz-app").innerHTML = `
      <article class="question-card">
        <h2>Ups, tady nic není.</h2>
        <p>Možná se změnil odkaz. Zkus si vybrat kvíz znovu.</p>
        <a class="button button-primary" href="kvizy.html">Zpět na kvízy</a>
      </article>
    `;
    return;
  }

  document.title = `${quiz.title} | Anežčin blog`;
  const quizUrl = `https://psychopompos-mt.github.io/agnes-bird/quiz.html?quiz=${quizId}`;
  const quizDescription = `${quiz.description} Vyzkoušej si 50 otázek pro 3. třídu.`;
  updateMetaContent("meta-description", quizDescription);
  updateMetaContent("og-title", `${quiz.title} | Anežčin blog`);
  updateMetaContent("og-description", quizDescription);
  updateMetaContent("og-url", quizUrl);
  updateMetaContent("twitter-title", `${quiz.title} | Anežčin blog`);
  updateMetaContent("twitter-description", quizDescription);
  const canonicalLink = document.getElementById("canonical-link");
  if (canonicalLink) {
    canonicalLink.setAttribute("href", quizUrl);
  }
  document.getElementById("quiz-subtitle").textContent = quiz.subtitle;
  document.getElementById("quiz-title").textContent = quiz.title;
  document.getElementById("quiz-description").textContent = quiz.description;

  const progressText = document.getElementById("progress-text");
  const scoreText = document.getElementById("score-text");
  const progressFill = document.getElementById("progress-fill");
  const questionCard = document.getElementById("question-card");
  const questionText = document.getElementById("question-text");
  const answerArea = document.getElementById("answer-area");
  const helperText = document.getElementById("helper-text");
  const difficultyChip = document.getElementById("difficulty-chip");
  const resultCard = document.getElementById("result-card");
  const resultTitle = document.getElementById("result-title");
  const resultScore = document.getElementById("result-score");
  const resultMessage = document.getElementById("result-message");
  const restartButton = document.getElementById("restart-button");
  const feedbackBurst = document.getElementById("feedback-burst");
  const feedbackFace = document.getElementById("feedback-face");
  const feedbackMessage = document.getElementById("feedback-message");

  let currentIndex = 0;
  let score = 0;
  let lock = false;
  let feedbackTimer = null;

  function showFeedback(isCorrect) {
    feedbackBurst.className = `feedback-burst visible ${isCorrect ? "correct" : "wrong"}`;
    feedbackFace.textContent = isCorrect ? "😄" : "🙂";
    feedbackMessage.textContent = isCorrect ? "Správně, jen tak dál!" : "Nevadí, další otázku zvládneš.";

    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => {
      feedbackBurst.className = "feedback-burst";
    }, 950);
  }

  function finishQuiz() {
    questionCard.classList.add("hidden");
    resultCard.classList.remove("hidden");

    const total = quiz.questions.length;
    const percent = Math.round((score / total) * 100);

    resultTitle.textContent = `Máš hotovo: ${quiz.title}`;
    resultScore.textContent = `Správně ${score} z ${total} otázek (${percent} %).`;

    if (percent >= 90) {
      resultMessage.textContent = "Paráda, tohle byl opravdu skvělý výkon.";
    } else if (percent >= 70) {
      resultMessage.textContent = "Moc pěkné. Je vidět, že tomu dobře rozumíš.";
    } else if (percent >= 50) {
      resultMessage.textContent = "Dobrá práce. Pár těžších otázek můžeš ještě potrénovat.";
    } else {
      resultMessage.textContent = "Nevadí. Kvíz si můžeš zkusit znovu a příště to bude ještě lepší.";
    }

    progressText.textContent = `Dokončeno ${total} z ${total}`;
    scoreText.textContent = `Skóre: ${score}`;
    progressFill.style.width = "100%";
  }

  function updateProgress() {
    const total = quiz.questions.length;
    const questionNumber = currentIndex + 1;
    progressText.textContent = `Otázka ${questionNumber} z ${total}`;
    scoreText.textContent = `Skóre: ${score}`;
    progressFill.style.width = `${(currentIndex / total) * 100}%`;
    difficultyChip.textContent = difficultyLabel(currentIndex, total);
  }

  function goNextQuestion() {
    currentIndex += 1;
    lock = false;

    if (currentIndex >= quiz.questions.length) {
      finishQuiz();
      return;
    }

    renderQuestion();
  }

  function handleChoiceAnswer(button, isCorrect, correctButton) {
    if (lock) {
      return;
    }

    lock = true;

    if (isCorrect) {
      score += 1;
      button.classList.add("correct");
    } else {
      button.classList.add("wrong");
      if (correctButton) {
        correctButton.classList.add("correct");
      }
    }

    scoreText.textContent = `Skóre: ${score}`;
    showFeedback(isCorrect);
    window.setTimeout(goNextQuestion, 1100);
  }

  function renderChoiceQuestion(question) {
    helperText.textContent = "Vyber jednu správnou odpověď.";

    const buttons = question.options.map((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-button";
      button.textContent = option;
      answerArea.appendChild(button);
      return { button, index };
    });

    buttons.forEach(({ button, index }) => {
      button.addEventListener("click", () => {
        const correctButton = buttons.find((item) => item.index === question.answer)?.button;
        handleChoiceAnswer(button, index === question.answer, correctButton);
      });
    });
  }

  function renderTextQuestion(question) {
    helperText.textContent = "Napiš anglické slovo a potvrď odpověď.";

    const form = document.createElement("form");
    form.className = "text-answer-form";

    const input = document.createElement("input");
    input.type = "text";
    input.name = "answer";
    input.placeholder = "Sem napiš anglické slovo";
    input.autocomplete = "off";
    input.required = true;

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "button button-primary";
    submit.textContent = "Potvrdit odpověď";

    form.append(input, submit);
    answerArea.appendChild(form);
    input.focus();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (lock) {
        return;
      }

      lock = true;
      const value = normalizeAnswer(input.value);
      const isCorrect = question.answers.some((answer) => normalizeAnswer(answer) === value);

      if (isCorrect) {
        score += 1;
        input.style.borderColor = "rgba(17, 111, 89, 0.45)";
      } else {
        input.style.borderColor = "rgba(170, 52, 79, 0.45)";
        const note = document.createElement("p");
        note.className = "helper-text";
        note.textContent = `Správná odpověď je: ${question.answers[0]}.`;
        answerArea.appendChild(note);
      }

      scoreText.textContent = `Skóre: ${score}`;
      showFeedback(isCorrect);
      window.setTimeout(goNextQuestion, 1300);
    });
  }

  function renderQuestion() {
    updateProgress();
    answerArea.innerHTML = "";

    const question = quiz.questions[currentIndex];
    questionText.textContent = question.question;

    if (quiz.type === "text") {
      renderTextQuestion(question);
    } else {
      renderChoiceQuestion(question);
    }
  }

  restartButton.addEventListener("click", () => {
    currentIndex = 0;
    score = 0;
    lock = false;
    resultCard.classList.add("hidden");
    questionCard.classList.remove("hidden");
    renderQuestion();
  });

  renderQuestion();
}

renderQuizList();
startQuizPage();
