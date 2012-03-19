<?php
defined('ROOT') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Server initialization
 *---------------------------------------------------------------
 *
 * System loading file setups locale language and version number,
 * sets system paths and loads application file.
 *
 * @package dailyd
 * @version 1.0
 */

// Enable autoload
require_once (SERVER_PATH . 'autoload.php');

// Start the session.
Session::init();

// Start up output buffering in order to take advantage of output compression,
// as well as the ability to dynamically change HTTP headers after output has started.
ob_start();

// Enable global diagnostic.
Diagnostic::instance()->start();

// Load language (i18n)
Language::init();

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Handle environment
 *---------------------------------------------------------------
 *
 * Loading environemt settings and configure error reporting.
 *
 * Different environments will require different levels of error reporting.
 * By default development will show errors but testing and production will hide them.
 */
if (defined('ENVIRONMENT')) {
    switch (ENVIRONMENT) {
        case ApplicationEnvironment::TESTING:
            error_reporting(E_ALL);
            //
            // Load tests.
            //
            require_once (TEST_PATH . 'index' . EXT);
            break;

        case ApplicationEnvironment::DEVELOPMENT:
        //
        // Load application.
        // Report all errors.
        //
            RequestHandler::run(E_ALL);
            break;

        case ApplicationEnvironment::PRODUCTIVE:
        //
        // Load application.
        // Prevent error reporting.
        //
            RequestHandler::run(0);
            break;

        default:
            exit('The application environment is not set correctly.');
    }
}

// Flush (send) the output buffer.
$buffer = ob_get_clean();
echo $buffer;

// Finish global diagnostic.
Diagnostic::instance()->finish();
