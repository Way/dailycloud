<?php

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Index
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * @package dailyd
 * @version 1.0
 */
define('INDEX', pathinfo(__FILE__, PATHINFO_BASENAME));

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Server path
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Resolve the system path for increased reliability.
 */
$server_path = 'server';
if (realpath($server_path) !== FALSE) {
    $server_path = realpath($server_path) . '/';
}
define('SERVER_PATH', str_replace('\\', '/', rtrim($server_path, '/') . '/'));

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Require autoload.php
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Enable autoloading and include types.php automatically.
 */
require_once (SERVER_PATH . 'autoload.php');

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Require bootstrap.php
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Bootstrap the server request.
 */
require_once (SERVER_PATH . 'bootstrap.php');
