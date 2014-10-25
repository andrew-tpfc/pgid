<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title>Pretty Good Identity</title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
	<h1>Register as new user using PGID</h1>
	<?php if ($error != '') print '<p><font color="red"><b>' . $error . '</b></font></p>'; ?>
	<form method="post" action="pgid-register.php">
		<input type="hidden" name="cmd" value="register2" />
		<input type="hidden" name="pgid" value="<?=$pgid;?>" />
		<input type="hidden" name="token" value="<?=$token;?>" />
		<label for="username">Username: </label>&nbsp;<input type="text" name="username" value="<?=$username;?>" /><br />
		<label for="fullname">Your full name: </label>&nbsp;<input type="text" name="fullname" value="<?=$fullname;?>" /><br />
		<label for="email">Your email address: </label>&nbsp;<input type="text" size="50" name="email" value="<?=$email;?>" /><br />
		<br />
		<input type="submit" value="Register" />
	</form>
	<hr size="1" width="100%" />
	<p>This form has the following hidden fields:</p>
	<p><b>Authentication token:</b> <tt><?=$token;?></tt></p>
	<p><b>Public key of PGID:</b></p>
	<pre><?=$pgid;?></pre>
	<p>The authentication token will expire in 5 mins, so you have to complete registration within that period.</p>
	<p>The public key is unique to each user, so you cannot register another different account using the same public key. </p>
</body>
</html>
