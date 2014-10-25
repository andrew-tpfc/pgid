<?php

function db_connect()
{
	$db = new PDO('mysql:host=localhost;dbname=pgid;charset=utf8', '<user>', '<pass>');
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
	return $db;
}

function get_session($db)
{
	// Make sure session cookies are present
	list($username, $sessionid) = explode('@', $_COOKIE['sessionid']);
	if ($username == '' || $sessionid == '') return false;

	// Verify session ID
	$stmt = $db->prepare('SELECT * from users where username=?');
	$stmt->execute(array($username));
	$row = $stmt->fetch(PDO::FETCH_ASSOC);
	if ($row == false || !password_verify($sessionid, $row['sessionid'])) return false;
	
	return $row;
}

function get_user_by_name($db, $username)
{
	$stmt = $db->prepare('SELECT * from users where username=?');
	$stmt->execute(array($username));
	return $stmt->fetch(PDO::FETCH_ASSOC);
}

function get_user_by_pgid($db, $pgid)
{
	$stmt = $db->prepare('SELECT * from users where password=?');
	$stmt->execute(array($pgid));
	return $stmt->fetch(PDO::FETCH_ASSOC);
}

function error_msg($layout, $msg, $json = false)
{
	if ($json)
	{
		header('Content-type: application/json; charset=UTF-8');
		print json_encode(array('error' => $msg));
	}
	else
	{
		$layout->set('error', $msg);
		$layout->set('title', 'Error');
		$layout->set('body', 'templates/error.php');
		print $layout->fetch('layout.php');
	}
}

function is_pgid($keytext)
{
	if (!preg_match('/^-----BEGIN PUBLIC KEY-----(.|[\r|\n])*-----END PUBLIC KEY-----$/ms', $keytext)) return false;
	return true;
}

function extract_pubkeytext($keytext)
{
	if (!preg_match('/(-----BEGIN PUBLIC KEY-----(.|[\r|\n])*-----END PUBLIC KEY-----)/ms', $keytext, $matches)) return false;
	return str_replace("\xd", '', $matches[0]);
}

function verify_auth_token($token, $pubkeytext, $timeout = 60, $unlink = true)
{
	$hash = hash('sha256', $token);
	$result = (file_exists("/tmp/token.$hash") &&
		time() - filemtime("/tmp/token.$hash") <= $timeout &&
		file_get_contents("/tmp/token.$hash") == $pubkeytext);
	if ($unlink) unlink("/tmp/token.$hash");
	return $result;
}

?>
