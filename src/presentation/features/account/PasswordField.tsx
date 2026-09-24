import { useState } from 'react';
import styles from './Account.module.css';

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          className={`${styles.field} ${styles.passwordField}`}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          type="button"
          className={styles.togglePassword}
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </>
  );
}
