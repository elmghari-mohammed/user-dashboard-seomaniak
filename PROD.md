# PROD.md — User Dashboard · React · Seomaniak 2026

> Règles de production applicables **immédiatement** sur toute l'architecture.  
> Chaque section est une contrainte ferme, non une suggestion.

---

## 1. Architecture cible (Single Responsibility stricte)

```
src/
├── components/
│   ├── UserForm.jsx        # SEUL responsable : formulaire + validation locale
│   ├── UserCard.jsx        # SEUL responsable : affichage d'un user + action delete
│   └── UserList.jsx        # SEUL responsable : rendu itératif de UserCard[]
├── hooks/
│   └── useUsers.js         # SEUL responsable : état users[], addUser(), deleteUser()
├── pages/
│   └── Dashboard.jsx       # SEUL responsable : composition + layout de page
├── App.jsx                 # Entrée unique de l'application
└── main.jsx                # Bootstrap React — StrictMode activé
```

### Règle fondamentale

Un fichier = une responsabilité. Si en lisant un composant tu te poses deux questions différentes sur ce qu'il fait → c'est qu'il fait trop. Découpé.

| Fichier | Ce qu'il fait | Ce qu'il ne fait PAS |
|---|---|---|
| `UserForm.jsx` | Formulaire, validation, reset | Jamais de `useUsers` importé ici |
| `UserCard.jsx` | Afficher un user, bouton delete | Jamais de state global |
| `UserList.jsx` | Itérer sur `users[]`, gérer état vide | Jamais de logique métier |
| `useUsers.js` | State + add + delete + sanitisation | Jamais de JSX |
| `Dashboard.jsx` | Coller les pièces ensemble | Jamais de logique métier directe |

---

## 2. Stack technique

| Outil | Rôle |
|---|---|
| **Vite** | Bundler + dev server (HMR natif, build optimisé) |
| **React 18** | UI library |
| **lucide-react** | Icônes professionnelles (tree-shakeable) |
| **CSS Modules** | Styles scopés par composant, zéro collision |

### Initialisation dans le dossier courant

```bash
npm create vite@latest . -- --template react
# → choisir "Ignore files and continue" (conserve PROD.md)

npm install
npm install lucide-react
```

### Commandes quotidiennes

```bash
npm run dev      # lance le dev server avec HMR
npm run build    # compile pour la production → dist/
npm run preview  # vérifie le build localement avant livraison
```

> `dist/` est ignoré par Git (`.gitignore` Vite par défaut). Ne jamais commiter ce dossier.

---

## 3. Clean Code — Écrire du code comme un humain

L'objectif : un développeur qui lit le code doit comprendre **ce qu'il fait** sans jamais avoir à deviner.

### 3.1 Nommage — la règle du nom qui parle

```js
// ❌ Mauvais — on ne sait pas ce que c'est
const d = users.filter(u => u.id !== id);
const x = (v) => v.trim().slice(0, 50);

// ✅ Bon — le nom dit tout
const usersApresSupression = users.filter(u => u.id !== idASupprimer);
const nettoyerTexte = (valeur) => valeur.trim().slice(0, 50);
```

| Contexte | Convention | Exemple |
|---|---|---|
| Variables et fonctions | `camelCase` | `addUser`, `isFormValid` |
| Composants React | `PascalCase` | `UserCard`, `UserForm` |
| Constantes fixes | `SCREAMING_SNAKE` | `MAX_NAME_LENGTH = 50` |
| Fichiers composants | `PascalCase.jsx` | `UserCard.jsx` |
| Fichiers hooks | `camelCase.js` | `useUsers.js` |

### 3.2 Fonctions courtes avec une seule intention

```js
// ❌ Mauvais — une fonction qui fait 3 choses à la fois
const handleSubmit = () => {
  const name = form.name.trim();
  if (!name || name.length < 2) { setError('...'); return; }
  const id = crypto.randomUUID();
  setUsers(prev => [...prev, { id, name, email: form.email }]);
  setForm({ name: '', email: '' });
  setError('');
};

// ✅ Bon — chaque fonction fait une chose
const isNomValide = (nom) => /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(nom);

const construireUser = (nom, email) => ({
  id: crypto.randomUUID(),
  name: nom,
  email: email,
});

const handleSubmit = () => {
  if (!isNomValide(form.name)) { setError('Nom invalide'); return; }
  onAdd(construireUser(form.name, form.email));
  resetForm();
};
```

