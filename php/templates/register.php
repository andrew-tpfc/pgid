<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">Register using password</h1>
	</div>
	<div class="panel-body">
		<p>Don't worry. There is minimal validation. You can type in any email address, even invalid ones, because it is not used.</p>
		<? if ($error != '') print '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-remove"></span> ' . $error . '</div>'; ?>
		<form role="form" method="post" action="register.php">
			<div class="form-group">
				<label for="username">Username</label>
				<input id="username" name="username" type="text" class="form-control" value="<?=$username;?>">
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input id="password" name="password" type="password" class="form-control" value="<?=$password;?>">
			</div>
			<div class="form-group">
				<label for="password2">Verify password</label>
				<input id="password2" name="password2" type="password" class="form-control" value="<?=$password2;?>">
			</div>
			<div class="form-group">
				<label for="fullname">Full name</label>
				<input id="fullname" name="fullname" type="text" class="form-control" value="<?=$fullname;?>">
			</div>
			<div class="form-group">
				<label for="email">Email address</label>
				<input id="email" name="email" type="email" class="form-control" value="<?=$email;?>">
			</div>
			<button type="submit" class="btn btn-default">Register</button>
			<button type="reset" class="btn btn-default" onclick="location.href='login.php'">Cancel</a>
		</form>
	</div>
</div>
<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">Register using PGID</h1>
	</div>
	<div class="panel-body">
		<p>Use the PGID browser addon/extension to register.</p>
		<p><img src="images/addon.png" align="center" style="max-width:100%" /></p>
		<p>Note that the HTML source has this line in its header:</p>
		<p><code>&lt;link rel="pgid-register" href="http://demo.pgid.org/pgid-register.php" /&gt;</code></p>
		<p>This indicates to the client that PGID registration is supported using the given URL.</p>
		<p>The client will first POST the following values to the URL in JSON format:</p>
		<p><code>{ cmd: register, pgid: [public key portion of PGID] }</code></p>
		<p>The server will send back a challenge, which is an authentication token encrypted using the public key:</p>
		<p><code>{ token: [encrypted authentication token] }</code></p>
		<p>The client will now respond by sending the decrypted authentication token:</p>
		<p><code>{ cmd: register, pgid: [public key portion of PGID], token: [authentication token] }</code></p>
		<p>If the authentication token matches, the server will display the registration form prefilled with the information in the PGID header (eg. full name, short name, email address etc.). The user will then have to register within a certain time limit before the authentication token expires.</p>
	</div>
</div>
