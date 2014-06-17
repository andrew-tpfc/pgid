<?php

require_once('template.php');

$layout = & new tpfcTemplate('templates');
print $layout->fetch('index.php');

?>
