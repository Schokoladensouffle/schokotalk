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

		this._session = null;
		this._display = display;
	}

	_onregistrationfailed(event) {
		if(event.cause == JsSIP.C.causes.AUTHENTICATION_ERROR) {
			location.href = '/login.html';
			return;
		}
	}

	get session() {
		return this._session;
	}

	onsessionend(session) {
		if(session._session._id != this._session._session._id) throw "Wrong session";
		this._session = null;
		this._display.hasSession = false;
	}

	_onsession(event) {
		if(event.session.direction == "outgoing") {
			return;
		}

		const calldisplay = this._display.calldisplay;
		if(calldisplay) {
			this._session = new SchokoCall(event.session, calldisplay, this);
		}
	}

	initiateCall(number, opts) {
		this._session = SchokoCall.init(this, number, this._display.calldisplay, opts);
		this._display.hasSession = true;
		this._session._display.videomuted = true;
	}
}
