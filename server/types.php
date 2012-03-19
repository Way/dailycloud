<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Types
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Define server constants like system paths and settings.
 * Contains types to ease the handling and configuration.
 *
 * @package dailyd
 * @version 1.0
 */

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Server path
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Will be set in the index.php by default.
 */
if(!defined('SERVER_PATH')) {
    $server_path = pathinfo(__FILE__, PATHINFO_DIRNAME);
    define('SERVER_PATH', str_replace('\\', '/', rtrim($server_path, '/') . '/'));
}

// Self file name
define('SELF', pathinfo(__FILE__, PATHINFO_BASENAME));

// Base path
define('BASE_PATH', rtrim(dirname(SERVER_PATH), '/') . '/');

// Application paths
define('APP_PATH', BASE_PATH . 'app/');
define('TEST_PATH', BASE_PATH . 'test/');

// UI paths
define('SERVER_UI_PATH', SERVER_PATH . 'ui/');
define('APP_UI_PATH', APP_PATH . 'ui/');
define('UI_PATH', str_replace(BASE_PATH, '', SERVER_UI_PATH));

// File Extension and separator
define('EXT', '.php');
define('DS', '/');

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Application Environment
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Type of environment configuration for the application.
 */
abstract class ApplicationEnvironment {
    const __default = 0;

    const DEVELOPMENT = 0;
    const TESTING = 1;
    const PRODUCTIVE = 2;

    public static function toString() {
        if(defined('ENVIRONMENT')) {
            switch (ENVIRONMENT) {
                case self::DEVELOPMENT :
                    return 'Development';
                case self::TESTING :
                    return 'Testing';
                case self::PRODUCTIVE :
                    return 'Productive';
                default :
                    return 'Unknown';
            }
        }
        return null;
    }

}
