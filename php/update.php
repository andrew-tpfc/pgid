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
	if (is_pgid($user['password'])) $layout->set('updatetype', 'pgid-update');
	else $layout->set('updatetype', 'pgid-updatepw');
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
		print $layout->fetch('update_success.php');
		exit;
	}
}

$layout->set('error', $error);
print $layout->fetch('update.php');

?>
