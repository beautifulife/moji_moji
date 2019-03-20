import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore, compose } from 'redux';
import './main.scss';
import App from './components/App';
import MobileNet from './utils/mobilenet';

const emojiMobileNet = new MobileNet();

ReactDOM.render(
  <App emojiMobileNet={emojiMobileNet} />,
  document.getElementById('root')
);
