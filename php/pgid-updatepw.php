<?php

require_once('global.php');
require_once('template.php');
require_once('passwordlib/passwordLib.php');

$layout = & new tpfcTemplate('templates');
if (empty($_POST)) exit(error_msg($layout, 'Invalid parameters!'));

$db = db_connect();
$cmd = $_POST['cmd'];
if ($cmd == 'updatepw')
{
	$username = $_POST['username'];
	$password = $_POST['password'];
	$npgid = $_POST['npgid'];
	$token = $_POST['token'];
	
	$npubkeytext = extract_pubkeytext($npgid);
	if ($npubkeytext == false) exit(error_msg($layout, 'Invalid PGID', $token == ''));
	
	if ($token == '')
	{
		// Generate authentication token and encrypt to nPGID
		$npubkey = openssl_get_publickey($npubkeytext);
		$token = bin2hex(openssl_random_pseudo_bytes(120));
		$hash = hash('sha256', $token);
		file_put_contents("/tmp/token.$hash", $npubkeytext);
		openssl_public_encrypt($token, $token_encrypted, $npubkey);

		// Send back encrypted token
		header('Content-type: application/json; charset=UTF-8');
		print json_encode(array('token' => base64_encode($token_encrypted)));
	}
	else
	{
		// Verify authentication token
		if (verify_auth_token($token, $npubkeytext) == false)
			exit(error_msg($layout, 'Authentication error!'));

		// Verify username/password
		if ($username == '') $user = get_session($db);
		else $user = get_user_by_name($db, $username);

		if ($user == false || !password_verify($password, $user['password']))
			exit(error_msg($layout, 'Authentication error!'));

		// Make sure new public key is not in the database
		$row = get_user_by_pgid($db, $npubkeytext);
		if ($row) exit(error_msg($layout, 'New PGID already in use!'));

		// Update public key
		$stmt = $db->prepare('UPDATE users set password=:npassword where uid=:uid');
		$stmt->execute(array(':uid' => $user['uid'], ':npassword' => $npubkeytext));

		// Logout user
		setcookie('sessionid', '', time() - 3600);
		$layout->set('title', 'Update');
		$layout->set('body', 'templates/update_success.php');
		print $layout->fetch('layout.php');
	}
}

?>
