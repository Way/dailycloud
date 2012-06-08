<?php
/**
 * TEST
 *
 * Session functionality
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

// Access session data as usual
// Add data to the session
$_SESSION['mydata'] = 'my session data';

// Get session data
echo "Session id: " . session_id();
debug($_SESSION);

// Destroy session, automatically deleting session cookie and all session data
#Session::kill();

// Output and teardown test environment
$test->finish();
