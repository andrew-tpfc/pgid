<?php

require_once('global.php');
require_once('template.php');
require_once('passwordlib/passwordLib.php');

$layout = & new tpfcTemplate('templates');
if (empty($_POST)) exit(error_msg($layout, 'Invalid parameters!'));

$cmd = $_POST['cmd'];
if ($cmd == 'update')
{
	$opgid = $_POST['opgid'];
	$npgid = $_POST['npgid'];
	$otoken = $_POST['otoken'];
	$ntoken = $_POST['ntoken'];
	
	$opubkeytext = extract_pubkeytext($opgid);
	if ($opubkeytext == false)
	{
		error_msg($layout, 'Invalid PGID', $otoken == '' || $ntoken == '');
		exit;
	}
	$npubkeytext = extract_pubkeytext($npgid);
	if ($npubkeytext == false)
	{
		error_msg($layout, 'Invalid PGID', $otoken == '' || $ntoken == '');
		exit;
	}

	$db = db_connect();
	if ($otoken == '' || $ntoken == '')
	{
		// Generate authentication token and encrypt to oPGID
		$opubkey = openssl_get_publickey($opubkeytext);
		$otoken = bin2hex(openssl_random_pseudo_bytes(120));
		$ohash = hash('sha256', $otoken);
		file_put_contents("/tmp/token.$ohash", $opubkeytext);
		openssl_public_encrypt($otoken, $otoken_encrypted, $opubkey); 

		// Generate authentication token and encrypt to nPGID
		$npubkey = openssl_get_publickey($npubkeytext);
		$ntoken = bin2hex(openssl_random_pseudo_bytes(120));
		$nhash = hash('sha256', $ntoken);
		file_put_contents("/tmp/token.$nhash", $npubkeytext);
		openssl_public_encrypt($ntoken, $ntoken_encrypted, $npubkey); 

		// Send back encrypted tokens
		header('Content-type: application/json; charset=UTF-8');
		print json_encode(array(
			'otoken' => base64_encode($otoken_encrypted),
			'ntoken' => base64_encode($ntoken_encrypted)
		));
	}
	else
	{
		// Verify authentication tokens
		if (verify_auth_token($otoken, $opubkeytext) == false || 
			verify_auth_token($ntoken, $npubkeytext) == false)
			exit(error_msg($layout, 'Authentication error!'));
		
		// Make sure old public key is in the database
		$user = get_user_by_pgid($db, $opubkeytext);
		if ($user == false)	exit(error_msg($layout, 'Old PGID not found!'));

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
