import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { User, Mail, Lock, LockKeyhole, UserPlus, Save, X } from 'lucide-react';

import StatusSelect  from './StatusSelect';
import PasswordField from './PasswordField';
import styles from '../styles/UserForm.module.css';

const REGEX_EMAIL   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_NOM     = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
const isNomValide   = (v) => REGEX_NOM.test(v);
const isEmailValide = (v) => REGEX_EMAIL.test(v);
const isPwdValide   = (v) => v.length >= 8;
const ERRORS_INIT   = { name: '', email: '', password: '', confirmPassword: '' };

const buildInit = (data) => ({
  name: data?.name ?? '', email: data?.email ?? '',
  status: data?.status ?? 'inactif', password: '', confirmPassword: '',
});

const LOCK_ICON     = <Lock size={16} />;
const LOCKHOLE_ICON = <LockKeyhole size={16} />;

const UserForm = ({ onAdd = null, onUpdate = null, onClose, initialData = null }) => {
  const isEdit = Boolean(initialData);
  const [form,         setForm]         = useState(() => buildInit(initialData));
  const [errors,       setErrors]       = useState(ERRORS_INIT);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const nomRef = useRef(null);

  const pwdRempli = form.password !== '' || form.confirmPassword !== '';
  const pwdValide = isPwdValide(form.password) && form.password === form.confirmPassword;
  const isValide  = isNomValide(form.name) && isEmailValide(form.email) &&
    (isEdit ? (!pwdRempli || pwdValide) : pwdValide);

  useEffect(() => { nomRef.current?.focus(); }, []);

  const handleChange    = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name: champ, value } = e.target;
    if (champ === 'name')
      setErrors(prev => ({ ...prev, name: isNomValide(value) ? '' : 'Nom invalide (2–50 lettres)' }));
    else if (champ === 'email')
      setErrors(prev => ({ ...prev, email: isEmailValide(value) ? '' : 'Adresse e-mail invalide' }));
    else if (champ === 'password')
      setErrors(prev => ({ ...prev, password: isPwdValide(value) ? '' : 'Minimum 8 caractères' }));
    else if (champ === 'confirmPassword')
      setErrors(prev => ({ ...prev, confirmPassword: value === form.password ? '' : 'Les mots de passe ne correspondent pas' }));
  }, [form.password]);

  const togglePassword  = useCallback(() => setShowPassword(p => !p), []);
  const toggleConfirm   = useCallback(() => setShowConfirm(p => !p),  []);
  const stopPropagation = useCallback((e) => e.stopPropagation(), []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!isValide) return;
    const payload = { name: form.name, email: form.email, status: form.status };
    if (form.password) payload.password = form.password;
    if (isEdit) onUpdate(initialData.id, payload);
    else        onAdd(payload);
    setShowPassword(false);
    setShowConfirm(false);
    onClose();
  }, [isValide, isEdit, onUpdate, onAdd, initialData, form, onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={stopPropagation}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name"><User size={16} />Nom complet</label>
            <input ref={nomRef} id="name" name="name" type="text" value={form.name}
              onChange={handleChange} onBlur={handleBlur} autoComplete="off" placeholder="Jean Dupont"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`} />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email"><Mail size={16} />Email</label>
            <input id="email" name="email" type="email" value={form.email}
              onChange={handleChange} onBlur={handleBlur} autoComplete="off" placeholder="jean@example.com"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`} />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>
          <PasswordField id="password" label="Mot de passe" icon={LOCK_ICON}
            value={form.password} onChange={handleChange} onBlur={handleBlur}
            error={errors.password} hint={isEdit ? 'Laisser vide pour ne pas modifier' : ''}
            show={showPassword} onToggle={togglePassword} />
          <PasswordField id="confirmPassword" label="Confirmer le mot de passe" icon={LOCKHOLE_ICON}
            value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
            error={errors.confirmPassword} hint=""
            show={showConfirm} onToggle={toggleConfirm} />
          <StatusSelect value={form.status} onChange={handleChange} />
          <button type="submit" className={styles.submitBtn} disabled={!isValide}>
            {isEdit ? <><Save size={16} />Enregistrer</> : <><UserPlus size={16} />Ajouter</>}
          </button>
        </form>
      </div>
    </div>
  );
};

UserForm.propTypes = {
  onAdd:       PropTypes.func,
  onUpdate:    PropTypes.func,
  onClose:     PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id:     PropTypes.string.isRequired,
    name:   PropTypes.string.isRequired,
    email:  PropTypes.string.isRequired,
    status: PropTypes.oneOf(['actif', 'inactif']).isRequired,
  }),
};

export default UserForm;
