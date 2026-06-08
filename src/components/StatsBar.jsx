import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Users, UserCheck, UserPlus, UserX, MousePointerClick } from 'lucide-react';

import styles from '../styles/StatsBar.module.css';

const isToday = (timestamp) => {
  const now = new Date();
  const d   = new Date(timestamp);
  return d.getDate()     === now.getDate()     &&
         d.getMonth()    === now.getMonth()    &&
         d.getFullYear() === now.getFullYear();
};

const StatCard = ({ icon: Icon, label, value, filterKey, isActive, onFilter }) => {
  const handleClick = useCallback(() => {
    if (!filterKey || !onFilter) return;
    onFilter(isActive ? null : filterKey);
  }, [filterKey, isActive, onFilter]);

  return (
    <div
      className={styles.card}
      data-clickable={filterKey ? 'true' : 'false'}
      data-active={isActive ? 'true' : 'false'}
      onClick={filterKey ? handleClick : undefined}
      role={filterKey ? 'button' : undefined}
      tabIndex={filterKey ? 0 : undefined}
      aria-pressed={filterKey ? isActive : undefined}
    >
      <div className={styles.iconWrapper}>
        <Icon size={24} color="var(--color-accent)" />
      </div>
      <div>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
      </div>
      {filterKey && (
        <span className={styles.clickHint}>
          <MousePointerClick size={15} />
        </span>
      )}
    </div>
  );
};

StatCard.propTypes = {
  icon:      PropTypes.elementType.isRequired,
  label:     PropTypes.string.isRequired,
  value:     PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  filterKey: PropTypes.string,
  isActive:  PropTypes.bool,
  onFilter:  PropTypes.func,
};

const StatsBar = ({ users, filteredCount, activeFilter, onFilter }) => {
  const actifs   = useMemo(() => users.filter(u => u.status === 'actif').length,   [users]);
  const inactifs = useMemo(() => users.filter(u => u.status === 'inactif').length, [users]);
  const ajoutes  = useMemo(() => users.filter(u => isToday(u.createdAt)).length,   [users]);

  return (
    <div className={styles.bar}>
      <StatCard icon={Users}     label="Total utilisateurs"
        value={`${filteredCount} utilisateur${filteredCount !== 1 ? 's' : ''}`}
        filterKey={null} isActive={false} onFilter={null} />
      <StatCard icon={UserCheck} label="Utilisateurs actifs"
        value={actifs}   filterKey="actif"    isActive={activeFilter === 'actif'}    onFilter={onFilter} />
      <StatCard icon={UserX}     label="Utilisateurs inactifs"
        value={inactifs} filterKey="inactif"  isActive={activeFilter === 'inactif'}  onFilter={onFilter} />
      <StatCard icon={UserPlus}  label="Ajouté aujourd'hui"
        value={ajoutes}  filterKey="today"    isActive={activeFilter === 'today'}    onFilter={onFilter} />
    </div>
  );
};

StatsBar.propTypes = {
  filteredCount: PropTypes.number.isRequired,
  activeFilter:  PropTypes.string,
  onFilter:      PropTypes.func.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    id:        PropTypes.string.isRequired,
    status:    PropTypes.oneOf(['actif', 'inactif']).isRequired,
    createdAt: PropTypes.number.isRequired,
  })).isRequired,
};

export default StatsBar;
