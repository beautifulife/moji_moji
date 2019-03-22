import React from 'react';
import './Finish.scss';
import PhotoAlbum from './PhotoAlbum';
import PopUpMenu from './PopUpMenu';

const Finish = ({ endGamePhotos, onHomeClick, onTryAgainClick }) => {
  return (
    <div className="Finish">
      <div className="Finish__header">
        <span role="img" aria-label="home" onClick={onHomeClick}>
          🏠
        </span>
      </div>
      <div className="Finish__body">
        {endGamePhotos.length ? (
          <PhotoAlbum endGamePhotos={endGamePhotos} />
        ) : (
          <PopUpMenu emoji="😭" text="You can do better!" buttonText="TRY AGAIN" onButtonClick={onTryAgainClick} />
        )}
      </div>
    </div>
  );
};

export default Finish;
