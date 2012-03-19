<?php

require_once ('../autoload.php');

// Create new constant JS_PATH which defines the path to the js files
define('JS_PATH', APP_PATH . 'js/');

// Create a js builder instance to load cached or build new js file
$builder = new JsBuilder(JS_PATH);
$builder->set('productive', is_productive());
$builder->set('debug', false);
$builder->setup('scaffold.json')->output();
