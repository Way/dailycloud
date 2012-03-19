<?php

require_once ('../autoload.php');

// Create new constant CSS_PATH which defines the path to the css files
define('CSS_PATH', APP_PATH . sprintf('theme/%s/',  config('app')->theme));

// Create a css builder instance to load cached or build new css file
#$builder = new CssBuilder();
$builder = new CssBuilder(CSS_PATH);
$builder->set('productive', is_productive());
$builder->set('debug', false);
$builder->setup('scaffold.json')->output();
