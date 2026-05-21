# Sdílená počítadla pro kvízy

Web teď umí dvě varianty:

- `local` režim: počítadla fungují jen v jednom prohlížeči
- `firebase` režim: počítadla jsou sdílená pro všechny návštěvníky

## Co umí počítadla

U každého kvízu sledují:

- kolikrát byl kvíz otevřen
- kolikrát byl dokončen
- kolik má lajků

Proti opakovanému navyšování z jednoho prohlížeče je ochrana přes `localStorage`:

- otevření se započítá jen jednou na zařízení a prohlížeč
- dokončení se započítá jen jednou na zařízení a prohlížeč
- like jde přepnout zapnout a vypnout

## Zapnutí Firebase režimu

1. Vytvoř projekt ve Firebase.
2. Zapni `Realtime Database`.
3. Ve Firebase Console zkopíruj konfiguraci webové aplikace.
4. Otevři `stats-config.js`.
5. Změň `provider` z `local` na `firebase`.
6. Doplň hodnoty:

```js
window.siteStatsConfig = {
  provider: "firebase",
  firebase: {
    apiKey: "...",
    authDomain: "...",
    databaseURL: "https://...firebasedatabase.app",
    projectId: "...",
    appId: "...",
  },
};
```

## Doporučená pravidla pro Realtime Database

Použij jednoduchá pravidla pro veřejné čtení a zápis jen do větve `quizStats`:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "quizStats": {
      ".read": true,
      "$quizId": {
        ".write": true,
        "views": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "completions": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "likes": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        }
      }
    }
  }
}
```

## Poznámka

GitHub Pages je statický hosting, takže bez externí databáze nejde mít skutečně sdílená počítadla mezi všemi lidmi. Proto je připravený Firebase režim.
