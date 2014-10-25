<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><? echo $title; ?> - Pretty Good Identity Demo</title>
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
	<? if ($pgidfunc != '' && $pgidurl != '') echo '<link rel="' . $pgidfunc . '" href="' . $pgidurl . '" />'; ?>
</head>
<body>
	<div><ol class="breadcrumb"><li><a href="http://www.pgid.org/"><span class="glyphicon glyphicon-home"></span>&nbsp;Pretty Good ID</a></li></ol></div>
	<div class="container">
		<?php include($body); ?>
	</div>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
</body>
</html>
