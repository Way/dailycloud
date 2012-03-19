<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * ErrorHandler
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Using static methods of a general Error handling class.
 *
 * @class     -   ErrorHandler
 * @file      -   ErrorHandler.php
 * @location  -   ./server/library/ErrorHandler.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class ErrorHandler extends Singleton {

    /**
     * Path to the template
     *
     * @const string
     */
    const view_error = 'errors/view_error.php';

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * Main Error Handler
     *
     * @param (int) $errno
     * @param (string) $errstr
     * @param (string) $errfile
     * @param (int) $errline
     */
    public static function handleError($errno, $errstr, $errfile, $errline) {
        if(($errno & error_reporting()) == 0)
            return ;

        $me = self::instance();

        switch ($errno) {
            case E_ERROR :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "ERROR");
                break;

            case E_WARNING :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "WARNING");
                break;

            case E_PARSE :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "PARSE ERROR");
                break;

            case E_NOTICE :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "NOTICE");
                break;

            case E_CORE_ERROR :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "CORE ERROR");
                break;

            case E_CORE_WARNING :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "CORE WARNING");
                break;

            case E_COMPILE_ERROR :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "COMPILE ERROR");
                break;

            case E_USER_ERROR :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "USER FATAL ERROR");
                exit();
                break;

            case E_USER_WARNING :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "USER WARNING");
                break;

            case E_USER_NOTICE :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "USER NOTICE");
                break;

            case E_STRICT :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "STRICT ERROR");
                break;

            case E_RECOVERABLE_ERROR :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "RECOVERABLE ERROR");
                break;

            case E_DEPRECATED :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "DEPRECATED ERROR");
                break;

            case E_USER_DEPRECATED :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "USER DEPRECATED ERROR");
                break;

            case E_ALL :
                $me->ErrorTemplate($errno, $errstr, $errfile, $errline, "ERROR");
                break;
        }

        // return true and don't execute internal error handler
        return TRUE;
    }

    /**
     * Error Template
     *
     * @param (mixed) $errno
     * @param (mixed) $errstr
     * @param (mixed) $errfile
     * @param (mixed) $errline
     * @param (mixed) $type
     */
    public static function ErrorTemplate($errno, $errstr, $errfile, $errline, $type) {
        ob_start();
        include (SERVER_UI_PATH . self::view_error);
        $buffer = ob_get_contents();
        ob_end_clean();

        // Optionally you can log this error here as well
        // log($type, $errstr, $errfile, $errline);

        echo $buffer;
    }

}
