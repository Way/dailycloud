<?php
defined('AUTOLOAD') or exit('No direct access!');

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Application Environment
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Set type of environment configuration. This also influences
 * things like logging and error reporting.
 * Possible options:
 * - development
 * - testing
 * - production
 */
define('ENVIRONMENT', ApplicationEnvironment::DEVELOPMENT);
#define('ENVIRONMENT', ApplicationEnvironment::PRODUCTIVE);

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Root
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Set the root path of the system.
 */
if (is_localhost()) {
    define('ROOT', 'http://localhost/dailycloud/');
} else {
    define('ROOT', 'http://cloud.dailyd.de/');
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Database connection settings
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * localhost - for developing on localhost
 * online - for productive online mode
 */
if (is_localhost()) {
    config('db', array(
            'dns' => 'mysql:host=localhost;dbname=dailycloud',
            'host' => 'localhost',
            'username' => 'root',
            'password' => '',
            'dbname' => 'dailycloud',
            'prefix' => ''
    ));
} else {
    config('db', array(
            'dns' => 'mysql:host=localhost;dbname=dailyd_cloud',
            'host' => 'localhost',
            'username' => 'dailyd_admin',
            'password' => 'justmysql2010',
            'dbname' => 'dailyd_cloud',
            'prefix' => ''
    ));
}

/**
 * Application settings
 */
config('app', array(
        'version' => '0.1',
        'lang' => 'en',
        'theme' => 'default'
));

/**
 * Services
 */
config('service', array('webshot' => 'http://way.dyndns-ip.com/webshot/webshot.php'));

/**
 * Cookie settings
 */
config('cookie', array(
        'path' => '/',
        'time' => 3600 * 24 * 7
));
