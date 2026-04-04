import React, { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | string;
  size?: 'sm' | 'md' | 'lg' | string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const classes = [
      'btn',
      variant ? `btn--${variant}` : '',
      size ? `btn--${size}` : '',
      fullWidth ? 'btn--full-width' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
