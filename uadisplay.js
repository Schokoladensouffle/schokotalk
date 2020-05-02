class UADisplay {
	constructor(ua, calldisplay, opts) {
		opts = opts || {};

		this._dial = opts.dial;
		this._dialaudio = opts.dialaudio;
		this._abort = opts.abort;
		this._number = opts.number;
		this._keypad = opts.keypad;

		this._dial.addEventListener('click', (event) => {
			this._ondial(event);
		});
		this._dialaudio.addEventListener('click', (event) => {
			this._ondialaudio(event);
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
		this._number.value = exten.replace(/[^0-9*#]/gi, '').substr(0, 4);
	}

	_ondial(event) {
		if(this.exten) {
			this._ua.initiateCall(this.exten);
		}
	}

	_ondialaudio(event) {
		if(this.exten) {
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
		return this._calldisplay;
	}
}
