import React from 'react';
import './Intro.scss';
import Button from './Button';

const Intro = ({ onBroadcastClick, onPlayClick, onWatchClick }) => {
  return (
    <div className="Intro">
      <h1 className="Intro__title">
        <span className="emoji" role="img" aria-label="bright">
          🤩
        </span>
        <span className="text">Moji_Moji</span>
        <span className="emoji" role="img" aria-label="lovely">
          😍
        </span>
      </h1>
      <p className="Intro__description">
        find the emoji in the real world and broadcast your actions
      </p>
      <Button className="main-btn" onClick={onPlayClick}>
        Let's play!
      </Button>
      <Button className="main-btn" onClick={onBroadcastClick}>
        Let's broadcast!
      </Button>
      <Button className="main-btn" onClick={onWatchClick}>
        Let's Watch!
      </Button>
    </div>
  );
};

export default Intro;
