import React, { Component, Fragment } from 'react';
import * as tfc from '@tensorflow/tfjs-core';
import { shuffle } from 'lodash';
import io from 'socket.io-client';
import './App.scss';

import Camera from './Camera';
import Countdown from './Countdown';
import Finish from './Finish';
import Intro from './Intro';
import Loader from './Loader';
import PopUpMenu from './PopUpMenu';
import StatusBar from './StatusBar';
import Watch from './Watch';

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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countdown: 3,
      currentEmoji: {},
      currentPage: 'intro',
      didUserFound: false,
      doSnapShotNow: false,
      emojisFound: [],
      endGamePhotos: [],
      isCountdown: false,
      isGamePaused: false,
      isLoading: false,
      score: 0,
      timer: GAME_START_TIME
    };

    this.endpoint = '192.168.0.39:3000';
    this.currentLvlIndex = 0;
    this.gameDifficulty = '1121222345';
    this.isFirstRun = true;
    this.isRunning = false;
    this.topKemojiName = '';

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

    this.createPeerConnection = this.createPeerConnection.bind(this);
    this.createSignalingChannel = this.createSignalingChannel.bind(this);
    this.handleBroadcastClick = this.handleBroadcastClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
    this.handlePlayClick = this.handlePlayClick.bind(this);
    this.handleSnapShot = this.handleSnapShot.bind(this);
    this.handleWatchClick = this.handleWatchClick.bind(this);
    this.moveToIntro = this.moveToIntro.bind(this);
    this.onInitGame = this.onInitGame.bind(this);
    this.playGameAgain = this.playGameAgain.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.startGame = this.startGame.bind(this);
    this.startLoading = this.startLoading.bind(this);
    this.termintateLoading = this.termintateLoading.bind(this);
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

  countdown(count) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (count === 0) {
          if (!this.isRunning) {
            this.startGame();
          }

          this.setState({
            isCountdown: false
          });
        } else {
          this.setState({
            isLoading: false,
            isCountdown: true,
            countdown: count
          });
        }
        resolve(count);
      }, 1000);
    });
  }

  createPeerConnection() {
    const myPeerConnection = new RTCPeerConnection();

    myPeerConnection.onicecandidate = event => {
      console.log('handleIceCandidate event: ', event);
      if (event.candidate) {
        this.socket.emit('message', {
          type: 'candidate',
          candidate: event.candidate
        });
      } else {
        console.log('End of candidates.');
      }
    };

    myPeerConnection.onaddstream = event => {
      console.log('Remote stream added.');
      window.watcherStream = event.stream;

      console.log(event.stream);

      this.setState({
        currentPage: 'watch'
      });
    };

    return myPeerConnection;
  }

  createSignalingChannel() {
    this.socket = io(this.endpoint, { secure: true });

    this.socket.on('message', message => {
      console.log('Received message:', message);
      if (message.type === 'offer') {
        console.log('offer coming');
        this.handleVideoOfferMsg(message);
      } else if (message.type === 'answer') {
        console.log('answer', message);
        this.watcherPeerConnection.setRemoteDescription(
          new RTCSessionDescription(message)
        );
      } else if (message.type === 'candidate') {
        // const candidate = new RTCIceCandidate({
        //   sdpMLineIndex: message.label,
        //   candidate: message.candidate
        // });
        if (this.watcherPeerConnection) {
          this.watcherPeerConnection.addIceCandidate(message.candidate);
        } else {
          this.playerPeerConnection.addIceCandidate(message.candidate);
        }
      }
    });
  }

  async setupBroadcastCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // const stream = await navigator.mediaDevices.getDisplayMedia({
      //   video: true
      // });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'environment' }
      });

      window.playerStream = stream;
    }
  }

  emojiFound() {
    const { currentEmoji, emojisFound, score } = this.state;

    this.pauseGame();
    this.setState({
      score: score + 1,
      emojisFound: [...emojisFound, currentEmoji],
      doSnapShotNow: true
    });

    if (GAME_MAX_ITEMS === score) {
      this.setState({
        currentPage: 'finish'
      });
    } else {
      setTimeout(() => {
        this.showItemFoundView();
      }, 500);
    }
  }

  showItemFoundView() {
    this.extendTimer();
    this.setState({
      didUserFound: true
    });
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
  }

  async handleBroadcastClick() {
    await this.createSignalingChannel();
    await this.setupBroadcastCamera();

    window.alert('broadcast ready!');
  }

  handleGameTimerCountdown() {
    const { timer } = this.state;

    if (timer === 0) {
      window.clearInterval(this.timerInterval);
      this.showFoundView();
    } else {
      this.setState({
        timer: timer - 1
      });
    }
  }

  handlePlayClick() {
    this.setState({
      isLoading: true,
      currentPage: 'game'
    });
  }

  handleNextClick() {
    this.showCountdown();
    this.nextEmoji();
  }

  handleSnapShot(img) {
    const { endGamePhotos } = this.state;

    this.setState({
      doSnapShotNow: false,
      endGamePhotos: [...endGamePhotos, img]
    });
  }

  async handleVideoOfferMsg(msg) {
    const playerStream = window.playerStream;
    const playerPeerConnection = this.createPeerConnection();
    this.playerPeerConnection = playerPeerConnection;
    const desc = new RTCSessionDescription(msg);

    try {
      await playerPeerConnection.setRemoteDescription(desc);
      await playerStream.getTracks().forEach(track => {
        playerPeerConnection.addTrack(track, playerStream);
      });
      const answer = await playerPeerConnection.createAnswer();
      await playerPeerConnection.setLocalDescription(answer);
      this.sendMessage(playerPeerConnection.localDescription);
    } catch (err) {
      console.error(err);
    }
  }

  handleWatchClick() {
    this.createSignalingChannel();
    this.makeVideoOffer();
    window.alert('ready to watch!');
  }

  async makeVideoOffer() {
    const watcherPeerConnection = await this.createPeerConnection();
    this.watcherPeerConnection = watcherPeerConnection;

    try {
      const offer = await watcherPeerConnection.createOffer({
        offerToReceiveVideo: true
      });

      await watcherPeerConnection.setLocalDescription(offer);
      this.sendMessage(watcherPeerConnection.localDescription);
    } catch (err) {
      console.error(err);
      // this.handleGetUserMediaError(err);
    }
  }

  moveToIntro() {
    this.resetGame();
    this.setState({
      currentPage: 'intro'
    });
  }

  nextEmoji() {
    if (this.currentLvlIndex === this.gameDifficulty.length) {
      this.currentLvlIndex = 0;
    }

    const curLvl = this.gameDifficulty[this.currentLvlIndex];
    let lvlArray = this.emojiLvlLookup[curLvl];
    let nextEmoji = lvlArray.shift();
    // for demo
    // let nextEmoji = this.emojiDemo.shift();

    if (nextEmoji === undefined) {
      this.reShuffleLevelEmojis(curLvl);
      lvlArray = this.emojiLvlLookup[curLvl];
      nextEmoji = lvlArray.shift();
    }

    this.currentLvlIndex++;

    this.setState({
      currentEmoji: nextEmoji
    });
  }

  async onInitGame(videoRef) {
    const { emojiMobileNet } = this.props;

    try {
      await emojiMobileNet.load();
      await this.warmUpModel();

      this.isFirstRun = false;

      this.nextEmoji();
      this.predict(videoRef);
      this.showCountdown();
    } catch (error) {
      console.log(error);
    }
  }

  pauseCamera() {
    this.setState({
      isGamePaused: true
    });
  }

  pauseGame() {
    if (this.isRunning) {
      this.pauseCamera();
    }

    this.setState({
      isGamePaused: true
    });

    this.isRunning = false;

    window.clearInterval(this.timerInterval);
    window.clearInterval(this.speakInterval);
  }

  playGameAgain() {
    this.resetGame();
    this.setState({
      currentPage: 'game'
    });
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
      console.log(...topK);
      this.checkEmojiMatch(topK[0].label, topK[1].label);
    }

    window.requestAnimationFrame(() => this.predict(videoRef));
  }

  resumeGame() {
    const { isGamePaused } = this.state;

    if (isGamePaused) {
      this.startGame();
    }
  }

  resetGame() {
    this.nextEmoji();
    this.updateTimer(GAME_START_TIME);

    this.setState({
      score: 0,
      timer: GAME_START_TIME,
      emojisFound: [],
      endGamePhotos: []
    });

    this.currentLvlIndex = 0;
    this.timerAtStartOfRound = GAME_START_TIME;
    this.topKemojiName = '';
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
          `Error: expected ${level} level string in the level EmojiLevelsLookup`
        );
    }
  }

  async showCountdown() {
    const { timer } = this.state;

    if (this.isRunning) {
      this.isRunning = false;
    }

    this.updateTimer(timer, true);

    await this.countdown(3);
    await this.countdown(2);
    await this.countdown(1);
    await this.countdown(0);
  }

  startGame() {
    const { timer, didUserFound } = this.state;

    if (didUserFound) {
      this.setState({
        didUserFound: false
      });
    }

    if (!this.isRunning) {
      this.unPauseCamera();
    }

    this.isRunning = true;
    this.timerAtStartOfRound = timer;
    this.timerInterval = window.setInterval(() => {
      this.handleGameTimerCountdown();
    }, GAME_TIMER_DELAY);
  }

  sendMessage(message) {
    console.log('Sending message: ', message);
    this.socket.emit('message', message);
  }

  showFoundView() {
    this.pauseGame();

    this.setState(
      {
        currentPage: 'finish'
      },
      this.updateTimer.bind(this, GAME_START_TIME)
    );
  }

  startLoading() {
    this.setState({
      isLoading: true
    });
  }

  termintateLoading() {
    this.setState({
      isLoading: false
    });
  }

  unPauseCamera() {
    this.setState({
      isGamePaused: false
    });
  }

  warmUpModel() {
    const { emojiMobileNet } = this.props;

    emojiMobileNet.predict(tfc.zeros([VIDEO_PIXELS, VIDEO_PIXELS, 3]));
  }

  render() {
    const {
      currentEmoji,
      score,
      timer,
      isLoading,
      countdown,
      isCountdown,
      currentPage,
      didUserFound,
      endGamePhotos,
      isGamePaused,
      doSnapShotNow
    } = this.state;

    return (
      <div className="App">
        {isLoading && <Loader />}
        {currentPage === 'intro' && (
          <Intro
            onBroadcastClick={this.handleBroadcastClick}
            onPlayClick={this.handlePlayClick}
            onWatchClick={this.handleWatchClick}
          />
        )}
        {currentPage === 'game' && (
          <Fragment>
            {Object.keys(currentEmoji).length ? (
              <StatusBar
                currentEmoji={currentEmoji}
                score={score}
                timer={timer}
              />
            ) : null}
            <Camera
              isGamePaused={isGamePaused}
              doSnapShotNow={doSnapShotNow}
              onLoadedMetadata={this.onInitGame}
              onSnapShot={this.handleSnapShot}
            />
            {isCountdown && <Countdown countdown={countdown} />}
            {didUserFound && (
              <PopUpMenu
                emoji="👍"
                text="You did it!"
                buttonText="NEXT EMOJI"
                onButtonClick={this.handleNextClick}
              />
            )}
          </Fragment>
        )}
        {currentPage === 'finish' && (
          <Finish
            endGamePhotos={endGamePhotos}
            onHomeClick={this.moveToIntro}
            onTryAgainClick={this.playGameAgain}
          />
        )}
        {currentPage === 'watch' && <Watch />}
      </div>
    );
  }
}

export default App;
