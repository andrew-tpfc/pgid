<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">You are now logged in</h1>
	</div>
	<div class="panel-body">
		<p>
			<button type="reset" class="btn btn-default" onclick="location.href='update.php'">Change ID</button>
			<button type="reset" class="btn btn-default" onclick="location.href='logout.php'"/>Logout</button>
		</p>
		<p>This is the session cookie set in your browser:</p>
		<p><code><?=$_COOKIE['sessionid'];?></code></p>
		<p>These are your user details in the database:</p>
		<div class="table-responsive">
			<table class="table table-condensed">
				<tr><td><b>Username</b></td><td><pre><?=$username;?></pre></td></tr>
				<tr><td><b>Password</b></td><td><pre><?=$password;?></pre></td></tr>
				<tr><td><b>Session ID</b></td><td><pre><?=$sessionid;?></pre></td></tr>
				<tr><td><b>Full name</b></td><td><pre><?=$fullname;?></pre></td></tr>
				<tr><td><b>Email address</b></td><td><pre><?=$email;?></pre></td></tr>
			</table>
		</div>
		<div class="alert alert-info" role="alert">
			<?php if (substr($password, 0, 5) != '-----') { ?>
				<li>The password is stored as a hashed value in the database.</li>
				<li>If the server is hacked, there is an urgent need to change the password.</li>
			<?php } else { ?>
				<li>The private key of the PGID is never transmitted over the network.</li>
				<li>The server stores the public key of the PGID.</li>
				<li>If the server is hacked, there is no need to change the PGID.</li>
			<?php } ?>
		</div>
	</div>
</body>
</html>
