<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Server
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * @class     -   Server
 * @file      -   Server.php
 * @location  -   ./server/library/Server.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Server {

    /**
     * Private constructor
     * This class should not be instantiated or cloned.
     */
    private final function __construct() {
    }

    private final function __clone() {
    }

    /**
     * Shiftlett to secure the fingerprint hash
     */
    const shiflett = 'SHIFLETT';

    /**
     * Returns the current requested (active) url.
     *
     * @since 1.0
     * @access public
     *
     * @return String
     */
    public static function getCurrentUrl() {
        return 'http' . ((!empty($_SERVER['HTTPS'])) ? 's' : '') . '://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
    }

    /**
     * Returns the remote ip address of the current user.
     *
     * @since 1.0
     * @access public
     *
     * @return String
     */
    public static function getIp() {
        if (isset($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } else if (isset($_SERVER['HTTP_FORWARDED'])) {
            return $_SERVER['HTTP_FORWARDED'];
        } else if (isset($_SERVER['HTTP_X_FORWARDED'])) {
            return $_SERVER['HTTP_X_FORWARDED'];
        } else if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else if (isset($_SERVER['REMOTE_ADDR'])) {
            return $_SERVER['REMOTE_ADDR'];
        } else {
            return '0.0.0.0';
        }
    }

    /**
     * Returns the user agent of the current user.
     *
     * @since 1.0
     * @access static
     *
     * @return string
     */
    public static function getUserAgent() {
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown User Agent';
        return $ua;
    }

    /**
     * Return a 'fingerprint' created by md5 hashing the current user agent and the current session id.
     *
     * @since 1.0
     * @access static
     *
     * @param $use_ip (bool) set true to include the ip into the fingerprint (default false)
     * @return string
     */
    public static function getFingerprint($use_ip = false) {
        $fingerprint = self::shiflett;
        $fingerprint .= self::getUserAgent();
        if ($use_ip) {
            $fingerprint .= self::getIp();
        }
        return md5($fingerprint);
    }

    /**
     * Return the current referer as url from where the current user has arrived to the page.
     *
     * @since 1.0
     * @access static
     *
     * @return string
     */
    public static function getReferer() {
        return isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
    }

    /**
     * Wrapper to ease the access to the global $_POST values.
     *
     * @since 1.0
     * @access static
     *
     * @return string
     */
    public static function post($key) {
        return isset($_POST[$key]) ? $_POST[$key] : null;
    }

    /**
     * Wrapper to ease the access to the global $_GET values.
     *
     * @since 1.0
     * @access static
     *
     * @return string
     */
    public static function get($key) {
        return isset($_GET[$key]) ? $_GET[$key] : null;
    }

    /**
     * Check if gzip if possible and productive mode is active.
     *
     * @since 1.0
     * @access public
     *
     * @return Boolean
     */
    public static function gzip() {
        $gzip = stripos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip');
        $gzip ? ob_start('ob_gzhandler') : ob_start();
    }

    /**
     * Forces the user's browser not to cache the results
     * of the current request.
     *
     * @since 1.0
     * @access public
     *
     * @return void
     */
    public static function disableCache() {
        header('HTTP/1.1 200 OK');
        header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
        header('Pragma: no-cache');
    }

    /**
     * Set expire header to far future to optimize
     * performance.
     *
     * @since 1.0
     * @access public
     *
     * @param $expire int - expire time in seconds (optional)
     * @param $modified int - last modified timestamp (optional)
     * @return void
     */
    public static function expireCache($expire = 86400, $modified = null) {
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $expire) . ' GMT');
        header('Cache-Control: maxage=' . $expire);
        header('Pragma: public');
        if ($modified != null) {
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
        }
    }

    /**
     * Set 304 not modified header in order to let the browser
     * use the cached version of the requested ressource.
     *
     * @since 1.0
     * @access public
     *
     * @return void
     */
    public static function cacheControl() {
        header("HTTP/1.1 304 Not Modified");
    }

    /**
     * Set header json conform and disable cache control.
     *
     * @since 1.1
     * @access public
     *
     * @return void
     */
    public static function jsonHeader() {
        self::disableCache();
        header('Content-type: application/json');
    }

    /**
     * Redirect request to the url.
     *
     * @since 1.1
     * @access public
     *
     * @return void
     */
    public static function redirect($url) {
        header('HTTP/1.1 301 Moved Permanently');
        header("Location:{$url}");
        exit();
    }

}
