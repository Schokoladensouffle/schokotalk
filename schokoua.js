class SchokoUA {
	constructor(username, password, display, opts) {
		opts = opts || {};

		const server = opts.server || 'talk.schokoladensouffle.eu';
		const signalserver = opts.signalserver || ('wss://' + server + '/ws');

		const uri = 'sip:' + username + '@' + server;
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

		let session = new SchokoCall(event.session, this._display.calldisplay, this);

		if(this.session) {
			session.decline();
			return;
		}

		this._session = session;
		session.answer();

		this._display.hasSession = true;
	}

	initiateCall(number, opts) {
		this._session = SchokoCall.init(this, number, this._display.calldisplay, opts);
		this._display.hasSession = true;
		this._session._display.videomuted = true;
	}
}