### 3.3 Guard clauses — sortir tôt, ne pas imbriquer

```js
// ❌ Mauvais — imbrication difficile à lire
const addUser = (rawUser) => {
  if (rawUser.name) {
    if (rawUser.email) {
      setUsers(prev => [...prev, rawUser]);
    }
  }
};

// ✅ Bon — on sort si les conditions ne sont pas remplies
const addUser = (rawUser) => {
  if (!rawUser.name) return;
  if (!rawUser.email) return;
  setUsers(prev => [...prev, rawUser]);
};
```

### 3.4 Commentaires utiles — expliquer le POURQUOI, pas le QUOI

```js
// ❌ Inutile — le code dit déjà ça
// On filtre les users pour supprimer celui avec l'id correspondant
const nouveauxUsers = users.filter(u => u.id !== id);

// ✅ Utile — explique pourquoi on fait ce choix
// crypto.randomUUID() est utilisé à la place de Math.random()
// car Math.random() peut produire des collisions sur de grands volumes
const id = crypto.randomUUID();
```

**Règle** : zéro `console.log`, zéro code commenté, zéro `TODO` non résolu en production.

### 3.5 Longueur maximale

- Composant : **60 lignes** — au-delà, extraire un sous-composant
- Fonction : **20 lignes** — au-delà, la découper
- Fichier : **100 lignes** — au-delà, revoir la responsabilité

### 3.6 Ordre des imports (toujours respecté)

```js
// 1. React et bibliothèques externes
import { useState, useCallback, memo } from 'react';
import { Trash2, Mail, User } from 'lucide-react';

// 2. Composants internes
import UserCard from './UserCard';

// 3. Hooks internes
import { useUsers } from '../hooks/useUsers';

// 4. Styles
import styles from './UserList.module.css';
```

---

## 4. Sécurité — Surfaces d'attaque à couvrir

### 4.1 XSS — jamais de HTML brut dans le DOM

- **Interdit** : `dangerouslySetInnerHTML` — sans exception.
- Tout texte venant d'un input est nettoyé avant d'entrer dans le state.
- La sanitisation vit dans `useUsers.js` comme fonction privée du hook.

```js
// Fonction privée dans useUsers.js — pas exportée
const nettoyerInput = (valeur, longueurMax = 100) =>
  String(valeur)
    .replace(/<[^>]*>/g, '')      // supprime les balises HTML
    .replace(/[<>"'`]/g, '')      // supprime les caractères dangereux
    .trim()
    .slice(0, longueurMax);
```

### 4.2 Validation dans UserForm

Regex définis comme constantes locales en tête de fichier, pas en dur dans le JSX.

```js
// Constantes locales — en haut de UserForm.jsx
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_NOM   = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;

