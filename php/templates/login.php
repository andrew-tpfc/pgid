<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">Login using password</h1>
	</div>
	<div class="panel-body">
		<p>To login, you first need to <a href="register.php">register for an account</a>.</p>
		<? if ($error != '') print '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-remove"></span> ' . $error . '</div>'; ?>
		<form role="form" method="post" action="login.php">
			<div class="form-group">
				<label for="username">Username</label>
				<input id="username" name="username" type="text" class="form-control">
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input id="password" name="password" type="password" class="form-control">
			</div>
			<button type="submit" class="btn btn-default">Login</button>
		</form>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">Login using PGID</h1>
	</div>
	<div class="panel-body">
		<p>Use the PGID browser addon/extension to login.</p>
		<p><img src="images/addon.png" align="center" style="max-width:100%" /></p>
		<p>Note that the HTML source has this line in its header:</p>
		<p><code>&lt;link rel="pgid-login" href="http://demo.pgid.org/pgid-login.php" /&gt;</code></p>
		<p>This indicates to the client that PGID login is supported using the given URL.</p>
		<p>The client will first POST the following values to the URL in JSON format:</p>
		<p><code>{ cmd: login, pgid: [public key portion of PGID] }</code></p>
		<p>The server will send back a challenge, which is an authentication token encrypted using the public key:</p>
		<p><code>{ token: [encrypted authentication token] }</code></p>
		<p>The client will now respond by sending the decrypted authentication token:</p>
		<p><code>{ cmd: register, pgid: [public key portion of PGID], token: [authentication token] }</code></p>
		<p>If the authentication token matches, the server will allow login to proceed.</p>
	</div>
</div>
