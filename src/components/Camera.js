import React, { Component } from 'react';
import { isMobile } from '../utils/device';
import { VIDEO_PIXELS } from '../utils/constants';

export default class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCameraFront: false,
      isCameraPaused: false
    };
    this.videoRef = React.createRef();
    this.handleOnLoadedMetadata = this.handleOnLoadedMetadata.bind(this);
    this.pauseCamera = this.pauseCamera.bind(this);
    this.unPauseCamera = this.unPauseCamera.bind(this);
  }

  componentDidMount() {
    this.setupCamera();
    this.setCameraFacing();
  }

  async setupCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'environment' }
      });

      window.stream = stream;
      this.videoRef.current.srcObject = stream;
    }
  }

  handleOnLoadedMetadata() {
    const { onLoadedMetadata } = this.props;

    console.log(
      this.videoRef.current.videoWidth,
      this.videoRef.current.videoHeight
    );

    this.setupVideoDimensions(
      this.videoRef.current.videoWidth,
      this.videoRef.current.videoHeight
    );

    onLoadedMetadata(this.videoRef, this.pauseCamera, this.unPauseCamera);
  }

  setupVideoDimensions(width, height) {
    this.aspectRatio = width / height;

    if (width >= height) {
      this.videoRef.current.height = VIDEO_PIXELS;
      this.videoRef.current.width = this.aspectRatio * VIDEO_PIXELS;
    } else {
      this.videoRef.current.width = VIDEO_PIXELS;
      this.videoRef.current.height = VIDEO_PIXELS / this.aspectRatio;
    }
  }

  pauseCamera() {
    const { isCameraPaused } = this.state;

    if (!isCameraPaused) {
      this.videoRef.current.pause();
      this.setState({
        isCameraPaused: true
      });
    }
  }

  unPauseCamera() {
    const { isCameraPaused } = this.state;

    if (isCameraPaused) {
      this.videoRef.current.play();
      this.setState({
        isCameraPaused: false
      });
    }
  }

  /**
   * Adjusts the camera CSS to flip the display since we are viewing the
   * camera on a desktop where we want the camera to be mirrored.
   */
  setCameraFacing() {
    if (!isMobile()) {
      this.setState({
        isCameraFront: true
      });
    }
  }

  /**
   * Takes a snapshot of the camera feed and converts it
   * to an image via a canvas element.
   * @returns <HTMLImageElement> The snapshot as an image node.
   */
  snapshot() {
    this.snapShotCanvas.height = this.videoRef.current.height;
    this.snapShotCanvas.width = this.videoRef.current.width;

    const context = this.snapShotCanvas.getContext('2d');

    context.drawImage(
      this.videoRef.current,
      0,
      0,
      this.snapShotCanvas.width,
      this.snapShotCanvas.height
    );

    const img = new Image();

    img.src = this.snapShotCanvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    return img;
  }

  render() {
    const { isCameraFront } = this.state;
    console.log('isCameraFront:', isCameraFront);

    return (
      <div className="Camera">
        <div className="Camera__capture-flash" />
        <video
          ref={this.videoRef}
          className={
            isCameraFront ? 'Camera__video camera-front' : 'Camera__video'
          }
          autoPlay={true}
          playsInline={true}
          onLoadedMetadata={this.handleOnLoadedMetadata}
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }
}
