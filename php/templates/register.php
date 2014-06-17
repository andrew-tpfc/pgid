<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title>Pretty Good Identity</title>
	<link rel="icon" href="images/favicon.png" />
	<link rel="stylesheet" href="style.css" type="text/css" />
	<link rel="pgid-register" href="http://pgid.portablefreeware.com/pgid-register.php" />
</head>
<body>
	<h1>Register as new user using password</h1>
	<p><i>Don't worry. There is minimal validation. You can type in any email address, even invalid ones, because it is not used.</i></p>
	<?php if ($error != '') print '<p><font color="red"><b>' . $error . '</b></font></p>'; ?>
	<form method="post" action="register.php">
		<label for="username">Username: </label>&nbsp;<input type="text" name="username" value="<?=$username;?>" /><br />
		<label for="password">Password: </label>&nbsp;<input type="password" name="password" value="<?=$password;?>" /><br />
		<label for="password2">Verify password: </label>&nbsp;<input type="password" name="password2" value="<?=$password2;?>" /><br />
		<label for="fullname">Your full name: </label>&nbsp;<input type="text" name="fullname" value="<?=$fullname;?>" /><br />
		<label for="email">Your email address: </label>&nbsp;<input type="text" size="50" name="email" value="<?=$email;?>" /><br />
		<br />
		<input type="submit" value="Register" />
		<input type="reset" value="Cancel" onclick="location.href='login.php'"/>
	</form>
	<hr size="1" width="100%" />
	<p>Use the PGID extension to register using PGID instead of password</p>
	<p>Note that the HTML source has this line in its header:</p>
	<p><tt>&lt;link rel="pgid-register" href="http://pgid.portablefreeware.com/pgid-register.php" /&gt;</tt></p>
	<p>This indicates to the client that PGID registration is supported using the given URL.</p>
	<p>The client will first POST the following values to the URL in JSON format:</p>
	<p><tt>{ cmd: register, pgid: [public key portion of PGID] }</tt></p>
	<p>The server will send back a challenge, which is an authentication token encrypted using the public key:</p>
	<p><tt>{ token: [encrypted authentication token] }</tt></p>
	<p>The client will now respond by sending the decrypted authentication token:</p>
	<p><tt>{ cmd: register, pgid: [public key portion of PGID], token: [authentication token] }</tt></p>
	<p>If the authentication token matches, the server will display the registration form prefilled with the information in the PGID header (eg. full name, short name, email address etc.). The user will then have to register within a certain time limit before the authentication token expires.</p>
</body>
</html>