const isEmailValide = (email) => REGEX_EMAIL.test(email);
const isNomValide   = (nom)   => REGEX_NOM.test(nom);
```

Validation déclenchée sur `onBlur` — message d'erreur affiché sous le champ concerné.  
`onAdd()` n'est **jamais appelé** si l'un des champs est invalide.

### 4.3 State poisoning — défense dans le hook

```js
// hooks/useUsers.js
const addUser = (rawUser) => {
  const name  = nettoyerInput(rawUser.name,  50);
  const email = nettoyerInput(rawUser.email, 100);

  // Double guard : si les données arrivent corrompues malgré la validation du form
  if (!name || !email) return;

  setUsers(prev => [...prev, {
    id: crypto.randomUUID(),  // jamais Math.random()
    name,
    email,
  }]);
};
```

---

## 5. Performance — Méthodes interdites et alternatives

### 5.1 Ce qu'on n'utilise pas et pourquoi

| Méthode / Pattern | Pourquoi ça casse la perf | Ce qu'on fait à la place |
|---|---|---|
| `onClick={() => fn(id)}` dans JSX | Crée une nouvelle fonction à chaque render | `useCallback` dans le composant parent |
| Index de tableau comme `key` | React ne détecte pas les suppressions/réordres | `user.id` (UUID stable) comme `key` |
| `useState` pour une valeur calculée | Re-render inutile à chaque changement | `useMemo` ou calcul direct dans le rendu |
| `useEffect` pour dériver du state | Anti-pattern React 18, double render | Calcul direct sans effet |
| `Array.find` + `Array.filter` séparés | Deux parcours complets du tableau | Un seul parcours avec `reduce` ou `filter` unique |
| `{...props}` spread non contrôlé | Passe des props inattendus, re-renders cachés | Destructuration explicite des props |
| Composant réécrit à chaque render parent | Re-render en cascade sans raison | `React.memo` sur les composants feuilles |

### 5.2 Optimisations obligatoires dans ce projet

```jsx
// Dashboard.jsx — stabiliser les callbacks avant de les passer en props
const handleAdd    = useCallback((rawUser) => addUser(rawUser),   [addUser]);
const handleDelete = useCallback((id)      => deleteUser(id),     [deleteUser]);
```

```jsx
// UserCard.jsx — mémoïser la carte : elle ne re-rend que si ses props changent
const UserCard = memo(({ user, onDelete }) => {
  // ...
});
export default UserCard;
```

```jsx
// Mauvais — nouvelle fonction à chaque render de UserList
<UserCard onDelete={() => handleDelete(user.id)} />

// Bon — référence stable, UserCard ne re-rend pas inutilement
<UserCard onDelete={handleDelete} />
// Dans UserCard : onDelete(user.id) au clic
```

---

## 6. UI/UX — Dashboard professionnel

### 6.1 Icônes — lucide-react uniquement

Toutes les icônes viennent de `lucide-react`. Jamais d'emojis, jamais d'unicode brut.

| Élément UI | Icône | Import |
|---|---|---|
| Header du dashboard | `LayoutDashboard` | `import { LayoutDashboard } from 'lucide-react'` |
| Compteur d'utilisateurs | `Users` | `import { Users } from 'lucide-react'` |
| Champ Nom dans le form | `User` | `import { User } from 'lucide-react'` |
| Champ Email dans le form | `Mail` | `import { Mail } from 'lucide-react'` |
| Bouton ajouter | `UserPlus` | `import { UserPlus } from 'lucide-react'` |
| Bouton supprimer | `Trash2` | `import { Trash2 } from 'lucide-react'` |
| État vide (0 users) | `UserX` | `import { UserX } from 'lucide-react'` |

Tailles standardisées :
- `size={16}` → icône dans un label ou badge
- `size={20}` → icône dans un bouton
- `size={24}` → icône dans un header de section
- `size={48}` → illustration d'état vide

### 6.2 Palette — CSS Variables (index.css)

```css
:root {
  /* Fond */
  --color-bg:          #0f1117;   /* fond de page */
  --color-surface:     #1a1d27;   /* cartes, panels, form */
  --color-surface-2:   #222536;   /* hover sur surface */
  --color-border:      #2a2d3e;   /* bordures subtiles */

  /* Accent — action primaire */
  --color-accent:      #6366f1;   /* indigo */
  --color-accent-h:    #818cf8;   /* hover */
  --color-accent-soft: #6366f118; /* fond léger accent */

  /* Danger — suppression */
  --color-danger:      #ef4444;
  --color-danger-h:    #f87171;
  --color-danger-soft: #ef444418;

  /* Succès */
  --color-success:     #22c55e;
  --color-success-soft:#22c55e18;

  /* Texte */
  --color-text-1:      #f1f5f9;   /* titres principaux */
  --color-text-2:      #94a3b8;   /* labels, sous-titres */
  --color-text-3:      #475569;   /* placeholders, disabled */

  /* Forme */
  --radius-sm:         6px;
  --radius-card:       12px;
  --radius-btn:        8px;
  --shadow-card:       0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-focus:      0 0 0 3px rgba(99, 102, 241, 0.35);

  /* Transitions */
  --transition:        150ms ease;
}
```

### 6.3 Layout du Dashboard

```
┌──────────────────────────────────────────────────────┐
│  HEADER                                              │
│  [LayoutDashboard] Tableau de bord  [Users] N users  │
├─────────────────────┬────────────────────────────────┤
│  FORMULAIRE         │  LISTE (scroll interne)        │
│                     │                                │
│  [User]  Nom        │  ┌──────────────────────────┐  │
│  [input]            │  │ [User] Nom     [Mail] ... │  │
│                     │  │              [Trash2]     │  │
│  [Mail]  Email      │  └──────────────────────────┘  │
│  [input]            │                                │
│                     │  ┌──────────────────────────┐  │
│  [UserPlus] Ajouter │  │  ...                     │  │
│                     │  └──────────────────────────┘  │
│                     │                                │
│                     │  — état vide —                 │
│                     │  [UserX size=48]               │
│                     │  Aucun utilisateur ajouté      │
└─────────────────────┴────────────────────────────────┘
```

Règles de layout :
- Responsive : **1 colonne** < 768px, **2 colonnes** ≥ 768px (`grid-template-columns: 360px 1fr`)
- `UserList` : `max-height: calc(100vh - 200px)` + `overflow-y: auto` — la page ne scroll pas
- Formulaire : `position: sticky; top: 1.5rem` sur desktop — reste visible en scrollant la liste

### 6.4 Comportements UX obligatoires

**Formulaire**

| Comportement | Détail |
|---|---|
| Labels | Toujours affichés au-dessus de l'input — jamais placeholder seul |
| Validation | Déclenchée sur `onBlur`, message d'erreur rouge sous le champ |
| Bouton submit | `disabled` tant que le form est invalide |
| Après ajout | Reset complet du form + focus remis sur le champ Nom |
| Icône dans l'input | Icône à gauche dans un wrapper relatif (`User`, `Mail`) |

**Liste**

| Comportement | Détail |
|---|---|
| Nouvelle carte | Animation `fadeInDown` (200ms) à l'apparition |
| Bouton delete | Hover : fond `--color-danger-soft`, icône rouge |
| Suppression | Animation `fadeOut + scale(0.95)` avant disparition (150ms) |
| État vide | `UserX size={48}` centré + texte "Aucun utilisateur pour le moment" |
| Compteur | Badge dans le header mis à jour en temps réel avec `users.length` |

---

## 7. Composant par composant — Contrat d'interface

### `useUsers.js`
```js
/**
 * Gère l'état de la liste d'utilisateurs.
 * Sanitise les données avant tout setState.
 * @returns {{ users, addUser, deleteUser }}
 */
