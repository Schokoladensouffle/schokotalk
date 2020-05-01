window.addEventListener('load', () => {
	var formuser = document.getElementById('user');
	var formpass = document.getElementById('pass');
	var formlogin = document.getElementById('login');
	var formanon = document.getElementById('anon');

	formlogin.addEventListener('click', () => {
		localStorage.setItem('username', formuser.value);
		localStorage.setItem('password', formpass.value);
		location.href = '/';
	});

	formanon.addEventListener('click', () => {
		localStorage.setItem('username', username);
		localStorage.setItem('password', password);
		location.href = '/';
	});
});
