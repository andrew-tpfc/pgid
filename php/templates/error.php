<div class="panel panel-default">
	<div class="panel-heading">
		<h1 class="panel-title">Error</h1>
	</div>
	<div class="panel-body">
		<? if ($error != '') print '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-remove"></span> ' . $error . '</div>'; ?>
		<button type="reset" class="btn btn-default" onclick="history.go(-1)">Back</button>
	</div>
</div>
