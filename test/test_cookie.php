<?php
/**
 * TEST
 *
 * Cookie functionality
 */

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Load test environment
$test = new Test(__FILE__);

//
// START TEST
//

$testValue = 'My Cookie test value';

// Set cookie
Cookie::set('TestCookie', $testValue);

// Get cookie
$testCookie = Cookie::get('TestCookie');

debug($testCookie);
assert($testCookie == $testValue);
