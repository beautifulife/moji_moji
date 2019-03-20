import React, { Component, Fragment } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link
} from 'react-router-dom';
import * as tfc from '@tensorflow/tfjs-core';
import { shuffle } from 'lodash';
import io from 'socket.io-client';
import Camera from './Camera';
import {
  GAME_MAX_ITEMS,
  GAME_TIMER_DELAY,
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
      color: 'red',
      currentEmoji: {},
      emojisFound: [],
      endGamePhotos: [],
      isFirstRun: true,
      isRunning: false,
      score: 0,
      gameDifficulty: '1121222345',
      currentLvlIndex: 0,
      gameIsPaused: false
    };

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
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = io(endpoint, {secure: true});

    setInterval(this.send(), 1000);
    socket.on('color', col => {
      document.body.style.backgroundColor = col;
      console.log('got message', col);
    });

    fetch('https://192.168.0.35:3000', {
      mode: 'cors'
    }).then(res => console.log(res));
  }

  send() {
    const { endpoint, color } = this.state;

    const socket = io(endpoint);
    socket.emit('color', color); // change 'red' to this.state.color
  }

  checkEmojiMatch(emojiNameTop1, emojiNameTop2) {
    const { currentEmoji } = this.state;

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
    this.setState({
      score: score + 1,
      emojisFound: emojisFound.push(currentEmoji)
    });
    // endGamePhotos.push(camera.snapshot());

    // ui.cameraFlash();

    // const timeToFind = this.timerAtStartOfRound - this.timer;

    // window.gtag('event', 'Success', {
    //   event_category: 'Emoji',
    //   event_label: `${this.currentEmoji.emoji} - ${this.currentEmoji.name}`,
    //   value: timeToFind
    // });

    // if (GAME_MAX_ITEMS === this.score) {
    //   ui.showAllItemsFoundView(this.endGamePhotos);
    // } else {
    //   setTimeout(() => {
    //     ui.showItemFoundView();
    //   }, 1000);
    // }
  }

  nextEmoji() {
    const { currentLvlIndex, gameDifficulty } = this.state;

    if (currentLvlIndex === gameDifficulty.length) {
      this.setState({ currentLvlIndex: 0 });
    }

    const curLvl = gameDifficulty[currentLvlIndex];
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

    this.setState({
      currentLvlIndex: currentLvlIndex + 1,
      currentEmoji: nextEmoji
    });

    // ui.setActiveEmoji(this.currentEmoji.path);

    // window.gtag('event', 'Find', {
    //   event_category: 'Emoji',
    //   event_label: `${this.currentEmoji.emoji} - ${this.currentEmoji.name}`
    // });
  }

  pauseGame(pauseCamera) {
    alert('got it');
    this.setState({
      gameIsPaused: true,
      isRunning: false
    });

    pauseCamera();
    window.clearInterval(this.timerInterval);
    window.clearInterval(this.speakInterval);
  }

  async predict(videoRef) {
    const { isRunning } = this.state;
    const { emojiMobileNet } = this.props;

    if (isRunning) {
      const result = tfc.tidy(() => {
        console.log('videoElement:', videoRef.current);
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

      console.log(...topK);
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

  async onInitGame(videoRef, pauseCamera, unPauseCamera) {
    const { isFirstRun } = this.state;
    const { emojiMobileNet } = this.props;

    if (isFirstRun) {
      try {
        await emojiMobileNet.load();
        await this.warmUpModel();

        this.setState({
          isFirstRun: false
        });

        this.nextEmoji();
        this.predict(videoRef);
        this.pauseGame = this.pauseGame.bind(this, pauseCamera);
        this.startGame = this.startGame.bind(this, unPauseCamera);
        // this.showCountdown();
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('not first run');
      // this.showCountdown();
    }
  }

  startGame(unPauseCamera) {
    unPauseCamera();
    this.setState({
      isRunning: true
    });

    this.timerAtStartOfRound = this.timer;
    this.timerInterval = window.setInterval(() => {
      this.handleGameTimerCountdown();
    }, GAME_TIMER_DELAY);
  }

  handleGameTimerCountdown() {
    if (this.timer === 0) {
      window.clearInterval(this.timerInterval);

      // window.gtag('event', 'Failure', {
      //   event_category: 'Emoji',
      //   event_label: `${this.currentEmoji.emoji} - ${this.currentEmoji.name}`
      // });

      // if (this.score === 0) {
      //   ui.showNoItemsFoundView();
      // } else {
      //   ui.showXItemsFoundView(this.endGamePhotos);
      // }
    } else if (this.timer <= 5) {
      // if (this.timer === 5) {
      //   this.playAudio(AUDIO.TIME_RUNNING_LOW);
      // }
      // ui.updateTimer(this.timer, false, true);
    } else {
      // ui.updateTimer(this.timer);
    }

    this.timer--;
  }

  handleStartClick(ev) {
    this.startGame();
  }

  render() {
    const { currentEmoji, emojisFound, endpoint } = this.state;


    return (
      <Router>
        <div className="App">
          {Object.keys(currentEmoji).length ? (
            <div className="App__current-emoji">
              <span>{currentEmoji.name}</span>
              <span>{currentEmoji.emoji}</span>
              <span>{emojisFound.length}</span>
            </div>
          ) : null}
          <Link to="/camera" onClick={this.handleStartClick}>
            go to camera
          </Link>
          <button type="button" onClick={this.send}>socket test</button>
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