export const useUsers = () => {
  // ...
  return { users, addUser, deleteUser };
};
// Type retourné :
// users      → User[]   — { id: string, name: string, email: string }
// addUser    → (raw: { name: string, email: string }) => void
// deleteUser → (id: string) => void
```

### `UserForm.jsx`
```jsx
// Props attendues :
// onAdd : (rawUser: { name: string, email: string }) => void

// Responsabilités :
// - state local du formulaire (name, email, errors)
// - validation sur onBlur avec regex locaux
// - appel de onAdd() si le form est valide
// - reset après ajout réussi

// NE PAS : importer useUsers, gérer le state global, fetch réseau
```

### `UserCard.jsx`
```jsx
// Props attendues :
// user     : { id: string, name: string, email: string }
// onDelete : (id: string) => void

// Responsabilités :
// - afficher name et email avec icônes
// - déclencher onDelete(user.id) au clic

// Mémoïsé : export default memo(UserCard)
// NE PAS : gérer de state, importer useUsers
```

### `UserList.jsx`
```jsx
// Props attendues :
// users    : User[]
// onDelete : (id: string) => void

// Responsabilités :
// - map() sur users → un UserCard par user
// - afficher l'état vide si users.length === 0
// - stabiliser onDelete avec useCallback avant de le passer à UserCard

// NE PAS : logique métier, validation, state global
```

### `Dashboard.jsx`
```jsx
// Aucune prop (page racine)

// Responsabilités :
// - instancier useUsers()
// - construire handleAdd et handleDelete avec useCallback
// - composer <UserForm onAdd={handleAdd} /> et <UserList users={users} onDelete={handleDelete} />
// - afficher le header avec compteur

