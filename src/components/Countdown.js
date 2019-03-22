import React from 'react';
import './Countdown.scss';

const Countdown = ({ countdown = 3 }) => {
  return (
    <div className={`Countdown count${countdown}`}>
      <span className={`Countdown__text count${countdown}`}>{countdown}</span>
    </div>
  );
};

export default Countdown;
