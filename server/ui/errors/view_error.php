<?php
$style_error = array('background-color: #eee', 'border: 2px solid #dedede', 'color: #333', 'font-family: verdana', 'font-size: 12', 'padding: 10px', 'margin: 5px auto', 'width: 50%');
$style_error_type = array('color: #B72F09');
?>

<div style="<?php echo join(';', $style_error);?>">

<b style="<?php echo join(';', $style_error_type);?>">[<?php echo ucwords(strtolower($type));?>]:</b> <?php echo $errstr;?> <br />
<b>File:</b> <?php echo $errfile;?><br />
<b>Line:</b> <?php echo $errline;?>

</div>