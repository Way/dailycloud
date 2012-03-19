<style>
	form li {
		position: relative;
	}
	.show-password-link {
		display: block;
		position: absolute;
		z-index: 11;
	}
	.password-showing {
		position: absolute;
		z-index: 10;
	}
</style>

<div id="login">
	<fieldset>
		<legend>
			Register
		</legend>
		<form action="<?php echo $form_action;?>" method="post">
			<ol>
				<li>
					<label for="password">
						User
					</label>
					<input type="text" name="username" id="username" value="<?php echo $username;?>" />
				</li>

				<li>
					<label for="password">
						Pass
					</label>
					<input type="password" name="password" id="password" />
				</li>

				<li class="buttons">
					<input type="hidden" name="action" value="register" />
					<input type="submit" value="Register" />
					<a href="<?php echo $login;?>">Login</a>
				</li>
			</ol>
		</form>
	</fieldset>

	<?php if (isset($error) && sizeof($error) > 0) {
	?>
	<div class="error">
		<?php var_dump($error);?>
	</div>
	<?php } //endif error?>
</div>

<script src="<?php echo ROOT;?>app/js/jquery/jquery-1.6.1.min.js"></script>
<script src="<?php echo ROOT;?>app/js/jquery/plugins/jquery.showpassword.js"></script>
<script src="<?php echo ROOT;?>app/js/pages/register.js"></script>
