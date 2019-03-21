import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Divider from './Divider';
import imoticon1 from '../assets/images/title_imoticon_img1.png';
import imoticon2 from '../assets/images/title_imoticon_img2.png';

const Intro = ({ onPlayClick }) => {
  const styles = {
    imoticons: {
      width: '3.5rem',
      height: 'auto',
      margin: '0 1rem'
    }
  };

  function handlePlayClick(ev) {
    console.log('play');
    onPlayClick();
  }

  function handleWatchClick(ev) {
    console.log('watch');
  }

  return (
    <div className="Intro">
      <div className="Intro__body">
        <h1 className="Intro__body__title">
          <img src={imoticon1} alt="smile" style={styles.imoticons} />
          <span>Moji_Moji</span>
          <img src={imoticon2} alt="love" style={styles.imoticons} />
        </h1>
        <p className="Intro__body__description">
          find the emoji in the real world and broadcast your actions
        </p>
        <Link to="/camera">
          <Button onClick={handlePlayClick}>Let's play!</Button>
        </Link>
        <Link to="/camera">
          <Button onClick={handleWatchClick}>Let's Watch!</Button>
        </Link>
      </div>
    </div>
  );
};

export default Intro;
