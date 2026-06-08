import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

import styles from '../styles/PasswordField.module.css';

const PasswordField = ({ id, label, icon, value, onChange, onBlur, error, hint, show, onToggle }) => (
  <div className={styles.field}>
    <label className={styles.label} htmlFor={id}>{label}</label>
    {hint && <span className={styles.hint}>{hint}</span>}
    <div className={styles.inputWrapper}>
      <span className={styles.iconLeft} aria-hidden="true">{icon}</span>
      <input
        id={id}
        name={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete="off"
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      <button type="button" className={styles.toggleBtn} onClick={onToggle}
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
);

PasswordField.propTypes = {
  id:       PropTypes.string.isRequired,
  label:    PropTypes.string.isRequired,
  icon:     PropTypes.node.isRequired,
  value:    PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur:   PropTypes.func.isRequired,
  error:    PropTypes.string.isRequired,
  hint:     PropTypes.string,
  show:     PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default PasswordField;
