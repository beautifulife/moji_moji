import React, { Fragment } from 'react';
import './Button.scss';

const Button = ({ className = 'Button', onClick = null, onSubmit = null, children = null }) => {
  return (
    <Fragment>
      <button
        type="button"
        className={`Button ${className}`}
        onClick={onClick}
        onSubmit={onSubmit}
      >
        {children}
      </button>
    </Fragment>
  );
};

export default Button;
