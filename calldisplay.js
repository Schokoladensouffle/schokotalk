class CallDisplay {
	constructor(session, opts) {
		opts = opts || {};

		this._audiomute = opts.audiomute;
		this._videomute = opts.videomute;
		this._screenshare = opts.screenshare;
		this._remoteaudio = opts.remoteaudio;
		this._remotevideo = opts.remotevideo;
		this._localvideo = opts.localvideo;
		this._sfu = opts.sfu;

		this._audiomute.addEventListener('click', (event) => {
			this._onaudiomute(event);
		});
		this._videomute.addEventListener('click', (event) => {
			this._onvideomute(event);
		});
		this._screenshare.addEventListener('click', (event) => {
			this._onscreenshare(event);
		});

		this.session = session;
	}

	_onaudiomute(event) {
		this._session.audiomuted = !this.audiomuted;
	}

	_onvideomute(event) {
		this._session.videomuted = !this.videomuted;
	}

	_onscreenshare(event) {
		this._session.displayscreen = !this.displayscreen;
	}

	set session(session) {
		this._session = session;
		const hasit = session != null;

		this._audiomute.disabled = !hasit;
		this._videomute.disabled = !hasit;
		this._screenshare.disabled = !hasit;

		if(!hasit) {
			this._audiomute.classList.remove('ismuted');
			this._videomute.classList.remove('ismuted');
			this._screenshare.classList.remove('isshared');
			this._remoteaudio.srcObject = null;
			this._remotevideo.srcObject = null;
			this._localvideo.srcObject = null;
			while(this._sfu.firstChild) this._sfu.firstChild.remove();
		}
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

	get audiomuted() {
		return this._audiomute.classList.contains('ismuted');
	}

	set audiomuted(ismuted) {
		this._audiomute.classList.toggle('ismuted', ismuted);
	}

	get videomuted() {
		return this._videomute.classList.contains('ismuted');
	}

	set videomuted(ismuted) {
		this._videomute.classList.toggle('ismuted', ismuted);
	}

	get displayscreen() {
		return this._screenshare.classList.contains('isshared');
	}

	set displayscreen(isshared) {
		this._screenshare.classList.toggle('isshared', isshared);
	}
}
