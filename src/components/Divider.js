import React from 'react';

const Divider = ({ borderTop = 'none', margin = 'none' }) => {
  const styles = {
    borderTop,
    margin
  };

  return <div style={styles}>{null}</div>;
};

export default Divider;
