<?php

// Send the Content-Type HTTP header.
header('Content-Type: text/html;charset=utf-8');

// Set a default timezone for PHP.
date_default_timezone_set('UTC');

// Increase the error reporting level to catch all errors
error_reporting(E_ALL);

// Register own error and exception handler to handle
// all errors and exceptions gracefully.
set_error_handler( array('ErrorHandler', 'handleError'));
set_exception_handler( array('ExceptionHandler', 'handleException'));

// Register shutdown function to handle fatal errors gracefully
register_shutdown_function('shutdownFunction');
function shutDownFunction() {
    $error = error_get_last();
    if($error['type'] == 1) {
        print_r($error);
    }
}

// Secure cookies
Cookie::secure('o"WJqMndjl|(!~k\GNoa8TNZCsht@');
