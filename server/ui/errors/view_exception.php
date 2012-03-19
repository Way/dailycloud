<?php
$style_exception = array('background-color: #eee', 'border: 2px solid #dedede', 'color: #333', 'font-family: verdana', 'font-size: 12', 'padding: 10px', 'margin: 5px auto');
$style_exception_type = array('color: #B72F09');
?>

<div style="<?php echo join(';', $style_exception);?>">

<b style="<?php echo join(';', $style_exception_type);?>">[<?php echo $type;?>] </b> <?php echo $e->getMessage();?>
<br /><br />
<?php if($e->getCode() != 0)  { ?>
<b>Code:</b> <?php echo $e->getCode();?>
<br />
<?php }?>
<b>File:</b> <?php echo $e->getFile();?>
<br />
<b>Line:</b> <?php echo $e->getLine();?>

<pre><?php echo $e; ?></pre>

</div>