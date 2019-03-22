import React from 'react';
import './PopUpMenu.scss';
import Button from './Button';

const PopUpMenu = ({
  emoji = '',
  text = '',
  buttonText = '',
  onButtonClick = null
}) => {
  return (
    <div className="PopUpMenu">
      <span className="emoji" role="img" aria-label="meaning">
        {emoji}
      </span>
      <span className="text">{text}</span>
      <Button className="PopUpMenu__btn" onClick={onButtonClick}>
        {buttonText}
      </Button>
    </div>
  );
};

export default PopUpMenu;
