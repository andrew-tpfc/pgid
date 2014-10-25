<?php if ($pgidfunc == 'pgid-updatepw') { ?>

<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">Update to new password</h1>
	</div>
	<div class="panel-body">
		<? if ($error != '') print '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-remove"></span> ' . $error . '</div>'; ?>
		<form role="form" method="post" action="update.php">
			<div class="form-group">
				<label for="opassword">Old password</label>
				<input id="opassword" name="opassword" type="password" class="form-control" value="<?=$opassword;?>">
			</div>
			<div class="form-group">
				<label for="npassword">New password</label>
				<input id="npassword" name="npassword" type="password" class="form-control" value="<?=$npassword;?>">
			</div>
			<div class="form-group">
				<label for="npassword2">Verify new password</label>
				<input id="npassword2" name="npassword2" type="password" class="form-control" value="<?=$npassword2;?>">
			</div>
			<button type="submit" class="btn btn-default">Update</button>
			<button type="reset" class="btn btn-default" onclick="history.go(-1)">Back</button>
		</form>
	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">Update to PGID</h1>
	</div>
	<div class="panel-body">
		<p>Use the PGID browser addon/extension to upgrade from password to PGID.</p>
		<p><img src="images/addon.png" align="center" style="max-width:100%" /></p>
		<p>The HTML source has this line in its header:</p>
		<p><code>&lt;link rel="pgid-updatepw" href="http://demo.pgid.org/pgid-updatepw.php" /&gt;</code></p>
		<p>This indicates that the client can use the given URL to update the login credentials.</p>
		<p>The client will first POST the following values to the URL in JSON format:</p>
		<p><code>{ cmd: updatepw, password: [current password], npgid: [new PGID] }</code></p>
		<p>An optional <i>username</i> parameter can be sent. Otherwise the server will try to use the session cookie to determine the username.</p>
		<p>The server will send back a challenge, which consists of an authentication token encrypted to the new PGID:</p>
		<p><code>{ token: [authentication token encrypted using nPGID] }</code></p>
		<p>The client will now respond by sending the decrypted authentication token:</p>
		<p><code>{ cmd: updatepw, password: [current password], npgid: [new PGID], token: [authentication token] }</code></p>
		<p>If the authentication token matches, the server will update the authentication credential to the given PGID.</p>
	</div>
</div>

<?php } else { ?>

<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">Update to another PGID</h1>
	</div>
	<div class="panel-body">
		<p>You are already using PGID to login.</p>
		<p>Use the PGID browser addon/extension to update your account in order to use another PGID to login.</p>
		<p><img src="images/addon.png" align="center" style="max-width:100%" /></p>
		<p>The HTML source has this line in its header:</p>
		<p><code>&lt;link rel="pgid-updatepw" href="http://demo.pgid.org/pgid-updatepw.php" /&gt;</code></p>
		<p>This indicates that the client can use the given URL to update the login credentials.</p>
		<p>The client will first POST the following values to the URL in JSON format:</p>
		<p><code>{ cmd: updatepw, password: [current password], npgid: [new PGID] }</code></p>
		<p>An optional <i>username</i> parameter can be sent. Otherwise the server will try to use the session cookie to determine the username.</p>
		<p>The server will send back a challenge, which consists of an authentication token encrypted to the new PGID:</p>
		<p><code>{ token: [authentication token encrypted using nPGID] }</code></p>
		<p>The client will now respond by sending the decrypted authentication token:</p>
		<p><code>{ cmd: updatepw, password: [current password], npgid: [new PGID], token: [authentication token] }</code></p>
		<p>If the authentication token matches, the server will update the authentication credential to the given PGID.</p>
		<button type="reset" class="btn btn-default" onclick="history.go(-1)">Back</button>
	</div>
</div>

<?php } ?>
