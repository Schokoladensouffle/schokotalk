import { CallDisplay } from './calldisplay.js';
import { UADisplay } from './uadisplay.js';
import { SchokoUA } from './schokoua.js';

var ua = null;

window.addEventListener('load', () => {
	var remoteaudio = document.getElementById('remoteaudio');
	var remotevideo = document.getElementById('remotevideo');
	var localvideo = document.getElementById('localvideo');
	var sfu = document.getElementById('sfu');
	var number = document.getElementById('number');
	var callaudio = document.getElementById('callaudio');
	var call = document.getElementById('call');
	var hangup = document.getElementById('hangup');
	var audiomute = document.getElementById('audiomute');
	var videomute = document.getElementById('videomute');
	var screenshare = document.getElementById('screenshare');
	var keypad = document.getElementById('keypad');
	var phonebook = document.getElementById('phonebook');
	var ringtone = document.getElementById('ringtone');

	const calldisplay = new CallDisplay(null, {
		audiomute: audiomute,
		videomute: videomute,
		screenshare: screenshare,
		remoteaudio: remoteaudio,
		remotevideo: remotevideo,
		localvideo: localvideo,
		sfu: sfu,
		accept: call,
		acceptaudio: callaudio,
		decline: hangup,
		ringer: number,
		ringtone: ringtone,
		keypad: keypad,
		phonebook: phonebook
	});

	const uadisplay = new UADisplay(null, calldisplay, {
		dial: call,
		dialaudio: callaudio,
		abort: hangup,
		number: number,
		keypad: keypad
	});

	document.querySelectorAll('a[data-fastnumber]').forEach((link) => {
		link.addEventListener('click', (event) => {
			uadisplay.exten = event.target.getAttribute('data-fastnumber');
		});
	});

	document.addEventListener('keydown', (event) => {
		if(document.activeElement == number) {
			return;
		}
		const digit = event.key;
		if(digit.match(/^[0-9*#]$/)) {
			if(uadisplay.exten === null) {
				calldisplay.dtmf(digit);
			} else {
				uadisplay.exten += digit;
			}
		} else if(digit == "Enter") {
			if(uadisplay.exten === null) {
				if(event.shiftKey) {
					calldisplay.acceptaudio();
				} else {
					calldisplay.accept();
				}
			} else {
				if(event.shiftKey) {
					uadisplay.dialaudio();
				} else {
					uadisplay.dial();
				}
			}
		} else if(digit == "Escape") {
			if(uadisplay.exten === null) {
				calldisplay.hangup();
			} else {
				uadisplay.exten = '';
			}
		} else if(digit == "Backspace") {
			if(uadisplay.exten) {
				uadisplay.exten = uadisplay.exten.substr(0, uadisplay.exten.length - 1);
			}
		}
	});

	if(localStorage.getItem('username') == null) {
		location.href = '/login.html';
		return;
	}
	const exten = localStorage.getItem('exten');
	const username = localStorage.getItem('username');
	const password = localStorage.getItem('password');
	ua = new SchokoUA(exten, username, password, uadisplay);
});
