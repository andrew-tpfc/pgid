<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title>Pretty Good Identity</title>
	<link rel="icon" href="images/favicon.png" />
	<link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
	<h1>You are logged into the system</h1>
	<p>This is the session cookie set in your browser:</p>
	<p><table><tr><td><b>Session ID</b></td><td><?=$_COOKIE['sessionid'];?></td></tr></table></p>
	<p>These are your user details in the database:</p>
	<p><table>
		<tr><td><b>Username</b></td><td><pre><?=$username;?><pre></td></tr>
		<tr><td><b>Password</b></td><td><pre><?=$password;?><pre></td></tr>
		<tr><td><b>Session ID</b></td><td><pre><?=$sessionid;?><pre></td></tr>
		<tr><td><b>Full name</b></td><td><pre><?=$fullname;?><pre></td></tr>
		<tr><td><b>Email address</b></td><td><pre><?=$email;?><pre></td></tr>
	</table></p>
	<?php if (substr($password, 0, 5) != '-----') { ?>
		<p>The password is properly hashed using PHP's <a href="http://docs.php.net//manual/en/function.password-hash.php">password_hash()</a> function.</p>
		<p>Therefore in theory the attacker should not be able to mount a dictionary attack on the hash.</p>
		<p>However, if the database ever gets hacked, you will still have to change your password because otherwise you will be sitting duck against a brute force attack on the hash.</p>
	<?php } else { ?>
		<p>The password field stores the public key of the generated PGID (which is essentially a 2048-bit RSA key-pair).</p>
		<p>Therefore even if the server is compromised, the attacker will only have your public key, which will not be a security risk i.e. the attacker will not be able to use that information to login as you.</p>
		<p>The private key is stored on your own computer. As long as you keep it secure, there will be no security risk.</p>
		<p>The private key is only used locally and never transmitted over the network. Hence, an attacker will not be able to intercept your private key by sniffing on your local network.</p>
	<?php } ?>
	<input type="reset" value="Update authentication credentials" onclick="location.href='update.php'"/>
	<input type="reset" value="Logout" onclick="location.href='logout.php'"/>
</body>
</html>
