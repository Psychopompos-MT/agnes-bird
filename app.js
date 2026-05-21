const quizCatalog = [
  {
    id: "prvouka",
    icon: "🌿",
    title: "Prvouka",
    description: "Příroda, člověk, bezpečí i svět kolem nás pro 3. třídu.",
    detail: "3 možnosti, 50 otázek",
    path: "prvouka.html",
  },
  {
    id: "matematika",
    icon: "➕",
    title: "Matematika",
    description: "Počítání, násobilka, slovní úlohy a trocha přemýšlení.",
    detail: "3 možnosti, 50 otázek",
    path: "matematika.html",
  },
  {
    id: "cestina",
    icon: "📚",
    title: "Čeština",
    description: "Slova, věty, slovní druhy i jednoduchá gramatika.",
    detail: "3 možnosti, 50 otázek",
    path: "cestina.html",
  },
  {
    id: "vyjmenovana-slova",
    icon: "✏️",
    title: "Vyjmenovaná slova",
    description: "Doplňování i/y ve slovech od lehkých po těžší.",
    detail: "3 možnosti, 50 otázek",
    path: "vyjmenovana-slova.html",
  },
  {
    id: "anglictina",
    icon: "🇬🇧",
    title: "Angličtina",
    description: "Uvidíš české slovo a napíšeš anglický překlad.",
    detail: "Textbox, 50 otázek",
    path: "anglictina.html",
  },
];

const quizCatalogById = Object.fromEntries(quizCatalog.map((quiz) => [quiz.id, quiz]));

const numberFormatter = new Intl.NumberFormat("cs-CZ");
const EMPTY_STATS = { views: 0, completions: 0, likes: 0 };

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

function formatCount(value) {
  return numberFormatter.format(Number(value || 0));
}

function getStatsService() {
  if (window.quizStatsReady) {
    return window.quizStatsReady;
  }

  return new Promise((resolve) => {
    let tries = 0;
    const maxTries = 80;
    const interval = window.setInterval(() => {
      if (window.quizStatsReady) {
        window.clearInterval(interval);
        window.quizStatsReady.then(resolve);
        return;
      }

      tries += 1;
      if (tries >= maxTries) {
        window.clearInterval(interval);
        resolve(null);
      }
    }, 50);
  });
}

function renderStatsSummary(stats) {
  return `
    <span class="stat-pill"><strong>Otevření:</strong> ${formatCount(stats.views)}</span>
    <span class="stat-pill"><strong>Dokončeno:</strong> ${formatCount(stats.completions)}</span>
    <span class="stat-pill"><strong>Lajky:</strong> ${formatCount(stats.likes)}</span>
  `;
}

function createQuizStatsPanel(quizId) {
  const stage = document.getElementById("quiz-app");
  if (!stage) {
    return null;
  }

  const panel = document.createElement("section");
  panel.className = "community-card";
  panel.innerHTML = `
    <div class="community-copy">
      <p class="eyebrow">Oblíbenost kvízu</p>
      <h2>Kdo už si kvíz zkusil</h2>
      <div class="community-stats" id="community-stats">
        ${renderStatsSummary({ views: 0, completions: 0, likes: 0 })}
      </div>
      <p class="community-note" id="community-note"></p>
    </div>
    <button class="button button-secondary like-button" id="like-button" type="button">
      <span id="like-button-label">Přidat like</span>
    </button>
  `;

  stage.prepend(panel);

  return {
    quizId,
    statsHost: panel.querySelector("#community-stats"),
    note: panel.querySelector("#community-note"),
    likeButton: panel.querySelector("#like-button"),
    likeLabel: panel.querySelector("#like-button-label"),
  };
}

function updateQuizStatsPanel(panel, stats, liked, mode) {
  if (!panel) {
    return;
  }

  panel.statsHost.innerHTML = renderStatsSummary(stats);
  panel.likeButton.classList.toggle("is-liked", liked);
  panel.likeLabel.textContent = liked ? "Už se mi líbí" : "Přidat like";
  panel.note.textContent = mode === "firebase"
    ? "Počítadlo je sdílené pro všechny návštěvníky."
    : "Zatím běží lokální režim v tomto prohlížeči. Pro sdílené počítadlo propoj Firebase.";
}

