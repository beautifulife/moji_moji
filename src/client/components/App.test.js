import '@babel/polyfill';
import React from 'react';
import { configure, shallow, mount, render } from 'enzyme';
import * as tfc from '@tensorflow/tfjs-core';
import Adapter from 'enzyme-adapter-react-16';
import App from './App';

import * as constants from '../utils/constants';
import * as game from '../utils/game';

configure({ adapter: new Adapter() });
jest.mock('@tensorflow/tfjs-core', () => {});

describe('App', () => {
  const wrapper = shallow(<App />);

  it('component rendered', () => {
    expect(wrapper.find('.App').length).toBe(1);
  });

  describe('about state', () => {
    const wrapper = shallow(<App />);
    
    it('initial state set', () => {
      expect(wrapper.state().countdown).toBe(3);
      expect(wrapper.state().currentEmoji).toEqual({});
      expect(wrapper.state().currentPage).toBe('intro');
      expect(wrapper.state().didUserFound).toBe(false);
      expect(wrapper.state().doSnapShotNow).toBe(false);
      expect(wrapper.state().emojisFound).toEqual([]);
      expect(wrapper.state().endGamePhotos).toEqual([]);
      expect(wrapper.state().isCountdown).toBe(false);
      expect(wrapper.state().isGamePaused).toBe(false);
      expect(wrapper.state().isLoading).toBe(false);
      expect(wrapper.state().score).toBe(0);
      expect(wrapper.state().timer).toBe(constants.GAME_START_TIME);
    });
  });
});
