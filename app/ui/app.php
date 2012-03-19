<!doctype html>
<html>
    <head>
        <meta charset="utf-8"/>
        <title><?php echo $title . ' ' . $version;?></title>
        <?php
        if (isset($css)) {
            echo Html::link($css, 'rel="stylesheet"');
        }

        if (isset($less)) {
            echo Html::link($less, 'rel="stylesheet/less"');
            echo Html::script('app/js/libs/less.min.js');
        }
        ?>
    </head>
    <body id="app">
        <?php echo $this->open('header');?>

        <?php
        if(!$loggedin) {
            echo $this->open('loginform');
        } else {
        ?>
        <div id="control">
            <?php echo $this->open('widgets/inputbar');?>
        </div>
        <div id="widgets">
            <!--<?php echo $this->open('widgets/datepicker');?>-->
        </div>
        <?php
        } //endif

        if (isset($js)) {
            echo Html::script($js);
            echo Html::script('app/js/init.js');
        }
        ?>
    </body>
</html>
