<?php
/**
 * TEST
 *
 * Error and Exception handling
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

// Call unknown variable
echo $unknown;

// Throw an exception
throw new Exception("Catch me", 1);

// Output and teardown test environment
$test->finish();
