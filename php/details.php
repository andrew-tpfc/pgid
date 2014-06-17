<?php

require_once('global.php');
require_once('template.php');
require_once('passwordlib/passwordLib.php');

$db = db_connect();
$user = get_session($db);
if ($user == false) exit(header('Location: login.php'));

$layout = & new tpfcTemplate('templates');
$layout->set('username', $user['username']);
$layout->set('password', $user['password']);
$layout->set('sessionid', $user['sessionid']);
$layout->set('fullname', $user['fullname']);
$layout->set('email', $user['email']);
print $layout->fetch('details.php');

?>
