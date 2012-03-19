<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Cookie
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Cookie access class
 *
 * @class     -   Cookie
 * @file      -   Cookie.php
 * @location  -   ./server/library/Cookie.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Cookie extends Singleton {

    /**
     * Cookie parameters
     *
     * @var array
     */
    private $_params;

    /**
     * Use SafeCookie to ensure and encrypt cookies
     *
     * @var boolean
     */
    private $_safe = false;

    /**
     * SafeCookie super key
     *
     * @var string
     */
    private $_safe_key = null;

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * Secure cookies by enabling safe mode and using the SafeCookie class
     * for setting and getting cookies.
     *
     * @access public
     *
     * @param $key string - cookie secure key
     */
    public static function secure($key) {
        SafeCookie::setSuperKey($key);
        self::instance()->_safe_key = $key;
        self::instance()->_safe = true;
    }

    /**
     * Static wrapper function to access class method.
     */
    public static function set($name, $value, $time = null) {
        return self::instance()->setCookie($name, $value, $time = null);
    }

    /**
     * Static wrapper function to access class method.
     */
    public static function get($name) {
        return self::instance()->getCookie($name);
    }

    /**
     * Static wrapper function to access class method.
     */
    public static function remove($name) {
        return self::instance()->unsetCookie($name);
    }

    /**
     * Setter for a cookie with its name and value.
     *
     * @access public
     *
     * @param $name string
     * @param $value mixed
     * @param $time int (optional)
     */
    public function setCookie($name, $value, $time = null) {
        if ($time == null) {
            $time = (config('cookie')->time);
        }

        if ($this->_params == null) {
            $this->_params = session_get_cookie_params();
        }
        $cookie_params = $this->_params;
        $cookie_params['name'] = $name;
        $cookie_params['time'] = time() + $time;
        $cookie_params['value'] = $value;
        $cookie_params['path'] = (config('cookie')->path);

        if ($this->_safe) {
            // Use the SafeCookie class to ensure safe cookies
            SafeCookie::set(array(
                    $cookie_params['name'],
                    $cookie_params['value'],
                    $time,
                    $cookie_params['path']
            ), $this->_safe_key);
        } else {
            setcookie($cookie_params['name'], $cookie_params['value'], $cookie_params['time'], $cookie_params['path'], $cookie_params['domain'], $cookie_params['secure'], $cookie_params['httponly']);
        }
    }

    /**
     * Getter for a cookie with its name.
     *
     * @access public
     *
     * @param $name string
     */
    public function getCookie($name) {
        $reval = null;
        if ($this->_safe) {
            // Use the SafeCookie class to ensure safe cookies
            if (SafeCookie::validate($name)) {
                $reval = SafeCookie::get($name, $this->_safe_key);
            }
        } else if (isset($_COOKIE[$name])) {
            $reval = $_COOKIE[$name];
        }

        return $reval;
    }

    /**
     * Unset a cookie value by removing its value and negate its alive time.
     *
     * @access public
     *
     * @param $name string
     */
    public function unsetCookie($name) {
        $this->set($name, '', time() - 42000);
    }

}
