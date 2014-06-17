<?php

require_once('global.php');
require_once('passwordlib/passwordLib.php');

setcookie('sessionid', '', time() - 3600);
header('Location: login.php');

?>
