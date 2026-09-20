import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'alt' | 'ghost';
type ButtonSize = 'md' | 'sm';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const classes = [
    styles.button,
    variant === 'alt' ? styles.alt : '',
    variant === 'ghost' ? styles.ghost : '',
    size === 'sm' ? styles.sm : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <button type="button" className={classes} {...props} />;
}
