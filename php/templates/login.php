<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title>Pretty Good Identity</title>
	<link rel="icon" href="images/favicon.png" />
	<link rel="stylesheet" href="style.css" type="text/css" />
	<link rel="pgid-login" href="http://pgid.portablefreeware.com/pgid-login.php" />
</head>
<body>
	<h1>Login using password</h1>
	<?php
		if ($error != '') print '<p><font color="red"><b>' . $error . '</b></font></p>';
	?>
	<form method="post" action="login.php">
		<label for="username">Username: </label>&nbsp;<input type="text" name="username" value="<?=$username;?>" /><br />
		<label for="password">Password: </label>&nbsp;<input type="password" name="password" /><br />
		<br />
		<input type="submit" value="Login" />
		<input type="reset" value="Register" onclick="location.href='register.php'"/>
	</form>
	<hr size="1" width="100%" />
	<p>Use the PGID extension to login using PGID instead of password</p>
	<p>Note that the HTML source has this line in its header:</p>
	<p><tt>&lt;link rel="pgid-login" href="http://pgid.portablefreeware.com/pgid-login.php" /&gt;</tt></p>
	<p>This indicates to the client that PGID login is supported using the given URL.</p>
	<p>The client will first POST the following values to the URL in JSON format:</p>
	<p><tt>{ cmd: login, pgid: [public key portion of PGID] }</tt></p>
	<p>The server will send back a challenge, which is an authentication token encrypted using the public key:</p>
	<p><tt>{ token: [encrypted authentication token] }</tt></p>
	<p>The client will now respond by sending the decrypted authentication token:</p>
	<p><tt>{ cmd: register, pgid: [public key portion of PGID], token: [authentication token] }</tt></p>
	<p>If the authentication token matches, the server will allow login to proceed.</p>
	<p><a href="/">Back to home</a></p>
</body>
</html>
