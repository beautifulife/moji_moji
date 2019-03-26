import React, { Component } from 'react';
import './Watch.scss';
// import io from 'socket.io-client';

class Watch extends Component {
  constructor(props) {
    super(props);

    this.videoRef = React.createRef();

    // this.gotDescription1Local = this.gotDescription1Local.bind(this);
    // this.gotDescription1Remote = this.gotDescription1Remote.bind(this);
    // this.handleCandidate = this.handleCandidate.bind(this);
    // this.handleVideoOfferMsg = this.handleVideoOfferMsg.bind(this);
  }

  componentDidMount() {
    this.setupCamera();
  }

  componentDidUpdate() {
    this.setupCamera();
  }

  setupCamera() {
    console.log(window.watcherStream);
    this.videoRef.current.srcObject = window.watcherStream;
    window.videoRef = this.videoRef;
  }


  // handleCandidate(candidate, dest, prefix, type) {
  //   dest
  //     .addIceCandidate(candidate)
  //     .then(this.onAddIceCandidateSuccess, this.onAddIceCandidateError);
  //   console.log(
  //     `${prefix}New ${type} ICE candidate: ${
  //       candidate ? candidate.candidate : '(null)'
  //     }`
  //   );
  // }

  // hangup() {
  //   console.log('Ending calls');
  //   this.pc1Local.close();
  //   this.pc1Remote.close();
  //   this.pc2Local.close();
  //   this.pc2Remote.close();
  //   this.pc1Local = null;
  //   this.pc1Remote = null;
  //   this.pc2Local = null;
  //   this.pc2Remote = null;
  //   this.hangupButton.disabled = true;
  //   this.callButton.disabled = false;
  // }

  // handleIceCandidate(event) {
  //   console.log('handleIceCandidate event: ', event);
  //   if (event.candidate) {
  //     this.sendMessage({
  //       type: 'candidate',
  //       label: event.candidate.sdpMLineIndex,
  //       id: event.candidate.sdpMid,
  //       candidate: event.candidate.candidate
  //     });
  //   } else {
  //     console.log('End of candidates.');
  //   }
  // }

  render() {
    return (
      <div className="Watch">
        <video
          className="Watch__video"
          ref={this.videoRef}
          autoPlay={true}
          playsInline={true}
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }
}

export default Watch;
