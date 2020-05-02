class SchokoUA {
	constructor(exten, username, password, display, opts) {
		opts = opts || {};

		const server = opts.server || 'talk.schokoladensouffle.eu';
		const signalserver = opts.signalserver || ('wss://' + server + '/ws');

		const uri = 'sip:' + exten + '@' + server;
		const socket = new JsSIP.WebSocketInterface(signalserver);

		this._ua = new JsSIP.UA({
			uri: uri,
			sockets: socket,
			authorization_user: username,
			password: password
		});
		this._ua.on('newRTCSession', (event) => {
			this._onsession(event);
		});
		this._ua.on('registrationFailed', (event) => {
			this._onregistrationfailed(event);
		});
		this._ua.start();

		this._display = display;
		this._display.ua = this;
	}

	_onregistrationfailed(event) {
		if(event.cause == JsSIP.C.causes.AUTHENTICATION_ERROR) {
			location.href = '/login.html';
			return;
		}
	}

	_onsession(event) {
		if(event.session.direction == "outgoing") {
			return;
		}

		const calldisplay = this._display.calldisplay;
		if(calldisplay) {
			new SchokoCall(event.session, calldisplay, this);
		} else {
			new SchokoCall(event.session, {}, this).decline();
		}
	}

	initiateCall(number, opts) {
		const calldisplay = this._display.calldisplay;
		if(calldisplay) {
			SchokoCall.init(this, number, calldisplay, opts);
		}
	}
}
