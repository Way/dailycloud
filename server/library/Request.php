<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Request
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Abstract class which grants the existence of all necessary methods
 * in a user defined request class.
 *
 * @class     -   Request
 * @file      -   Request.php
 * @location  -   ./server/library/Request.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */

/**
 * Request
 */
abstract class Request {
    // URI of this request
    public $uri;

    // Root url of this request (without request parameters)
    public $root;

    // Method prefix of this request
    public $prefix;

    // Template gears
    private $_gears;

    // Userhandler
    private $_userhandler;

    /**
     * Index - used as default method
     *
     * @access public
     * @return void
     */
    public function index() {
        throw_exception(new RequestException(__METHOD__ . ' is called. Go and implement this method in your requested class!'));
    }

    /**
     * Getter for the template gears.
     * Create instance on first call.
     */
    protected function getGears() {
        if (null == $this->_gears) {
            $this->_gears = new Gears(APP_UI_PATH, 'php');
        }
        return $this->_gears;
    }

    /**
     * Getter for the userhander.
     * Create instance on first call.
     */
    protected function getUserHandler() {
        if (null == $this->_userhandler) {
            $this->_userhandler = new UserHandler($this->uri, true);
        }
        return $this->_userhandler;
    }

    /**
     * Getter for the current user.
     * NOTE: If the user is not loggedin an error will be raised
     * which will interrupt the current request by an exit!
     */
    protected function getUser() {
        $uh = $this->getUserHandler();
        if (!$uh->isLoggedin()) {
            return $this->error(L::error_user_not_logged_in, L::error_type_default, true);
        }
        return $uh->getUser();
    }

    /**
     * Encode a data string to json and output it.
     * Use the second parameter with TRUE to return the
     * encoded json string instead of echo it.
     */
    protected function json($value, $return = false) {
        header('Status: 200');
        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Content-type: application/json');
        $json = json_encode($value);
        if ($return) {
            return $json;
        }
        echo $json;
    }

    /**
     * Exit current execution caused by an error.
     * Put error message to the output.
     */
    protected function error($msg, $type = L::error_type_default, $exit = false) {
        $this->json(array(
            'error' => true,
            'type' => $type,
            'message' => $msg
        ));
        if ($exit) {
            exit();
        }
    }

}

/**
 * RequestException
 */
class RequestException extends Exception {
    public $type = __CLASS__;
}
