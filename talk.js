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

	var muted = false;
	var vimuted = false;

	function updateRemote(video) {
		remotevideo.srcObject = video.srcObject;
	}
	function freshRemote(video) {
		if(remotemain.srcObject && remotemain.srcObject.getTracks()[0].readyState != "ended") {
			return;
		}
		if(video) {
			updateRemote(video);
		} else {
			remotemain.srcObject = null;
		}
	}

	const calldisplay = {
		set video(stream) {
			const vid = document.createElement('video');
			vid.autoplay = true;
			vid.muted = true;
			vid.playsInline = true;
			vid.classList.add('sfu');
			vid.srcObject = stream;
			vid.addEventListener('click', (event) => {
				updateRemote(event.target);
			});
			sfu.appendChild(vid);
		},
		set localvideo(stream) {
			local.srcObject = stream;
		},
		set audio(stream) {
			remoteaudio.srcObject = stream;
		},
		set audiomuted(ismuted) {
			if(ismuted) {
				mutie.classList.add('ismuted');
			} else {
				mutie.classList.remove('ismuted');
			}
		},
		set videomuted(ismuted) {
			if(ismuted) {
				vimutie.classList.add('ismuted');
			} else {
				vimutie.classList.remove('ismuted');
			}
		},
		set displayscreen(isshared) {
			if(isshared) {
				screenie.classList.add('isshared');
			} else {
				screenie.classList.remove('isshared');
			}
		}
	};

	const uadisplay = {
		get calldisplay() {
			return calldisplay;
		},
		set hasSession(hasit) {
			number.disabled = hasit;
			call.disabled = hasit;
			vicall.disabled = hasit;
			screenie.disabled = !hasit;
			mutie.disabled = !hasit;
			vimutie.disabled = !hasit;

			if(!hasit) {
				screenie.classList.remove('isshared');
				mutie.classList.remove('ismuted');
				vimutie.classList.remove('ismuted');
				remoteaudio.srcObject = null;
				remotevideo.srcObject = null;
				local.srcObject = null;
				while(sfu.firstChild) sfu.firstChild.remove();

				muted = false;
				vimuted = false;
			}
		}
	};

	if(localStorage.getItem('username') == null) {
		location.href = '/login.html';
		return;
	}
	const username = localStorage.getItem('username');
	const password = localStorage.getItem('password');
	ua = new SchokoUA(username, password, uadisplay);

	call.addEventListener('click', () => {
		if(number.value) {
			vimuted = true;
			ua.initiateCall(number.value, { audio: true });
		}
	});

	vicall.addEventListener('click', () => {
		if(number.value) {
			ua.initiateCall(number.value);
		}
	});

	hangup.addEventListener('click', () => {
		if(ua.session == null) {
			number.value = '';
		} else {
			ua.session.hangup();
		}
	});

	mutie.addEventListener('click', () => {
		muted = !muted;
		if(muted) {
			ua.session.muteaudio();
		} else {
			ua.session.unmuteaudio();
		}
	});

	vimutie.addEventListener('click', () => {
		vimuted = !vimuted;
		if(vimuted) {
			ua.session.mutevideo();
		} else {
			ua.session.unmutevideo();
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
