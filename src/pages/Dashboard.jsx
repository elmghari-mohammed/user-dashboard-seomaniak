import { useState, useCallback, useMemo } from 'react';
import { LayoutDashboard, Search, UserPlus } from 'lucide-react';

import StatsBar from '../components/StatsBar';
import UserList from '../components/UserList';
import UserForm from '../components/UserForm';
import { useUsers } from '../hooks/useUsers';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const handleAdd    = useCallback((data)      => addUser(data),           [addUser]);
  const handleDelete = useCallback((id)        => deleteUser(id),          [deleteUser]);
  const handleEdit   = useCallback((user)      => setEditingUser(user),    []);
  const handleSearch = useCallback((e)         => setSearchQuery(e.target.value), []);
  const openForm     = useCallback(()          => setShowForm(true),       []);
  const closeForm    = useCallback(()          => setShowForm(false),      []);
  const closeEdit    = useCallback(()          => setEditingUser(null),    []);
  const handleUpdate = useCallback((id, data) => {
    updateUser(id, data);
    setEditingUser(null);
  }, [updateUser]);

  const handleFilter = useCallback((key) => {
    setActiveFilter(prev => prev === key ? null : key);
  }, []);

  const filteredCount = useMemo(() => {
    if (!searchQuery.trim()) return users.length;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    ).length;
  }, [users, searchQuery]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <LayoutDashboard size={22} color="var(--color-accent)" />
          <div>
            <h1 className={styles.title}>User Dashboard</h1>
            <p className={styles.subtitle}>Gestion des utilisateurs</p>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <StatsBar
          users={users}
          filteredCount={filteredCount}
          activeFilter={activeFilter}
          onFilter={handleFilter}
        />

        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Rechercher un utilisateur…"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <button className={styles.addBtn} onClick={openForm}>
            <UserPlus size={16} />Ajouter un utilisateur
          </button>
        </div>

        <UserList
          users={users}
          onDelete={handleDelete}
          onEdit={handleEdit}
          searchQuery={searchQuery}
          filterOverride={activeFilter}
        />
      </main>

      {showForm && <UserForm onAdd={handleAdd} onClose={closeForm} />}
      {editingUser && (
        <UserForm
          initialData={editingUser}
          onUpdate={handleUpdate}
          onClose={closeEdit}
        />
      )}
    </div>
  );
};

export default Dashboard;
