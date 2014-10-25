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
	
	// Validate form fields
	if ($username == '') $error = 'Username cannot be blank';
	elseif ($password == '') $error = 'Password cannot be blank';
	
	// Validate login credentials
	if ($error == '')
	{
		// Retrieve user record
		$user = get_user_by_name($db, $username);
		
		// If user record cannot be retrieved or password is incorrect, display error
		if ($user == false || !password_verify($password, $user['password']))
		{
			$error = 'Invalid username/password';
		}
		// Otherwise take steps for login
		else
		{
			// Create a random session ID and set cookie in client browser
			$sessionid = bin2hex(openssl_random_pseudo_bytes(32));
			setcookie('sessionid', "$username@$sessionid", 0);
			
			// Write a hashed version of the session ID to the database so that
			// even if the database is hacked, the attacker will not be able to use
			// the session ID to mount an attack.
			$sessionid_hashed = password_hash($sessionid);
			$stmt = $db->prepare('UPDATE users set sessionid=:sessionid where uid=:uid');
			$stmt->execute(array(':sessionid' => $sessionid_hashed, ':uid' => $user['uid']));
			
			// User is now logged in
			header('Location: details.php');
		}
	}
}

$layout->set('title', 'Login');
$layout->set('pgidfunc', 'pgid-login');
$layout->set('pgidurl', 'http://demo.pgid.org/pgid-login.php');
$layout->set('body', 'templates/login.php');
$layout->set('error', $error);
print $layout->fetch('layout.php');

?>
