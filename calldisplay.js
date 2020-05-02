class CallDisplay {
	constructor(opts) {
		opts = opts || {};

		this._audiomute = opts.audiomute;
		this._videomute = opts.videomute;
		this._screenshare = opts.screenshare;
		this._remoteaudio = opts.remoteaudio;
		this._remotevideo = opts.remotevideo;
		this._localvideo = opts.localvideo;
		this._sfu = opts.sfu;
	}

	set _mainvideo(video) {
		this._remotevideo.srcObject = video.srcObject;
	}

	set video(stream) {
		const vid = document.createElement('video');
		vid.autoplay = true;
		vid.muted = true;
		vid.playsInline = true;
		vid.classList.add('sfu');
		vid.srcObject = stream;
		vid.addEventListener('click', (event) => {
			this._mainvideo = event.target;
		});
		this._sfu.appendChild(vid);
		this._mainvideo = vid;
	}

	set videoremove(trackid) {
		[...this._sfu.getElementsByClassName('sfu')].forEach((video) => {
			if(video.srcObject.getTrackById(trackid)) {
				video.remove();
			}
		});
		if((!this._remotevideo.srcObject || this._remotevideo.srcObject.getTrackById(trackid)) && this._sfu.children.lastChild) {
			this._mainvideo = this._sfu.lastChild;
		}
	}

	set localvideo(stream) {
		this._localvideo.srcObject = stream;
	}

	set audio(stream) {
		this._remoteaudio.srcObject = stream;
	}

	set audiomuted(ismuted) {
		this._audiomute.classList.toggle('ismuted', ismuted);
	}

	set videomuted(ismuted) {
		this._videomute.classList.toggle('ismuted', ismuted);
	}

	set displayscreen(isshared) {
		this._screenshare.classList.toggle('ismuted', ismuted);
	}
}
