<?php
/**
* TEST
*
* Request functionality
*/

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Start session
Session::init();

// Load test environment
$test = new Test(__FILE__);

//
// START TEST
//
// Handle request
$req = new RequestHandler();
$req->run();

// Output and teardown test environment
$test->finish();