function getQuizUrl(quiz) {
  if (typeof window === "undefined") {
    return `https://psychopompos-mt.github.io/agnes-bird/${quiz.path}`;
  }

  const existingCanonical = document.getElementById("canonical-link")?.getAttribute("href");
  if (existingCanonical && !window.location.search) {
    return existingCanonical;
  }

  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return new URL(quiz.path, window.location.origin + window.location.pathname.replace(/[^/]*$/, "")).toString();
  }

  return quiz.path;
}

async function renderQuizList() {
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
        <div class="card-stats" data-quiz-card-stats="${quiz.id}">
          ${renderStatsSummary({ views: 0, completions: 0, likes: 0 })}
        </div>
        <a class="button button-primary" href="${quiz.path}">Spustit kvíz</a>
      </article>
    `)
    .join("");

  const statsService = await getStatsService();
  if (!statsService) {
    return;
  }

  const allStats = await statsService.getAllStats(quizCatalog.map((quiz) => quiz.id));
  const note = document.createElement("p");
  note.className = "stats-mode-note";
  note.textContent = statsService.mode === "firebase"
    ? "Počítadla jsou sdílená pro všechny návštěvníky."
    : "Počítadla teď běží v lokálním režimu v tomto prohlížeči.";
  host.before(note);

  document.querySelectorAll("[data-quiz-card-stats]").forEach((element) => {
    const quizId = element.getAttribute("data-quiz-card-stats");
    element.innerHTML = renderStatsSummary(allStats[quizId] || EMPTY_STATS);
  });
}

async function startQuizPage() {
  const quizTitle = document.getElementById("quiz-title");
  if (!quizTitle) {
    return;
  }

  const bodyQuizId = document.body.dataset.quizId;
  const params = new URLSearchParams(window.location.search);
  const queryQuizId = params.get("quiz");
  const quizId = bodyQuizId || queryQuizId;
  const quiz = window.quizData?.[quizId];

  if (!bodyQuizId && queryQuizId && quizCatalogById[queryQuizId]) {
    window.location.replace(quizCatalogById[queryQuizId].path);
    return;
  }

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
  const quizUrl = getQuizUrl(quizCatalogById[quizId]);
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
  const statsPanel = createQuizStatsPanel(quizId);
  const statsService = await getStatsService();
  let completionSaved = false;

  let currentIndex = 0;
  let score = 0;
  let lock = false;
  let feedbackTimer = null;

  if (statsPanel && statsService) {
    const firstStats = await statsService.recordView(quizId);
    updateQuizStatsPanel(statsPanel, firstStats, statsService.isLiked(quizId), statsService.mode);
    statsPanel.likeButton.addEventListener("click", async () => {
      statsPanel.likeButton.disabled = true;
      const result = await statsService.toggleLike(quizId);
      updateQuizStatsPanel(statsPanel, result.stats, result.liked, statsService.mode);
      statsPanel.likeButton.disabled = false;
    });
  }

  function showFeedback(isCorrect) {
    feedbackBurst.className = `feedback-burst visible ${isCorrect ? "correct" : "wrong"}`;
    feedbackFace.textContent = isCorrect ? "😄" : "🙂";
    feedbackMessage.textContent = isCorrect ? "Správně, jen tak dál!" : "Nevadí, další otázku zvládneš.";

    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => {
      feedbackBurst.className = "feedback-burst";
    }, 950);
  }

  async function finishQuiz() {
    questionCard.classList.add("hidden");
    resultCard.classList.remove("hidden");

    const total = quiz.questions.length;
    const percent = Math.round((score / total) * 100);

    if (!completionSaved && statsService) {
      completionSaved = true;
      const completionStats = await statsService.recordCompletion(quizId);
      updateQuizStatsPanel(statsPanel, completionStats, statsService.isLiked(quizId), statsService.mode);
    }

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
