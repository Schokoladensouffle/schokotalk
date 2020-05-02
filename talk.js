var ua = null;
var remoteaudio;
var remotevideo;
var local;
var sfu;
var number;
var call;
var vicall;
var hangup;
var screenie;
var mutie;
var vimutie;

window.addEventListener('load', () => {
	remoteaudio = document.getElementById('remote');
	remotevideo = document.getElementById('remotemain');
	local = document.getElementById('local');
	sfu = document.getElementById('sfu');
	number = document.getElementById('number');
	call = document.getElementById('call');
	vicall = document.getElementById('vicall');
	hangup = document.getElementById('hangup');
	screenie = document.getElementById('screenie');
	mutie = document.getElementById('mutie');
	vimutie = document.getElementById('vimutie');

	const calldisplay = new CallDisplay(null, {
		audiomute: mutie,
		videomute: vimutie,
		screenshare: screenie,
		remoteaudio: remoteaudio,
		remotevideo: remotevideo,
		localvideo: local,
		sfu: sfu,
		accept: vicall,
		acceptaudio: call,
		decline: hangup,
		ringer: number
	});

	const uadisplay = {
		get calldisplay() {
			return calldisplay;
		}
	};

	if(localStorage.getItem('username') == null) {
		location.href = '/login.html';
		return;
	}
	const exten = localStorage.getItem('exten');
	const username = localStorage.getItem('username');
	const password = localStorage.getItem('password');
	ua = new SchokoUA(exten, username, password, uadisplay);

	call.addEventListener('click', () => {
		if(number.value && !number.disabled) {
			vimuted = true;
			ua.initiateCall(number.value, { audio: true });
		}
	});

	vicall.addEventListener('click', () => {
		if(number.value && !number.disabled) {
			ua.initiateCall(number.value);
		}
	});

	hangup.addEventListener('click', () => {
		if(ua.session == null) {
			number.value = '';
		}
	});

	screenie.addEventListener('click', () => {
		ua.session.sharedisplay();
	});

	function checkNumber() {
		number.value = number.value.replace(/[^0-9*#]/gi, '').substr(0, 4);
		call.disabled = number.value == '';
		vicall.disabled = number.value == '';
	}

	number.addEventListener('input', checkNumber);

	document.getElementById('keypad').querySelectorAll('[data-dtmf]').forEach((key) => {
		key.addEventListener('click', (event) => {
			const digit = event.target.getAttribute("data-dtmf");
			if(ua.session == null) {
				number.value += digit;
				checkNumber();
			} else {
				ua.session.dtmf(digit);
			}
		});
	});

	number.value = "7001";
	checkNumber();
	uadisplay.hasSession = false;
});
