import React, { Component, Fragment } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import * as tfc from '@tensorflow/tfjs-core';
import { shuffle } from 'lodash';
import io from 'socket.io-client';
import Camera from './Camera';
import Intro from './Intro';
import Loader from './Loader';

import {
  GAME_MAX_ITEMS,
  GAME_START_TIME,
  GAME_TIMER_DELAY,
  GAME_EXTEND_TIME,
  VIDEO_PIXELS
} from '../utils/constants';
import {
  EMOJIS_DEMO,
  EMOJIS_LVL_1,
  EMOJIS_LVL_2,
  EMOJIS_LVL_3,
  EMOJIS_LVL_4,
  EMOJIS_LVL_5,
  EMOJIS_LVL_DEMO
} from '../utils/game_levels';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      endpoint: '192.168.0.35:3000',
      color: 'transparent',
      currentEmoji: {},
      endGamePhotos: [],
      emojisFound: [],
      score: 0,
      isLoading: false,
      timer: GAME_START_TIME
    };

    this.topKemojiName = '';
    this.isFirstRun = true;
    this.isRunning = false;
    this.gameDifficulty = '1121222345';
    this.currentLvlIndex = 0;
    this.gameIsPaused = false;

    this.emojiDemo = EMOJIS_DEMO;
    this.emojiLvl1 = shuffle(EMOJIS_LVL_1);
    this.emojiLvl2 = shuffle(EMOJIS_LVL_2);
    this.emojiLvl3 = shuffle(EMOJIS_LVL_3);
    this.emojiLvl4 = shuffle(EMOJIS_LVL_4);
    this.emojiLvl5 = shuffle(EMOJIS_LVL_5);
    this.emojiLvlDemo = Array.from(EMOJIS_LVL_DEMO);

    this.emojiLvlLookup = {
      1: this.emojiLvl1,
      2: this.emojiLvl2,
      3: this.emojiLvl3,
      4: this.emojiLvl4,
      5: this.emojiLvl5,
      '#': this.emojiLvlDemo
    };

    this.onInitGame = this.onInitGame.bind(this);
    this.handleStartClick = this.handleStartClick.bind(this);
    this.send = this.send.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = io(endpoint, { secure: true });

    setInterval(this.send(), 1000);
    socket.on('color', col => {
      document.body.style.backgroundColor = col;
      console.log('got message', col);
    });
  }

  send() {
    const { endpoint, color } = this.state;

    const socket = io(endpoint);
    socket.emit('color', color); // change 'red' to this.state.color
  }

  checkEmojiMatch(emojiNameTop1, emojiNameTop2) {
    const { currentEmoji } = this.state;

    if (this.topKemojiName !== emojiNameTop1) {
      this.topKemojiName = emojiNameTop1;
    }

    if (
      currentEmoji.name === emojiNameTop1 ||
      currentEmoji.name === emojiNameTop2
    ) {
      this.emojiFound();
    }
  }

  emojiFound() {
    const { currentEmoji, emojisFound, endGamePhotos, score } = this.state;

    this.pauseGame();

    const photo = this.saveAnswer();

    this.setState({
      score: score + 1,
      emojisFound: [...emojisFound, currentEmoji],
      endGamePhotos: [...endGamePhotos, photo]
    });

    // ui.cameraFlash();

    if (GAME_MAX_ITEMS === score) {
      this.showAllItemsFoundView(this.endGamePhotos);
    } else {
      setTimeout(() => {
        this.showItemFoundView();
      }, 1000);
    }
  }

  showItemFoundView() {
    // this.showView(VIEWS.FOUND_ITEM);
    this.extendTimer();
  }

  updateTimer(value) {
    this.setState({
      timer: value
    });
  }

  delayedUpdateTimer(value) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.updateTimer(value);
        resolve(value);
      }, 70);
    });
  }

  async extendTimer() {
    const { timer } = this.state;
    const maxTimer = timer + 1 + GAME_EXTEND_TIME + 1;

    for (let i = timer + 2; i < maxTimer; i++) {
      await this.delayedUpdateTimer(i);
    }

    // this.setState({
    //   timer: maxTimer - 1
    // });
  }

  nextEmoji() {
    if (this.currentLvlIndex === this.gameDifficulty.length) {
      this.currentLvlIndex = 0;
    }

    const curLvl = this.gameDifficulty[this.currentLvlIndex];
    let lvlArray = this.emojiLvlLookup[curLvl];
    // let nextEmoji = lvlArray.shift();
    let nextEmoji = this.emojiDemo.shift();

    // If we have selected all possible emojis from a particular level,
    // reshuffle the list of possible emoji for that level and request a new
    // next emoji.
    if (nextEmoji === undefined) {
      this.reShuffleLevelEmojis(curLvl);
      lvlArray = this.emojiLvlLookup[curLvl];
      nextEmoji = lvlArray.shift();
    }

    this.currentLvlIndex++;

    this.setState({
      currentEmoji: nextEmoji
    });

    // ui.setActiveEmoji(this.currentEmoji.path);
  }

  pauseGame(pauseCamera) {
    if (this.isRunning) {
      pauseCamera();
    }

    this.gameIsPaused = true;
    this.isRunning = false;

    // this.startGame();
    this.nextEmoji();

    window.clearInterval(this.timerInterval);
    window.clearInterval(this.speakInterval);
  }

  async predict(videoRef) {
    const { emojiMobileNet } = this.props;

    if (this.isRunning) {
      const result = tfc.tidy(() => {
        const pixels = tfc.fromPixels(videoRef.current);
        const centerHeight = pixels.shape[0] / 2;
        const beginHeight = centerHeight - VIDEO_PIXELS / 2;
        const centerWidth = pixels.shape[1] / 2;
        const beginWidth = centerWidth - VIDEO_PIXELS / 2;
        const pixelsCropped = pixels.slice(
          [beginHeight, beginWidth, 0],
          [VIDEO_PIXELS, VIDEO_PIXELS, 3]
        );

        return emojiMobileNet.predict(pixelsCropped);
      });

      const topK = await emojiMobileNet.getTopKClasses(result, 10);

      // Match the top 2 matches against our current active emoji.
      this.checkEmojiMatch(topK[0].label, topK[1].label);
    }

    window.requestAnimationFrame(() => this.predict(videoRef));
  }

  reShuffleLevelEmojis(level) {
    switch (level) {
      case '1':
        this.emojiLvlLookup[level] = shuffle(EMOJIS_LVL_1);
        break;
      case '2':
        this.emojiLvlLookup[level] = shuffle(EMOJIS_LVL_2);
        break;
      case '3':
        this.emojiLvlLookup[level] = shuffle(EMOJIS_LVL_3);
        break;
      case '4':
        this.emojiLvlLookup[level] = shuffle(EMOJIS_LVL_4);
        break;
      case '5':
        this.emojiLvlLookup[level] = shuffle(EMOJIS_LVL_5);
        break;
      case '#':
        // NOTE: the Demo list is not shuffled since we always request them in
        // same order for demo purposes.
        this.emojiLvlLookup[level] = Array.from(EMOJIS_LVL_DEMO);
        break;
      default:
        throw new Error(
          'Error: expected ' +
            level +
            ' level string in the ' +
            'level EmojiLevelsLookup'
        );
    }
  }

  warmUpModel() {
    const { emojiMobileNet } = this.props;

    emojiMobileNet.predict(tfc.zeros([VIDEO_PIXELS, VIDEO_PIXELS, 3]));
  }

  async onInitGame(videoRef, pauseCamera, unPauseCamera, snapshot) {
    const { emojiMobileNet } = this.props;

    if (this.isFirstRun) {
      try {
        await emojiMobileNet.load();
        await this.warmUpModel();

        this.isFirstRun = false;
        this.isRunning = true;

        this.nextEmoji();
        this.predict(videoRef);
        this.pauseGame = this.pauseGame.bind(this, pauseCamera);
        this.startGame = this.startGame.bind(this, unPauseCamera);
        this.saveAnswer = this.saveAnswer.bind(this, snapshot);

        // this.showCountdown();
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('not first run');
      // this.showCountdown();
    }
  }

  saveAnswer(snapshot) {
    return snapshot();
  }

  startGame(unPauseCamera) {
    const { timer } = this.state;

    if (!this.isRunning && !this.isFirstRun) {
      unPauseCamera();
    }

    this.isRunning = true;

    this.timerAtStartOfRound = timer;
    this.timerInterval = window.setInterval(() => {
      this.handleGameTimerCountdown();
    }, GAME_TIMER_DELAY);
  }

  handleGameTimerCountdown() {
    const { timer, endGamePhotos } = this.state;

    if (timer === 0) {
      console.log(this.timerInterval);
      window.clearInterval(this.timerInterval);

      if (this.score === 0) {
        // ui.showNoItemsFoundView();
      } else {
        // ui.showXItemsFoundView(this.endGamePhotos);
        console.log(endGamePhotos[0].currentSrc);
      }
    } else if (timer <= 5) {
      // if (this.timer === 5) {
      //   this.playAudio(AUDIO.TIME_RUNNING_LOW);
      // }
      // ui.updateTimer(this.timer, false, true);
    } else {
      // ui.updateTimer(this.timer);
    }

    this.setState({
      timer: timer - 1
    });
  }

  handleStartClick(ev) {
    this.startGame();
  }

  render() {
    const { currentEmoji, score, timer, isLoading } = this.state;

    return (
      <Router>
        <div className="App">
          {Object.keys(currentEmoji).length ? (
            <div className="App__current-emoji">
              <span>current name: {currentEmoji.name}</span>&nbsp;
              <span>current: {currentEmoji.emoji}</span>
              <br />
              <span>expect count: {score}</span>
              <br />
              <span>left: {timer}</span>
            </div>
          ) : null}
          {isLoading && <Loader />}
          <Route
            exact
            path="/"
            render={props => (
              <Intro {...props} onPlayClick={this.handleStartClick} />
            )}
          />
          <Route
            path="/camera"
            render={props => (
              <Camera {...props} onLoadedMetadata={this.onInitGame} />
            )}
          />
        </div>
      </Router>
    );
  }
}
