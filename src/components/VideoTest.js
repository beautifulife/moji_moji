import React, { Component } from 'react';
import './VideoTest.scss';
import io from 'socket.io-client';

class VideoTest extends Component {
  constructor(props) {
    super(props);

    this.videoRef = React.createRef();
    this.videoRef2 = React.createRef();

    this.offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    };

    this.gotDescription1Local = this.gotDescription1Local.bind(this);
    this.gotDescription1Remote = this.gotDescription1Remote.bind(this);
    this.handleCandidate = this.handleCandidate.bind(this);
    this.handleVideoOfferMsg = this.handleVideoOfferMsg.bind(this);
  }

  componentDidMount() {
    this.setupCamera();
  }

  createSignalingChannel() {
    this.socket = io('192.168.0.39:3000', { secure: true });

    this.socket.on('message', message => {
      console.log('Received message:', message);
      if (message === 'got user media') {
        console.log('got user media');
      } else if (message.type === 'offer') {
        console.log('offer coming');
        this.handleVideoOfferMsg(message);
      } else if (message.type === 'answer') {
        console.log('answer', message);
        this.pc1Remote.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate') {
        const candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate
        });
        this.pc1Local.addIceCandidate(candidate);
      }
    });
  }

  async setupCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: 'environment' }
      });

      window.localStream = stream;
      this.videoRef.current.srcObject = stream;

      console.log('Starting calls');
      const audioTracks = window.localStream.getAudioTracks();
      const videoTracks = window.localStream.getVideoTracks();

      if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
      }

      if (videoTracks.length > 0) {
        console.log(`Using video device: ${videoTracks[0].label}`);
      }

      this.createSignalingChannel();

      this.pc1Local = this.createPeerConnection();

      // make remote
      this.pc1Remote = this.createPeerConnection();
      this.pc1Remote
        .createOffer(this.offerOptions)
        .then(this.gotDescription1Local, this.onCreateSessionDescriptionError);
    }
  }

  gotDescription1Local(desc) {
    this.pc1Remote.setLocalDescription(desc);
    console.log(`Offer from pc2Local\n${desc.sdp}`);
    console.log('desc', desc);
    this.sendMessage(desc);
  }

  onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }

  handleCandidate(candidate, dest, prefix, type) {
    dest
      .addIceCandidate(candidate)
      .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError);
    console.log(
      `${prefix}New ${type} ICE candidate: ${
        candidate ? candidate.candidate : '(null)'
      }`
    );
  }

  call() {
    this.pc1Remote = new RTCPeerConnection({
      iceServers: this.loadStunList()
    });

    this.pc1Remote.ontrack = e => {
      if (this.videoRef2.current.srcObject !== e.streams[0]) {
        this.videoRef2.current.srcObject = e.streams[0];
        console.log('pc1: received remote stream');
      }
    };

    this.pc1Remote.onicecandidate = ev => {
      console.log('add player');
      if (ev.candidate) {
        this.socket.emit('add-watcher', JSON.stringify(ev.candidate));
      }
    };
  }

  gotDescription1Remote(desc) {
    this.pc1Remote.setRemoteDescription(desc);
  }

  hangup() {
    console.log('Ending calls');
    this.pc1Local.close();
    this.pc1Remote.close();
    this.pc2Local.close();
    this.pc2Remote.close();
    this.pc1Local = null;
    this.pc1Remote = null;
    this.pc2Local = null;
    this.pc2Remote = null;
    this.hangupButton.disabled = true;
    this.callButton.disabled = false;
  }

  onAddIceCandidateSuccess() {
    console.log('AddIceCandidate success.');
  }

  onAddIceCandidateError(error) {
    console.log(`Failed to add ICE candidate: ${error.toString()}`);
  }

  loadStunList() {
    const stunList = [
      'stun.l.google.com:19302',
      'stun1.l.google.com:19302',
      'stun2.l.google.com:19302',
      'stun3.l.google.com:19302',
      'stun4.l.google.com:19302',
      'stun.ekiga.net',
      'stun.ideasip.com',
      'stun.rixtelecom.se',
      'stun.schlund.de',
      'stun.stunprotocol.org:3478',
      'stun.voiparound.com',
      'stun.voipbuster.com',
      'stun.voipstunt.com',
      'stun.voxgratia.org'
    ];

    return stunList.map(url => {
      const urls = `stun:${url}`;
      return { urls };
    });
  }

  createPeerConnection() {
    const myPeerConnection = new RTCPeerConnection({
      iceServers: this.loadStunList()
    });

    myPeerConnection.onicecandidate = event => {
      console.log('handleIceCandidate event: ', event);
      if (event.candidate) {
        this.socket.emit('messages', {
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      } else {
        console.log('End of candidates.');
      }
    };

    myPeerConnection.onaddstream = event => {
      console.log('Remote stream added.');
      // reattachMediaStream(miniVideo, localVideo);
      this.videoRef2.current.srcObject = event.stream;
      window.remoteStream = event.stream;
    };

    return myPeerConnection;
  }

  handleVideoOfferMsg(msg) {
    const localStream = window.localStream;
    const playerPeerConnection = this.pc1Local;
    const desc = new RTCSessionDescription(msg);

    playerPeerConnection
      .setRemoteDescription(desc)
      .then(() => {
        localStream
          .getTracks()
          .forEach(track => playerPeerConnection.addTrack(track, localStream));
      })
      .then(() => {
        return playerPeerConnection.createAnswer();
      })
      .then(answer => {
        return playerPeerConnection.setLocalDescription(answer);
      })
      .then(() => {
        this.sendMessage(playerPeerConnection.localDescription);
      })
      .catch(this.handleGetUserMediaError);
  }

  handleIceCandidate(event) {
    console.log('handleIceCandidate event: ', event);
    if (event.candidate) {
      this.sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    } else {
      console.log('End of candidates.');
    }
  }

  sendMessage(message) {
    console.log('Sending message: ', message);
    this.socket.emit('message', message);
  }

  render() {
    return (
      <div className="VideoTest">
        <video
          className="VideoTest__video"
          ref={this.videoRef}
          autoPlay={true}
          playsInline={true}
        >
          <track kind="captions" />
        </video>
        <video
          className="VideoTest__video-peer"
          ref={this.videoRef2}
          autoPlay={true}
          playsInline={true}
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }
}

export default VideoTest;
