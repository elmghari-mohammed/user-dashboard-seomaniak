# Projet : User Dashboard — Seomaniak 2026

## Stack
- React 18 + Vite
- lucide-react (icônes uniquement)
- CSS Modules

## Commandes
- `npm run dev` → dev server
- `npm run build` → production
- `npm run preview` → vérifier build

## Règles — lire PROD.md avant tout code
Toutes les contraintes de production sont dans @PROD.md.
Lire ce fichier en entier avant de générer ou modifier du code.

## Architecture stricte
- `useUsers.js` → seul fichier avec logique métier + sanitisation
- `UserForm.jsx` → formulaire + validation locale uniquement
- `UserCard.jsx` → affichage + delete, mémoïsé avec React.memo
- `UserList.jsx` → itération + état vide
- `Dashboard.jsx` → composition uniquement

## Commits
Format : `type : description en français`
Types : init, feat, fix, style, refacto, perf, chore

## Icônes
lucide-react exclusivement — jamais d'emojis