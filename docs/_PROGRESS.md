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
- [ ] R1 — `README.md` (FR) : lancement, choix techniques, fonctionnalités, captures, vidéo, archi
- [x] D1 — `docs/DEMO-SCRIPT.md` : chapitrage vidéo + couverture des 7 exigences + addendum CRUD optionnel.
- [ ] M1 — Médias câblés (captures extraites de la vidéo + lien vidéo) ou placeholders
- [ ] X1 — Docs existantes consolidées dans `docs/`
- [ ] V1 — Vérif finale : `tsc --noEmit` OK, `expo lint` OK, Mermaid valide, DoD couverte

## Journal
- P0 fait : branche créée, vidéo repérée, planche-contact en cours d'extraction.
