import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Mail, Trash2, Pencil } from 'lucide-react';

import styles from '../styles/UserCard.module.css';

const getInitiale = (name) => name.trim().charAt(0).toUpperCase();

const UserCard = memo(({ user, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    setTimeout(() => onDelete(user.id), 150);
  }, [onDelete, user.id]);

  const handleEdit = useCallback(() => onEdit(user), [onEdit, user]);

  return (
    <article className={`${styles.card} ${isDeleting ? styles.deleting : ''}`}>
      <div className={styles.avatar}>{getInitiale(user.name)}</div>

      <div className={styles.info}>
        <span className={styles.name}>{user.name}</span>
        <span className={styles.email}>
          <Mail size={14} />{user.email}
        </span>
      </div>

      <span className={`${styles.badge} ${styles[user.status]}`}>
        <span className={styles.dot} />
        {user.status === 'actif' ? 'Actif' : 'Inactif'}
      </span>

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={handleEdit} aria-label={`Modifier ${user.name}`}>
          <Pencil size={16} />
        </button>
        <button className={styles.deleteBtn} onClick={handleDelete} aria-label={`Supprimer ${user.name}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
});

UserCard.displayName = 'UserCard';

UserCard.propTypes = {
  user: PropTypes.shape({
    id:     PropTypes.string.isRequired,
    name:   PropTypes.string.isRequired,
    email:  PropTypes.string.isRequired,
    status: PropTypes.oneOf(['actif', 'inactif']).isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit:   PropTypes.func.isRequired,
};

export default UserCard;
