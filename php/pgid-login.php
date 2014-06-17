<?php

require_once('global.php');
require_once('template.php');
require_once('passwordlib/passwordLib.php');

if (empty($_POST)) exit(header('Location: login.php'));

$layout = & new tpfcTemplate('templates');
$cmd = $_POST['cmd'];
$pgid = $_POST['pgid'];
$token = $_POST['token'];
$pubkeytext = extract_pubkeytext($pgid);
if ($pubkeytext == false) exit(error_msg($layout, 'Invalid PGID', $token == ''));

if ($cmd == 'login')
{
	if ($token == '')
	{
		// Generate authentication token and encrypt to pubkey
		$pubkey = openssl_get_publickey($pubkeytext);
		$token = bin2hex(openssl_random_pseudo_bytes(32));
		file_put_contents("/tmp/token.$token", $pubkeytext);
		openssl_public_encrypt($token, $token_encrypted, $pubkey); 

		// Send back encrypted token (challenge)
		header('Content-type: application/json; charset=UTF-8');
		print json_encode(array('token' => base64_encode($token_encrypted)));
	}
	else
	{
		// Verify authentication token
		if (verify_auth_token($token, $pubkeytext) == false) exit(error_msg($layout, 'Authentication error!'));

		// Check if PGID belongs to registered user
		$db = db_connect();
		$user = get_user_by_pgid($db, $pubkeytext);
		if ($user == false) exit(error_msg($layout, 'You are not a registered user!'));

		// Create a random session ID and set cookie in client browser
		$sessionid = bin2hex(openssl_random_pseudo_bytes(32));
		setcookie('sessionid', "{$user['username']}@$sessionid", 0);
		
		// Write a hashed version of the session ID to the database so that
		// even if the database is hacked, the attacker will not be able to use
		// session IDs to mount an attack.
		$sessionid_hashed = password_hash($sessionid);
		$stmt = $db->prepare('UPDATE users set sessionid=:sessionid where uid=:uid');
		$stmt->execute(array(':sessionid' => $sessionid_hashed, ':uid' => $user['uid']));
		
		// User is now logged in
		header('Location: details.php');
	}
}

?>
