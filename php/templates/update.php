<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title>Pretty Good Identity</title>
	<link rel="icon" href="images/favicon.png" />
	<link rel="stylesheet" href="style.css" type="text/css" />
	<link rel="<?=$updatetype;?>" href="http://pgid.portablefreeware.com/<?=$updatetype;?>.php" />
</head>
<body>
	<h1>Update authentication credentials</h1>
	<?php if ($error != '') print '<p><font color="red"><b>' . $error . '</b></font></p>'; ?>
	<?php if ($updatetype != 'pgid-update') { ?>
		<form method="post" action="update.php">
			<label for="opassword">Old password: </label>&nbsp;<input type="password" name="opassword" value="<?=$opassword;?>" /><br />
			<label for="npassword">New password: </label>&nbsp;<input type="password" name="npassword" value="<?=$npassword;?>" /><br />
			<label for="npassword2">Verify new password: </label>&nbsp;<input type="password" name="npassword2" value="<?=$npassword2;?>" /><br />
			<br />
			<input type="submit" value="Update" />
		</form>
		<hr size="1" width="100%" />
		<p><i>Note: Use the PGID plugin to upgrade your login credentials from password to PGID.</i></p>
		<p>The HTML source has this line in its header:</p>
		<p><tt>&lt;link rel="pgid-updatepw" href="http://pgid.portablefreeware.com/pgid-updatepw.php" /&gt;</tt></p>
		<p>This indicates that the client can use the given URL to update the login credentials.</p>
		<p>The client will first POST the following values to the URL in JSON format:</p>
		<p><tt>{ cmd: updatepw, password: [current password], npgid: [new PGID] }</tt></p>
		<p>An optional <i>username</i> parameter can be sent. Otherwise the server will try to use the session cookie to determine the username.</p>
		<p>The server will send back a challenge, which consists of an authentication token encrypted to the new PGID:</p>
		<p><tt>{ token: [authentication token encrypted using nPGID] }</tt></p>
		<p>The client will now respond by sending the decrypted authentication token:</p>
		<p><tt>{ cmd: updatepw, password: [current password], npgid: [new PGID], token: [authentication token] }</tt></p>
		<p>If the authentication token matches, the server will update the authentication credential to the given PGID.</p>
	<?php } else { ?>
		<p>You are already using PGID to login.</p>
		<p>Use the PGID extension to update your login credentials in order to use another PGID to login.</p>
		<hr size="1" width="100%" />
		<p>The HTML source has this line in its header:</p>
		<p><tt>&lt;link rel="pgid-update" href="http://pgid.portablefreeware.com/pgid-update.php" /&gt;</tt></p>
		<p>This indicates that the client can use the given URL to update the login credentials.</p>
		<p>The client will first POST the following values to the URL in JSON format:</p>
		<p><tt>{ cmd: update, opgid: [current PGID], npgid: [new PGID] }</tt></p>
		<p>The server will send back a challenge, which consists of 2 authentication tokens encrypted to the current and new PGIDs respectively:</p>
		<p><tt>{ otoken: [authentication token encrypted using old PGID], otoken: [encrypted authentication token encrypted using new PGID] }</tt></p>
		<p>The client will now respond by sending the decrypted authentication tokens:</p>
		<p><tt>{ cmd: update, opgid: [current PGID], npgid: [new PGID], otoken: [auth token], ntoken: [auth token] }</tt></p>
		<p>If the authentication tokens are correct, the server will update the PGID to the new one.</p>
	<?php } ?>
	<input type="reset" value="Return to details" onclick="location.href='details.php'"/>
</body>
</html>
