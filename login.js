window.addEventListener('load', () => {
	var formuser = document.getElementById('user');
	var formext = document.getElementById('exten');
	var formpass = document.getElementById('pass');
	var formlogin = document.getElementById('login');
	var formanon = document.getElementById('anon');

	formext.addEventListener('input', () => {
		formext.value = formext.value.replace(/[^0-9]/gi, '');
	});

	formlogin.addEventListener('click', () => {
		localStorage.setItem('exten', formext.value);
		localStorage.setItem('username', formuser.value);
		localStorage.setItem('password', formpass.value);
		location.href = '/';
	});

	formanon.addEventListener('click', () => {
		localStorage.setItem('exten', exten);
		localStorage.setItem('username', username);
		localStorage.setItem('password', password);
		location.href = '/';
	});
});
