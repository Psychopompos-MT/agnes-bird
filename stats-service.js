const DEFAULT_STATS = Object.freeze({
  views: 0,
  completions: 0,
  likes: 0,
});

function cloneStats(stats = {}) {
  return {
    views: Number(stats.views || 0),
    completions: Number(stats.completions || 0),
    likes: Number(stats.likes || 0),
  };
}

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn("Nepodařilo se načíst data ze storage:", error);
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Nepodařilo se uložit data do storage:", error);
  }
}

function createFlagStore(prefix) {
  const key = `agnes-bird-${prefix}-v1`;
  return {
    read() {
      return readJson(key, {});
    },
    write(value) {
      writeJson(key, value);
    },
  };
}

function createLocalProvider() {
  const key = "agnes-bird-quiz-stats-v1";

  function readAll() {
    return readJson(key, {});
  }

  function writeAll(value) {
    writeJson(key, value);
  }

  function ensureStats(map, quizId) {
    map[quizId] = cloneStats(map[quizId]);
    return map[quizId];
  }

  return {
    mode: "local",
    async getStats(quizId) {
      return cloneStats(readAll()[quizId]);
    },
    async getAllStats(quizIds) {
      const all = readAll();
      return Object.fromEntries(quizIds.map((quizId) => [quizId, cloneStats(all[quizId])]));
    },
    async increment(quizId, field, delta) {
      const all = readAll();
      const stats = ensureStats(all, quizId);
      stats[field] = Math.max(0, Number(stats[field] || 0) + delta);
      writeAll(all);
      return cloneStats(stats);
    },
  };
}

async function createFirebaseProvider(firebaseConfig) {
  const [{ initializeApp, getApps }, { getDatabase, ref, get, runTransaction }] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js"),
  ]);

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const database = getDatabase(app);

  async function getStats(quizId) {
    const snapshot = await get(ref(database, `quizStats/${quizId}`));
    return cloneStats(snapshot.val());
  }

  return {
    mode: "firebase",
    async getStats(quizId) {
      return getStats(quizId);
    },
    async getAllStats(quizIds) {
      const snapshot = await get(ref(database, "quizStats"));
      const all = snapshot.val() || {};
      return Object.fromEntries(quizIds.map((quizId) => [quizId, cloneStats(all[quizId])]));
    },
    async increment(quizId, field, delta) {
      await runTransaction(ref(database, `quizStats/${quizId}/${field}`), (currentValue) => {
        return Math.max(0, Number(currentValue || 0) + delta);
      });
      return getStats(quizId);
    },
  };
}

async function createProvider() {
  const config = window.siteStatsConfig || {};
  const firebaseConfig = config.firebase || {};
  const wantsFirebase = config.provider === "firebase";
  const hasFirebaseConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );

  if (wantsFirebase && hasFirebaseConfig) {
    try {
      return await createFirebaseProvider(firebaseConfig);
    } catch (error) {
      console.warn("Firebase režim se nepodařilo spustit, používám lokální režim.", error);
    }
  }

  return createLocalProvider();
}

async function createQuizStatsService() {
  const provider = await createProvider();
  const viewedStore = createFlagStore("quiz-viewed");
  const completedStore = createFlagStore("quiz-completed");
  const likedStore = createFlagStore("quiz-liked");

  function hasFlag(store, quizId) {
    return Boolean(store.read()[quizId]);
  }

  function setFlag(store, quizId, value) {
    const flags = store.read();
    if (value) {
      flags[quizId] = true;
    } else {
      delete flags[quizId];
    }
    store.write(flags);
  }

  return {
    mode: provider.mode,
    async getStats(quizId) {
      return provider.getStats(quizId);
    },
    async getAllStats(quizIds) {
      return provider.getAllStats(quizIds);
    },
    async recordView(quizId) {
      if (hasFlag(viewedStore, quizId)) {
        return provider.getStats(quizId);
      }

      setFlag(viewedStore, quizId, true);
      return provider.increment(quizId, "views", 1);
    },
    async recordCompletion(quizId) {
      if (hasFlag(completedStore, quizId)) {
        return provider.getStats(quizId);
      }

      setFlag(completedStore, quizId, true);
      return provider.increment(quizId, "completions", 1);
    },
    isLiked(quizId) {
      return hasFlag(likedStore, quizId);
    },
    async toggleLike(quizId) {
      const liked = hasFlag(likedStore, quizId);
      setFlag(likedStore, quizId, !liked);
      const stats = await provider.increment(quizId, "likes", liked ? -1 : 1);
      return {
        liked: !liked,
        stats,
      };
    },
  };
}

window.quizStatsReady = createQuizStatsService()
  .then((service) => {
    window.quizStats = service;
    return service;
  })
  .catch((error) => {
    console.error("Nepodařilo se připravit službu pro počítadla kvízů.", error);
    return null;
  });
