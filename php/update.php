<?php

require_once('global.php');
require_once('template.php');
require_once('passwordlib/passwordLib.php');

// Make sure user is logged in i.e. session id is present and valid
$db = db_connect();
$user = get_session($db);
if ($user == false) exit(header('Location: login.php'));

$layout = & new tpfcTemplate('templates');
$error = '';

if (empty($_POST))
{
	// Find out if user is currently on password or PGID and adjust accordingly
	if (is_pgid($user['password'])) 
	{
		$layout->set('pgidfunc', 'pgid-update');
		$layout->set('pgidurl', 'http://demo.pgid.org/pgid-update.php');
	}
	else
	{
		$layout->set('pgidfunc', 'pgid-updatepw');
		$layout->set('pgidurl', 'http://demo.pgid.org/pgid-updatepw.php');
	}
}
else
{
	// Retrieve form fields
	$opassword = $_POST['opassword']; $layout->set('opassword', $opassword);
	$npassword = $_POST['npassword']; $layout->set('npassword', $npassword);
	$npassword2 = $_POST['npassword2']; $layout->set('npassword2', $npassword2);

	// Validate form fields
	if ($opassword == '' || $npassword == '') $error = 'Password cannot be blank!';
	elseif (!password_verify($opassword, $user['password'])) $error = 'Old password verification failed!';
	elseif ($npassword2 != $npassword) $error = 'New password verification failed!';
	
	// Update user password and request user to login again
	if ($error == '')
	{
		$stmt = $db->prepare('UPDATE users set password=:password where uid=:uid');
		$stmt->execute(array(':password' => password_hash($npassword), ':uid' => $user['uid']));
		setcookie('sessionid', '', time() - 3600);
		$layout->set('title', 'Update');
		$layout->set('body', 'templates/update_success.php');
		print $layout->fetch('layout.php');
		exit;
	}
}

$layout->set('title', 'Update');
$layout->set('body', 'templates/update.php');
$layout->set('error', $error);
print $layout->fetch('layout.php');

?>
