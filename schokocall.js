class SchokoCall {
	constructor(session, display, ua, opts) {
		opts = opts || {};

		this._display = display;
		this._display.session = this;
		this._ua = ua;
		this._media = null;

		this._session = session;
		if(this._session && this.direction == "incoming") {
			for(const type in this._eventHandlers) {
				const handler = this._eventHandlers[type];
				this._session.on(type, handler);
			}
			this._display.ringing = true;
		}
	}

	get _eventHandlers() {
		return {
			confirmed: (event) => {
				this._onconfirmed(event);
			},
			peerconnection: (event) => {
				this._onpeerconnection(event);
			},
			ended: (event) => {
				this._onended(event);
			},
			failed: (event) => {
				this._onended(event);
			}
		}
	}

	get direction() {
		if(this._session == null) {
			return '';
		}
		return this._session.direction;
	}

	_onconfirmed(event) {
		this._display.ringing = false;
		this._display.established = true;
	}

	_onpeerconnectionaddtrack(event) {
		const track = event.track;
		track.onended = (event) => {
			this._onpeerconnectionremovetrack(event);
		};

		const stream = new MediaStream();
		stream.addTrack(track);

		if(track.kind == "video") {
			this._display.video = stream;
		} else if(track.kind == "audio") {
			this._display.audio = stream;
		}
	}

	_onpeerconnectionremovetrack(event) {
		const track = event.target;
		this._display.videoremove = track.id;
	}

	_onpeerconnection(event) {
		const pc = event.peerconnection;
		pc.ontrack = (event) => {
			this._onpeerconnectionaddtrack(event);
		};
		pc.getReceivers().forEach((receiver) => {
			if(receiver.track) {
				this._onpeerconnectionaddtrack({
					track: receiver.track
				});
			}
		});
	}

	_onended(event) {
		if(this._media) {
			this._media.stop();
		}
		this._display.session = null;
	}

	async _getInitialOptions(opts) {
		this._media = await SchokoMedia.init(opts);
		this._display.videomuted = !this._media.hasVideo;

		const localStream = new MediaStream();
		this._media.stream.getVideoTracks().forEach((track) => {
			localStream.addTrack(track);
		});
		this._display.localvideo = localStream;

		let options = {};
		options.mediaStream = this._media.stream;
		return options;
	}

	get ringing() {
		return this._session.isInProgress();
	}

	get established() {
		return this._session.isEstablished();
	}

	get exten() {
		return this._session.remote_identity.uri.user;
	}

	answer(opts) {
		this._getInitialOptions(opts).then((options) => {
			this._session.answer(options);
		});
	}

	decline() {
		this._session.terminate({
			status_code: 600,
			reason_phrase: 'Busy Here'
		});
	}

	hangup() {
		this._session.terminate();
	}

	set audiomuted(val) {
		if(val) {
			this._session.mute({ audio: true });
		} else {
			this._session.unmute({ audio: true });
		}
		this._display.audiomuted = val;
	}

	set videomuted(val) {
		this._media.video = !val;
		this._display.videomuted = val;
	}

	sharedisplay() {
		if(this._media.hasScreen) {
			this._media.screen = false;
			this._display.displayscreen = false;
		} else {
			this._media.screen = true;
			this._display.displayscreen = true;
		}
	}

	dtmf(digit) {
		this._session.sendDTMF(digit);
	}

	_initCall(ua, number, opts) {
		this._getInitialOptions(opts).then((options) => {
			options.eventHandlers = this._eventHandlers;
			this._session = ua._ua.call(number, options);
		});
	}

	static init(ua, number, display, opts) {
		const session = new SchokoCall(null, display, ua);
		session._initCall(ua, number, opts);
		return session;
	}
}
