import { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { UserX, ChevronLeft, ChevronRight } from 'lucide-react';

import UserCard from './UserCard';
import styles from '../styles/UserList.module.css';

const getItemsPerPage = () => {
  if (window.innerHeight >= 900) return 8;
  if (window.innerHeight >= 700) return 6;
  return 4;
};

const isToday = (ts) => {
  const now = new Date(); const d = new Date(ts);
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const UserList = ({ users, onDelete, onEdit, searchQuery, filterOverride }) => {
  const [page,         setPage]         = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage);

  useEffect(() => {
    const onResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filteredUsers = useMemo(() => {
    let result = users;

    if (filterOverride === 'actif')    result = result.filter(u => u.status === 'actif');
    else if (filterOverride === 'inactif') result = result.filter(u => u.status === 'inactif');
    else if (filterOverride === 'today')   result = result.filter(u => isToday(u.createdAt));

    if (searchQuery) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [users, searchQuery, filterOverride]);

  useEffect(() => { setPage(1); }, [users, searchQuery, filterOverride]);

  const totalPages = useMemo(() =>
    Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage)),
    [filteredUsers.length, itemsPerPage]);

  const visibleUsers = useMemo(() =>
    filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredUsers, page, itemsPerPage]);

  const prevPage = useCallback(() => setPage(p => p - 1), []);
  const nextPage = useCallback(() => setPage(p => p + 1), []);

  if (filteredUsers.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <UserX size={48} color="var(--color-accent)" />
          <p className={styles.emptyText}>Aucun utilisateur pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {visibleUsers.map(user => (
          <li key={user.id}>
            <UserCard user={user} onDelete={onDelete} onEdit={onEdit} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={prevPage}
            disabled={page === 1} aria-label="Page précédente">
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageLabel}>{page} / {totalPages}</span>
          <button className={styles.pageBtn} onClick={nextPage}
            disabled={page === totalPages} aria-label="Page suivante">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id:     PropTypes.string.isRequired,
    name:   PropTypes.string.isRequired,
    email:  PropTypes.string.isRequired,
    status: PropTypes.oneOf(['actif', 'inactif']).isRequired,
  })).isRequired,
  onDelete:       PropTypes.func.isRequired,
  onEdit:         PropTypes.func.isRequired,
  searchQuery:    PropTypes.string.isRequired,
  filterOverride: PropTypes.string,
};

export default UserList;
