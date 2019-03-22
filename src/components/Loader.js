import React from 'react';
import { PacmanLoader } from 'react-spinners';

const Loader = () => {
  const styles = {
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: '1000',
      backgroundColor: 'rgba(0, 0, 0, 1)'
    },
    pacmanLoader: {
      transform: 'translateX(-50%)'
    }
  };

  return (
    <div className="Loader" style={styles.wrapper}>
      <PacmanLoader
        css={styles.pacmanLoader}
        sizeUnit="rem"
        size={3.5}
        margin="3.5rem"
        color="#FFEE00"
        loading={true}
      />
    </div>
  );
};

export default Loader;
