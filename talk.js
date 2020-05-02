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
		keypad: keypad
	});

	const uadisplay = new UADisplay(null, calldisplay, {
		dial: call,
		dialaudio: callaudio,
		abort: hangup,
		number: number,
		keypad: keypad
	});

	if(localStorage.getItem('username') == null) {
		location.href = '/login.html';
		return;
	}
	const exten = localStorage.getItem('exten');
	const username = localStorage.getItem('username');
	const password = localStorage.getItem('password');
	ua = new SchokoUA(exten, username, password, uadisplay);

	uadisplay.exten = '7001';
});
