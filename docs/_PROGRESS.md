# Suivi de progression — /loop documentation + correctifs

Branche : `docs/readme-and-fixes`
Plan source : `/Users/anthonymini/.claude/plans/elegant-plotting-newt.md`

## Médias détectés
- ✅ Vidéo : `screenshots/Simulator Screen Recording - iPhone 17 - 2026-06-19 at 14.52.33.mov` (212s, 1206×2622)
- ⏳ Captures fixes : à extraire de la vidéo (Auth, Liste, Détail, Natif)

## Checklist

- [x] P0 — Branche `docs/readme-and-fixes` + `docs/_PROGRESS.md` + dossier `screenshots/`
- [x] C1 — Bookings persistés en SQLite (+ écran « Mes réservations ») — table bookings + CRUD DatabaseService, BookingViewModel branché, écran bookings.tsx, lien profil. tsc OK, lint 0 err.
- [x] C2 — Config OpenAI unifiée (`EXPO_PUBLIC_OPENAI_API_KEY`) — FloppyAIService sur process.env, plugin react-native-dotenv retiré (babel+dep+lock), .env.example 1 var + avertissement sécurité. tsc OK.
- [x] C3 — Boilerplate inutilisé supprimé : groupe (tabs), modal.tsx, 8 composants template, hook+theme orphelins, assets react-logo. (adv)+AdBanner CONSERVÉS (câblés). tsc OK, 0 ref pendante.
- [x] A1 — `docs/ARCHITECTURE.md` : 3 niveaux C4 (flowchart) + 4 séquences + décisions + arbo. Mermaid validé (pas de C4Context, crochets retirés des participants).
- [x] R1 — `README.md` (FR) réécrit : accroche+badges, 8 captures, vidéo, fonctionnalités, archi+C4 embarqué, choix techniques, démarrage, structure, notes. Balises parasites nettoyées.
- [x] D1 — `docs/DEMO-SCRIPT.md` : chapitrage vidéo + couverture des 7 exigences + addendum CRUD optionnel.
- [x] M1 — 8 captures extraites de la vidéo et câblées dans README + DEMO-SCRIPT ; lien vidéo = placeholder `[LIEN_VIDEO]` (à héberger, .mov trop lourd).
- [x] X1 — Docs consolidées dans `docs/` : NATIVE-FEATURES déplacé, README-VACATION→LEGACY-README (note archive), FLOPPY-AI+CHAT_FEATURE fusionnés en AI-FEATURES (config OpenAI réconciliée). Liens ajoutés au README. Racine = README.md seul.
- [x] V1 — Vérif finale : `tsc --noEmit` exit 0 ; `expo lint` 0 erreur (1 warning pré-existant reviews.tsx) ; 8 blocs Mermaid valides ; 9 sections README présentes ; DoD couverte.

## ✅ TERMINÉ — toutes les tâches cochées. Boucle arrêtée.

### Action manuelle restante (utilisateur)
- Héberger la vidéo `.mov` (Drive/YouTube non répertorié) et remplacer `[LIEN_VIDEO]` dans `README.md` + `docs/DEMO-SCRIPT.md`.
- (Optionnel) Smoke test : `npx expo start` pour valider le démarrage runtime.
- (Optionnel) Ré-enregistrer un court addendum « Mes réservations » (CRUD persistant) — cf. `docs/DEMO-SCRIPT.md`.
- Ouvrir une PR depuis `docs/readme-and-fixes` vers `master` (workflow habituel).

## Journal
- P0 : branche créée, vidéo repérée, 8 captures extraites via ffmpeg.
- P1 : C1 (bookings SQLite + écran Mes réservations), C2 (config OpenAI unifiée), C3 (nettoyage boilerplate). tsc/lint OK à chaque étape.
- P2/P3 : ARCHITECTURE.md (C4+séquences), DEMO-SCRIPT.md, README.md réécrit.
- P4 : docs consolidées dans docs/ (AI-FEATURES fusionné, LEGACY-README archivé).
- P5 : vérif finale OK.
