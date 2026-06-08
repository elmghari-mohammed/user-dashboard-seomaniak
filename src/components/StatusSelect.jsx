import PropTypes from 'prop-types';
import { ToggleLeft } from 'lucide-react';

import styles from '../styles/StatusSelect.module.css';

const StatusSelect = ({ value, onChange }) => (
  <div className={styles.field}>
    <label className={styles.label} htmlFor="status">
      <ToggleLeft size={16} />Statut
    </label>
    <select
      id="status"
      name="status"
      value={value}
      onChange={onChange}
      className={`${styles.select} ${styles[value]}`}
    >
      <option value="inactif">Inactif</option>
      <option value="actif">Actif</option>
    </select>
  </div>
);

StatusSelect.propTypes = {
  value:    PropTypes.oneOf(['actif', 'inactif']).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StatusSelect;
