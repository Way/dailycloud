<div id="login">
    <fieldset>
        <legend>
            Login
        </legend>
        <form action="<?php echo $form_action;?>" method="post">
            <p>
                <label for="username">
                    <?php echo lang('input_placeholder_username');?>
                </label>
                <input type="text" id="username" name="username" value="<?php echo $username;?>" placeholder="<?php echo lang('input_placeholder_username');?>" required="required" />
            </p>
            <p>
                <label for="password">
                    <?php echo lang('input_placeholder_password');?>
                </label>
                <input type="password" id="password" name="password" placeholder="<?php echo lang('input_placeholder_password');?>" required="required" />
            </p>
            <p>
                <label for="cookie">
                    <?php echo lang('input_placeholder_cookie');?>
                </label>
                <input type="checkbox" id="cookie" name="co" />
            </p>
            <input type="hidden" name="action" value="login" />
            <input type="submit" value="Login" />
            <a href="<?php echo $register;?>">Register</a>
        </form>
    </fieldset>
    <?php if (isset($error) && sizeof($error) > 0) {
    ?>
    <div class="error">
        <?php var_dump($error);?>
    </div>
    <?php } //endif error?>
</div>