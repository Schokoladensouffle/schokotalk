window.addEventListener('load', () => {
	var formuser = document.getElementById('user');
	var formext = document.getElementById('exten');
	var formpass = document.getElementById('pass');
	var formlogin = document.getElementById('login');
	var formanon = document.getElementById('anon');

	formext.addEventListener('input', () => {
		formext.value = formext.value.replace(/[^0-9]/gi, '');
	});

	formlogin.addEventListener('click', (event) => {
		event.preventDefault();
		localStorage.setItem('exten', formext.value);
		localStorage.setItem('username', formuser.value);
		localStorage.setItem('password', formpass.value);
		location.href = '/';
	});

	formanon.addEventListener('click', (event) => {
		event.preventDefault();
		localStorage.setItem('exten', exten);
		localStorage.setItem('username', username);
		localStorage.setItem('password', password);
		location.href = '/';
	});

	if(localStorage.getItem('username') && localStorage.getItem('username') != username) {
		formext.value = localStorage.getItem('exten');
		formuser.value = localStorage.getItem('username');
		formpass.value = localStorage.getItem('password');
	}
});
