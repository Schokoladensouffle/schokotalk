class SchokoMedia {
	constructor(stream) {
		this._video = [];
		this._uservideo = -1;
		this._userscreen = -1;

		const vidtracks = stream.getVideoTracks();
		if(vidtracks.length > 0) {
			this._uservideo = this.createVideoElement(vidtracks[0]);
		}

		this._canvas = document.createElement('canvas');
		this._canvas.width = 1024;
		this._canvas.height = 768;
		this._ctx = this._canvas.getContext('2d');
		this._ctx.fillStyle = '#FFFFFF';
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

		const canvasstream = this._canvas.captureStream();
		const canvastrack = canvasstream.getVideoTracks()[0];

		this._stream = new MediaStream();
		stream.getAudioTracks().forEach((track) => {
			this._stream.addTrack(track);
		});
		this._stream.addTrack(canvastrack);

		this._update = window.setInterval(() => {
			this._render();
		}, 1000/30);
	}

	createVideoElement(track) {
		const vidstream = new MediaStream();
		vidstream.addTrack(track);

		const vid = document.createElement('video');
		vid.autoplay = true;
		vid.srcObject = vidstream;
		this._video.push(vid);

		return this._video.length - 1;
	}

	_rendervideo(vid, x, y, vw, vh) {
		const cw = this._canvas.width;
		const ch = this._canvas.height;
		this._ctx.drawImage(vid, x * cw, y * ch, vw * cw, vh * ch);
	}

	_renderpip(main, pip) {
		this._rendervideo(main, 0, 0, 1, 1);

		const mainratio = this._canvas.width / this._canvas.height;
		const pipratio = pip.videoWidth / pip.videoHeight;
		const pipwidth = Math.sqrt(pipratio / mainratio) / 4;
		const pipheight = Math.sqrt(mainratio / pipratio) / 4;
		this._rendervideo(pip, 1 - pipwidth, 0, pipwidth, pipheight);
	}

	_renderone(vid) {
		this._rendervideo(vid, 0, 0, 1, 1);
	}

	_rendertwo(alpha, beta) {
		this._rendervideo(alpha, 1/15, 3/10, 2/5, 2/5);
		this._rendervideo(beta, 8/15, 3/10, 2/5, 2/5);
	}

	_render() {
		const mainscreen = this.hasScreen ? this._screenvideo : this._videovideo;
		const peerscreen = this.hasScreen ? this._videovideo : null;

		this._canvas.width = mainscreen.videoWidth;
		this._canvas.height = mainscreen.videoHeight;
		this._ctx.fillStyle = '#BBBBBB';
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

		if(peerscreen) {
			this._renderpip(mainscreen, peerscreen);
		} else if(mainscreen) {
			this._renderone(mainscreen);
		}
	}

	get _videovideo() {
		return this.hasVideo ? this._video[this._uservideo] : null;
	}

	get _screenvideo() {
		return this.hasScreen ? this._video[this._userscreen] : null;
	}

	get hasVideo() {
		return this._uservideo >= 0;
	}

	get hasScreen() {
		return this._userscreen >= 0;
	}

	get hasAudio() {
		return true;
	}

	set video(doit) {
		if(doit) {
			if(this.hasVideo) {
				return;
			}

			navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'user'
				}
			}).then((stream) => {
				const track = stream.getVideoTracks()[0];
				this._uservideo = this.createVideoElement(track);
			});
		} else {
			if(!this.hasVideo) {
				return;
			}

			const vid = this._video[this._uservideo];
			vid.srcObject.getTracks().forEach((track) => {
				track.stop();
			});
			this._uservideo = -1;
		}
	}

	set screen(doit) {
		if(doit) {
			if(this.hasScreen) {
				return;
			}

			navigator.mediaDevices.getDisplayMedia({
				video: {
					cursor: 'always'
				}
			}).then((stream) => {
				const track = stream.getVideoTracks()[0];
				this._userscreen = this.createVideoElement(track);
			});
		} else {
			if(!this.hasScreen) {
				return;
			}

			const vid = this._video[this._userscreen];
			vid.srcObject.getTracks().forEach((track) => {
				track.stop();
			});
			this._userscreen = -1;
		}
	}

	stop() {
		this._stream.getTracks().forEach((track) => {
			track.stop();
		});
		this._video.forEach((video) => {
			video.srcObject.getTracks().forEach((track) => {
				track.stop();
			});
		});
		window.clearInterval(this._update);
	}

	static async init(opts) {
		opts = opts || {
			audio: true,
			video: {
				facingMode: 'user'
			}
		};
		const stream = await navigator.mediaDevices.getUserMedia(opts);
		return new SchokoMedia(stream);
	}

	get stream() {
		return this._stream;
	}
}
