import { useState, useEffect } from 'react';

const STORAGE_KEY = 'seomaniak_users';

// crypto.randomUUID() évite les collisions que Math.random() peut produire sur grands volumes
const nettoyerInput = (valeur, longueurMax = 100) =>
  String(valeur)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, longueurMax);

const normaliserStatus = (s) => (s === 'actif' ? 'actif' : 'inactif');

// ─── Seed fixe de 24 utilisateurs pour les tests ────────────────────────────
const SEED_DATA = [
  { name: 'Alice Martin',      email: 'alice.martin@gmail.com',      status: 'actif'   },
  { name: 'Bob Bernard',       email: 'bob.bernard@yahoo.fr',        status: 'actif'   },
  { name: 'Clara Dubois',      email: 'clara.dubois@outlook.com',    status: 'inactif' },
  { name: 'David Thomas',      email: 'david.thomas@gmail.com',      status: 'actif'   },
  { name: 'Emma Robert',       email: 'emma.robert@proton.me',       status: 'actif'   },
  { name: 'François Richard',  email: 'francois.richard@hotmail.fr', status: 'inactif' },
  { name: 'Gabrielle Petit',   email: 'gabrielle.petit@icloud.com',  status: 'actif'   },
  { name: 'Hugo Durand',       email: 'hugo.durand@gmail.com',       status: 'actif'   },
  { name: 'Iris Leroy',        email: 'iris.leroy@yahoo.fr',         status: 'inactif' },
  { name: 'Jules Moreau',      email: 'jules.moreau@gmail.com',      status: 'actif'   },
  { name: 'Karim Simon',       email: 'karim.simon@outlook.com',     status: 'actif'   },
  { name: 'Laura Laurent',     email: 'laura.laurent@proton.me',     status: 'inactif' },
  { name: 'Marc Lefebvre',     email: 'marc.lefebvre@gmail.com',     status: 'actif'   },
  { name: 'Nina Michel',       email: 'nina.michel@hotmail.fr',      status: 'actif'   },
  { name: 'Oscar Garcia',      email: 'oscar.garcia@icloud.com',     status: 'inactif' },
  { name: 'Pauline David',     email: 'pauline.david@gmail.com',     status: 'actif'   },
  { name: 'Quentin Bertrand',  email: 'quentin.bertrand@yahoo.fr',   status: 'actif'   },
  { name: 'Rose Roux',         email: 'rose.roux@outlook.com',       status: 'inactif' },
  { name: 'Samuel Vincent',    email: 'samuel.vincent@gmail.com',    status: 'actif'   },
  { name: 'Théa Fournier',     email: 'thea.fournier@proton.me',     status: 'actif'   },
  { name: 'Ugo Girard',        email: 'ugo.girard@gmail.com',        status: 'inactif' },
  { name: 'Valentine Bonnet',  email: 'valentine.bonnet@icloud.com', status: 'actif'   },
  { name: 'William Dupont',    email: 'william.dupont@hotmail.fr',   status: 'actif'   },
  { name: 'Zoé Lambert',       email: 'zoe.lambert@gmail.com',       status: 'inactif' },
];

// createdAt étalé sur les 7 derniers jours pour tester le compteur "ajouté aujourd'hui"
const buildSeedUsers = () =>
  SEED_DATA.map((u, i) => ({
    id: crypto.randomUUID(),
    name:      u.name,
    email:     u.email,
    password:  'Test1234',
    status:    u.status,
    createdAt: Date.now() - (i % 3 === 0 ? 0 : (i + 1) * 12 * 60 * 60 * 1000),
  }));

// ─── Persistance localStorage ────────────────────────────────────────────────
const loadUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* stockage corrompu → on repart du seed */ }
  // Premier lancement : on charge les 24 users de test
  const seed = buildSeedUsers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
};

const saveUsers = (users) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); } catch (_) { /* quota dépassé */ }
};

// ─── Hook ────────────────────────────────────────────────────────────────────
/**
 * Gère l'état de la liste d'utilisateurs.
 * Sanitise les données avant tout setState.
 * Persiste dans localStorage sous la clé "seomaniak_users".
 * @returns {{ users, addUser, updateUser, deleteUser, seedUsers }}
 */
export const useUsers = () => {
  const [users, setUsers] = useState(loadUsers);

  // Synchronise localStorage à chaque changement de users[]
  useEffect(() => { saveUsers(users); }, [users]);

  const addUser = (rawData) => {
    const name     = nettoyerInput(rawData.name, 50);
    const email    = nettoyerInput(rawData.email, 100);
    const password = nettoyerInput(rawData.password ?? '', 200);
    const status   = normaliserStatus(rawData.status);
    if (!name || !email) return;
    setUsers(prev => [...prev, {
      id: crypto.randomUUID(),
      name, email, password, status,
      createdAt: Date.now(),
    }]);
  };

  const updateUser = (id, rawData) => {
    const name   = nettoyerInput(rawData.name, 50);
    const email  = nettoyerInput(rawData.email, 100);
    const status = normaliserStatus(rawData.status);
    if (!name || !email) return;
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== id) return u;
        // Conserver l'ancien mot de passe si le champ est laissé vide en édition
        const password = rawData.password
          ? nettoyerInput(rawData.password, 200)
          : u.password;
        return { ...u, name, email, password, status };
      })
    );
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Réinitialise avec les 24 users de test (écrase localStorage)
  const seedUsers = (count = 24) => {
    const seed = count === 24
      ? buildSeedUsers()
      : Array.from({ length: count }, () => buildSeedUsers()[0]);
    setUsers(seed);
  };

  return { users, addUser, updateUser, deleteUser, seedUsers };
};
