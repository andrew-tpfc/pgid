<?php

require_once('global.php');
require_once('template.php');
require_once('passwordlib/passwordLib.php');

if (empty($_POST)) exit(header('Location: register.php'));

$layout = & new tpfcTemplate('templates');
$cmd = $_POST['cmd'];
$pgid = $_POST['pgid'];
$token = $_POST['token'];
$pubkeytext = extract_pubkeytext($pgid);
if ($pubkeytext == false) exit(error_msg($layout, 'Invalid PGID!', $token == ''));

if ($cmd == 'register')
{
	if ($token == '')
	{
		// Generate authentication token and encrypt to pubkey
		$pubkey = openssl_get_publickey($pubkeytext);
		$token = bin2hex(openssl_random_pseudo_bytes(32));
		file_put_contents("/tmp/token.$token", $pubkeytext);
		openssl_public_encrypt($token, $token_encrypted, $pubkey); 

		// Send back encrypted authentication token (challenge)
		header('Content-type: application/json; charset=UTF-8');
		print json_encode(array('token' => base64_encode($token_encrypted)));
		exit;
	}
	else
	{
		// Verify authentication token
		if (verify_auth_token($token, $pubkeytext) == false) exit(error_msg($layout, 'Authentication error!'));
		
		// Extract header information
		if (preg_match('/^pgid-fullname:\s+(.*)$/m', $pgid, $matches)) $fullname = $matches[1];
		if (preg_match('/^pgid-shortname:\s+(.*)$/m', $pgid, $matches)) $shortname = $matches[1]; 
		if (preg_match('/^pgid-email:\s+(.*)$/m', $pgid, $matches)) $email = $matches[1]; 

		// Populate form fields
		$layout->set('pgid', $pubkeytext);
		$layout->set('token', $token);
		$layout->set('username', $shortname);
		$layout->set('fullname', $fullname);
		$layout->set('email', $email);
	}
}
else if ($cmd == 'register2')
{
	// Make sure token is valid and has not timed out
	if (verify_auth_token($token, $pubkeytext, 5 * 60) == false) exit(header('Location: register.php'));

	// Make sure that user is not already registered i.e. his public key
	// is not already in the database. Note that we perform the check here
	// instead of at the beginning of the challenge-response phase because
	// we want to make sure caller is the rightful owner of the public key
	// before giving him this info. Otherwise, it becomes possible to write
	// a bot to check if any given public key is registered with a particular
	// service or website.
	$db = db_connect();
	$user = get_user_by_pgid($db, $pubkeytext);
	if ($user) $error = 'You are already a registered user!';

	// Validate form fields
	if ($error == '')
	{
		$username = $_POST['username']; $layout->set('username', $username);
		$fullname = $_POST['fullname']; $layout->set('fullname', $fullname);
		$email = $_POST['email']; $layout->set('email', $email);

		if ($username == '') $error = 'Username cannot be blank!';
		elseif ($fullname == '') $error = 'Full name cannot be blank!';
		elseif ($email == '') $error = 'Email address cannot be blank!';
	}
	
	// Check that username has not been taken
	if ($error == '')
	{
		$db = db_connect();
		$stmt = $db->prepare('SELECT * FROM users WHERE username=?');
		$stmt->execute(array($username));
		$rows = $stmt->fetch(PDO::FETCH_ASSOC);
		if ($rows) $error = 'Username has already been taken!';
	}
	
	// Insert user into database
	if ($error == '')
	{
		$stmt = $db->prepare('INSERT INTO users (username, password, fullname, email) VALUES(:username, :password, :fullname, :email)');
		$stmt->execute(array(':username' => $username, ':password' => $pubkeytext, ':fullname' => $fullname, ':email' => $email));
		print $layout->fetch('register_success.php');
		exit;
	}
}

$layout->set('error', $error);
print $layout->fetch('pgid-register.php');

?>