// NE PAS : logique de validation, style inline, manipulation directe du state
```

---

## 8. Conventions de commit (Git)

Messages en **français**, clairs, écrits comme un humain qui décrit ce qu'il a fait.

### Format

```
<type> : <description courte et précise>
```

### Types

| Type | Quand |
|---|---|
| `init` | Premier commit, mise en place du projet |
| `feat` | Nouvelle fonctionnalité visible par l'utilisateur |
| `fix` | Correction d'un bug |
| `style` | Changement visuel, CSS, mise en page |
| `refacto` | Réécriture interne sans changement de comportement |
| `perf` | Optimisation de performance |
| `chore` | Config, dépendances, scripts |

### Exemples

```bash
git commit -m "init : mise en place du projet avec Vite et React"
git commit -m "chore : installation de lucide-react"
git commit -m "feat : ajout du hook useUsers avec add et delete"
git commit -m "feat : création du formulaire d'ajout d'utilisateur"
git commit -m "feat : affichage de la liste des utilisateurs"
git commit -m "feat : suppression d'un utilisateur depuis sa carte"
git commit -m "style : mise en place du dashboard en mode sombre"
git commit -m "style : animations fadeInDown sur les nouvelles cartes"
git commit -m "fix : le formulaire ne se réinitialisait pas après ajout"
git commit -m "perf : mémoïsation de UserCard avec React.memo"
git commit -m "refacto : déplacement de la sanitisation dans useUsers"
git commit -m "style : état vide avec UserX et message centré"
```

### Règles
- **Une chose par commit** — jamais feat + fix dans le même commit.
- **Pas de messages vagues** : ~~`update`~~, ~~`fix`~~, ~~`wip`~~, ~~`test`~~.
- **Granularité** : commiter après chaque fonctionnalité complète et fonctionnelle.

---

## 9. Checklist avant commit

### Code
- [ ] Aucun `console.log`, `debugger`, code commenté
- [ ] Aucune fonction dépasse 20 lignes
- [ ] Aucun composant dépasse 60 lignes
- [ ] Chaque composant a ses `PropTypes`
- [ ] Imports groupés dans l'ordre défini (libs → composants → hooks → styles)

### Sécurité
- [ ] `dangerouslySetInnerHTML` absent de tout le code
- [ ] Sanitisation dans `useUsers.js` appliquée avant tout `setState`
- [ ] `crypto.randomUUID()` utilisé pour les IDs (pas `Math.random`)
- [ ] Validation sur `onBlur` dans `UserForm` avec regex locaux

### Performance
- [ ] `key` prop utilise `user.id` — jamais l'index
- [ ] `React.memo` appliqué sur `UserCard`
- [ ] `useCallback` sur `handleAdd` et `handleDelete` dans `Dashboard`
- [ ] Aucune fonction créée dans le JSX (`onClick={() => ...}` direct interdit)

### UI/UX
- [ ] État vide affiché si `users.length === 0` (`UserX` + message)
- [ ] Animation d'apparition sur les nouvelles cartes
- [ ] Bouton submit désactivé si le form est invalide
- [ ] Reset du form après ajout réussi
- [ ] Responsive vérifié à 375px, 768px, 1280px
- [ ] Contraste WCAG AA vérifié (DevTools → Accessibility)

### Build
- [ ] `npm run build` réussi sans aucun warning Vite

---

## 10. README requis (livrable GitHub)

Contenu dans cet ordre :

1. **Titre + badges** — React 18, Vite, lucide-react
2. **Description** — une ligne sur ce que fait l'app
3. **Stack** — React 18, Vite, lucide-react, CSS Modules
4. **Installation** — `npm install` puis `npm run dev`
5. **Structure** — arborescence `src/` avec commentaires
6. **Architecture** — flux `Dashboard → useUsers → composants`
7. **Sécurité** — sanitisation inline + `crypto.randomUUID`
8. **Captures écran** — 5 images embarquées (form, liste, état vide, responsive mobile, delete)

---

*Document vivant — toute déviation doit être justifiée et documentée ici avant d'être appliquée.*
