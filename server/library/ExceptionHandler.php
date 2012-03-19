<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * ExceptionHandler
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Using static methods of a general Exception handling class.
 *
 * @class     -   ExceptionHandler
 * @file      -   ExceptionHandler.php
 * @location  -   ./server/library/ExceptionHandler.php
 * @package   -   DailyD
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */

/**
 * class ExceptionHandler
 * extends Exception
 *
 */
class ExceptionHandler extends Singleton {

    /**
     * Path to the template
     *
     * @const string
     */
    const view_exception = 'errors/view_exception.php';

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * Main Exception Handler
     *
     * @param (Exception) $e
     */
    public static function handleException(Exception$e) {
        self::instance()->printException($e);
    }

    /**
     * Print Exception to screen
     *
     * @param (Exception) $e
     */
    public static function printException(Exception$e) {
        $type = isset($e->type) ? $e->type : 'Exception';

        ob_start();
        include (SERVER_UI_PATH . self::view_exception);
        $buffer = ob_get_contents();
        ob_end_clean();

        // Optionally you can log this exception here as well
        // log('Exception', $e->getMessage(), $e->getFile(), $e->getLine());

        echo $buffer;
    }

}
