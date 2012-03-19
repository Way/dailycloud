<?php
/**
 * TEST
 *
 * Auth functionality
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

// Userhandler
$uh = new UserHandler($test->getPath(), true);

// Gears
$gears = new Gears(APP_UI_PATH, 'php');

if($uh->isLoggedin()) {

    $gears->bind( array('user' => $uh->getUser(),
        'username' => $uh->getUser()->username,
        'logout' => '?action=logout'));
    $gears->setLayout('user')->display('user');

} else {
    if(isset($_GET['register'])) {
        // Register form
        $gears->bind( array('form_action' => '',
            'login' => $test->getPath(),
            'username' => isset($_POST['username']) ? $_POST['username'] : '',
            'password' => isset($_POST['password']) ? $_POST['password'] : '',
            'error' => $uh->getError()));
        $gears->setLayout('register')->display('register');
    } else {
        // Login form
        $gears->bind( array('form_action' => '',
            'register' => '?register',
            'username' => isset($_POST['username']) ? $_POST['username'] : '',
            'password' => isset($_POST['password']) ? $_POST['password'] : '',
            'error' => $uh->getError()));
        $gears->setLayout('login')->display('login');
    }
}
