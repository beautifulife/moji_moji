import React from 'react';
import PropTypes from 'prop-types';
import './PhotoAlbum.scss';

const PhotoAlbum = ({ endGamePhotos }) => {
  function renderEndGamePhotos() {
    return endGamePhotos.map((photo, index) => {
      return (
        <li className="PhotoAlbum__list__item" key={index}>
          <img src={photo.src} alt={`pic-${index}`} />
        </li>
      );
    });
  }

  return (
    <div className="PhotoAlbum">
      <h2 className="PhotoAlbum__message">
        Great! You found {endGamePhotos.length} items
      </h2>
      <ul className="PhotoAlbum__list">{renderEndGamePhotos()}</ul>
    </div>
  );
};

PhotoAlbum.propTypes = {
  endGamePhotos: PropTypes.instanceOf(Array).isRequired,
};

export default PhotoAlbum;
