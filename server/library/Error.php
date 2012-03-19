<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Error
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * @class     -   Error
 * @file      -   Error.php
 * @location  -   ./server/library/Error.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Error {

    private static $err = array(
            '' => 'Unknown Error',
            '100' => 'Continue',
            '101' => 'Switching Protocols',
            '200' => 'OK',
            '201' => 'Created',
            '202' => 'Accepted',
            '203' => 'Non-Authoritative Information',
            '204' => 'No Content',
            '205' => 'Reset Content',
            '206' => 'Partial Content',
            '300' => 'Multiple Choices',
            '301' => 'Moved Permanently',
            '302' => 'Moved Temporarily',
            '303' => 'See Other',
            '304' => 'Not Modified',
            '305' => 'Use Proxy',
            '400' => 'Bad Request',
            '401' => 'Unauthorized',
            '402' => 'Payment Required',
            '403' => 'Forbidden',
            '404' => 'Not Found',
            '405' => 'Method Not Allowed',
            '406' => 'Not Acceptable',
            '407' => 'Proxy Authentication Required',
            '408' => 'Request Time-Out',
            '409' => 'Conflict',
            '410' => 'Gone',
            '411' => 'Length Required',
            '412' => 'Precondition Failed',
            '413' => 'Request Entity Too Large',
            '414' => 'Request-URL Too Large',
            '415' => 'Unsupported Media Type',
            '500' => 'Server Error',
            '501' => 'Not Implemented',
            '502' => 'Bad Gateway',
            '503' => 'Out of Resources',
            '504' => 'Gateway Time-Out',
            '505' => 'HTTP Version not supported'
    );

    private function __construct() {
    }

    public static function handle($code = '', $notice = null) {
        $data = array(
                'error' => true,
                'code' => $code,
                'type' => self::$err[$code],
                'notice' => $notice
        );
        $data_json = json_encode($data);
        return $data_json;
    }

    public static function get($code) {
        if (isset(self::$err[$code])) {
            return self::$err[$code];
        }
        return $code;
    }

}
