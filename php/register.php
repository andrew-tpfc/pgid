<?php

require_once('global.php');
require_once('template.php');
require_once('passwordlib/passwordLib.php');

// If user is already logged in, redirect to details page
$db = db_connect();
if (get_session($db) != false) exit(header('Location: details.php'));

$layout = & new tpfcTemplate('templates');
$error = '';

if (!empty($_POST))
{
	$username = $_POST['username']; $layout->set('username', $username);
	$password = $_POST['password']; $layout->set('password', $password);
	$password2 = $_POST['password2']; $layout->set('password2', $password2);
	$fullname = $_POST['fullname']; $layout->set('fullname', $fullname);
	$email = $_POST['email']; $layout->set('email', $email);
	
	// Validate form fields
	if ($username == '') $error = 'Username cannot be blank!';
	elseif ($password == '') $error = 'Password cannot be blank!';
	elseif ($password2 != $password) $error = 'Password verification failed!';
	elseif ($fullname == '') $error = 'Full name cannot be blank!';
	elseif ($email == '') $error = 'Email address cannot be blank!';
	
	// Check that username has not been taken
	if ($error == '')
	{
		$user = get_user_by_name($db, $username);
		if ($user) $error = 'Username has already been taken!';
	}
	
	// Insert user into database
	if ($error == '')
	{
		$stmt = $db->prepare('INSERT INTO users (username, password, fullname, email) VALUES(:username, :password, :fullname, :email)');
		$stmt->execute(array(':username' => $username, ':password' => password_hash($password), ':fullname' => $fullname, ':email' => $email));
		$layout->set('title', 'Registration');
		$layout->set('body', 'templates/register_success.php');
		print $layout->fetch('layout.php');
		exit;
	}
}

$layout->set('title', 'Registration');
$layout->set('pgidfunc', 'pgid-register');
$layout->set('pgidurl', 'http://demo.pgid.org/pgid-register.php');
$layout->set('body', 'templates/register.php');
$layout->set('error', $error);
print $layout->fetch('layout.php');

?>
