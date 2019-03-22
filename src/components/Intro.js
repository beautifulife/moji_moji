import React from 'react';
import './Intro.scss';
import Button from './Button';

const Intro = ({ onPlayClick, history }) => {
  function handlePlayClick(ev) {
    onPlayClick();
  }

  function handleWatchClick(ev) {
    console.log('watch');
  }

  return (
    <div className="Intro">
      <h1 className="Intro__title">
        <span className="emoji" role="img" aria-label="bright">🤩</span>
        <span className="text">Moji_Moji</span>
        <span className="emoji" role="img" aria-label="lovely">😍</span>
      </h1>
      <p className="Intro__description">
        find the emoji in the real world and broadcast your actions
      </p>
      <Button className="main-btn" onClick={handlePlayClick}>Let's play!</Button>
      <Button className="main-btn" onClick={handleWatchClick}>Let's Watch!</Button>
    </div>
  );
};

export default Intro;
