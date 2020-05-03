class UADisplay {
	constructor(ua, calldisplay, opts) {
		opts = opts || {};

		this._dial = opts.dial;
		this._dialaudio = opts.dialaudio;
		this._abort = opts.abort;
		this._number = opts.number;
		this._keypad = opts.keypad;

		this._dial.addEventListener('click', (event) => {
			this.dial();
		});
		this._dialaudio.addEventListener('click', (event) => {
			this.dialaudio();
		});
		this._abort.addEventListener('click', (event) => {
			this._onabort(event);
		});
		this._number.addEventListener('input', (event) => {
			this._onnumberchange(event);
		});
		this._keypad.querySelectorAll('[data-dtmf]').forEach((key) => {
			key.addEventListener('click', (event) => {
				this._onkeypress(event);
			});
		});

		this._calldisplay = calldisplay;
		this._ua = ua;
	}

	get exten() {
		return this._number.disabled ? null : this._number.value;
	}

	set exten(exten) {
		if(!this._number.disabled) {
			this._number.value = exten.replace(/[^0-9*#]/gi, '').substr(0, 4);
		}
	}

	get _forceexten() {
		if(this.exten === '') {
			this.exten = this._number.placeholder;
		}
		return this.exten;
	}

	dial() {
		if(this._forceexten) {
			this._ua.initiateCall(this.exten);
		}
	}

	dialaudio() {
		if(this._forceexten) {
			this._ua.initiateCall(this.exten, { audio: true });
		}
	}

	_onabort(event) {
		if(this.exten !== null) {
			this.exten = '';
		}
	}

	_onnumberchange(event) {
		if(this.exten !== null) {
			this.exten = this.exten;
		}
	}

	_onkeypress(event) {
		if(this.exten !== null) {
			this.exten += event.target.getAttribute('data-dtmf');
		}
	}

	set ua(ua) {
		this._ua = ua;
	}

	get calldisplay() {
		if(this._calldisplay.session) {
			return null;
		}

		return this._calldisplay;
	}
}
