# Anežčin blog a školní kvízy

Statický web připravený pro GitHub Pages.

Web obsahuje:

- úvodní stránku `O mně` s fotografií a představením Anežky
- stránku se seznamem kvízů
- 5 školních kvízů pro 3. třídu
- průběžné skóre, animace po odpovědi a závěrečné vyhodnocení

## Kvízy

1. Prvouka
2. Matematika
3. Čeština
4. Vyjmenovaná slova
5. Angličtina

Každý kvíz má 50 otázek. První 4 kvízy mají výběr ze 3 možností, angličtina používá textové pole.

## Soubory

- `index.html` - hlavní stránka O mně
- `kvizy.html` - seznam všech kvízů
- `quiz.html` - stránka pro spuštění konkrétního kvízu
- `styles.css` - vzhled webu
- `app.js` - logika webu a kvízů
- `quiz-data.js` - všechna data otázek
- `Photos/AgnesPhoto.jpg` - profilová fotografie

## Spuštění lokálně

Stačí otevřít soubor `index.html` v prohlížeči.

## Nasazení na GitHub Pages

1. Nahraj obsah této složky do GitHub repozitáře.
2. Na GitHubu otevři `Settings`.
3. V levém menu vyber `Pages`.
4. U `Build and deployment` zvol `Deploy from a branch`.
5. Vyber hlavní branch a složku `/ (root)`.
6. Ulož nastavení.

Po chvíli bude web dostupný na adrese GitHub Pages pro daný repozitář.
