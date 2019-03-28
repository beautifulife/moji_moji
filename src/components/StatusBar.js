import React from 'react';
import PropTypes from 'prop-types';
import './StatusBar.scss';

const StatusBar = ({ currentEmoji, score, timer }) => {
  return (
    <div className="StatusBar">
      <div className="StatusBar__current">
        <span>Find</span>
        <span>{currentEmoji.emoji}</span>
        <span>({currentEmoji.name})</span>
      </div>
      <div className="StatusBar__info">
        <span className="emoji" role="img" aria-label="timer">
          ⏱
        </span>
        <span>{timer}</span>
        <span className="emoji" role="img" aria-label="prize">
          ⭐️
        </span>
        <span>{score}</span>
      </div>
    </div>
  );
};

StatusBar.propTypes = {
  currentEmoji: PropTypes.instanceOf(Object),
  score: PropTypes.number,
  timer: PropTypes.number
};

StatusBar.defaultProps = {
  currentEmoji: {},
  score: 0,
  timer: 0
};

export default StatusBar;
