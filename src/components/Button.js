import React, { Fragment } from 'react';

const Button = ({ onClick = null, onSubmit = null, children = null }) => {
  return (
    <Fragment>
      <button type="button" onClick={onClick} onSubmit={onSubmit}>
        {children}
      </button>
    </Fragment>
  );
};

export default Button;
