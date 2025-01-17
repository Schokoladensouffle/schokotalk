export { CallDisplay };

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
		this._accept = opts.accept;
		this._acceptaudio = opts.acceptaudio;
		this._decline = opts.decline;
		this._ringer = opts.ringer;
		this._ringtone = opts.ringtone;
		this._keypad = opts.keypad;
		this._phonebook = opts.phonebook;

		this._audiomute.addEventListener('click', (event) => {
			this._onaudiomute(event);
		});
		this._videomute.addEventListener('click', (event) => {
			this._onvideomute(event);
		});
		this._screenshare.addEventListener('click', (event) => {
			this._onscreenshare(event);
		});
		this._accept.addEventListener('click', (event) => {
			this.accept();
		});
		this._acceptaudio.addEventListener('click', (event) => {
			this.acceptaudio();
		});
		this._decline.addEventListener('click', (event) => {
			this.hangup();
		});
		this._keypad.querySelectorAll('[data-dtmf]').forEach((key) => {
			key.addEventListener('click', (event) => {
				this.dtmf(event.target.getAttribute('data-dtmf'));
			});
		});
		this._localvideo.addEventListener('click', (event) => {
			this._mainvideo = event.target;
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

	accept() {
		if(this._session == null) return;
		if(this._session.ringing) {
			this._session.answer();
		}
	}

	acceptaudio() {
		if(this._session == null) return;
		if(this._session.ringing) {
			this._session.answer({ audio: true });
		}
	}

	hangup() {
		if(this._session == null) return;
		if(this._session.ringing) {
			this._session.decline();
		} else {
			this._session.hangup();
		}
	}

	dtmf(digit) {
		if(this._session == null) return;
		this._session.dtmf(digit);
	}

	set session(session) {
		this._session = session;

		if(session == null) {
			this._audiomute.classList.remove('ismuted');
			this._videomute.classList.remove('ismuted');
			this._screenshare.classList.remove('isshared');
			this._remoteaudio.srcObject = null;
			this._remotevideo.srcObject = null;
			this._localvideo.srcObject = null;
			while(this._sfu.firstChild) this._sfu.firstChild.remove();
		}

		this.ringing = false;
		this.established = false;
	}

	get session() {
		return this._session != null;
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
		if((!this._remotevideo.srcObject || this._remotevideo.srcObject.getTrackById(trackid)) && this._sfu.lastChild) {
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

	set ringing(isringing) {
		this._ringer.classList.toggle('ringing', isringing);
		this._ringer.disabled = this._session != null;
		this._phonebook.classList.toggle('hidden', this._session != null);
		if(isringing) {
			this._ringer.setAttribute('data-user', this._ringer.value);
			this._ringer.value = this._session.exten;
			this._ringtone.currentTime = 0;
			this._ringtone.loop = true;
			this._ringtone.play();
		} else {
			if(this._ringer.hasAttribute('data-user')) {
				this._ringer.value = this._ringer.getAttribute('data-user');
				this._ringer.removeAttribute('data-user');
			}
			this._ringtone.pause();
		}
	}

	set established(isestablished) {
		this._accept.disabled = isestablished;
		this._acceptaudio.disabled = isestablished;
		this._audiomute.disabled = !isestablished;
		this._videomute.disabled = !isestablished;
		this._screenshare.disabled = !isestablished;
		this._ringer.disabled = this._session != null;
		this._phonebook.classList.toggle('hidden', this._session != null);
		if(isestablished) {
			this._ringer.value = this._session.exten;
		}
	}
}
