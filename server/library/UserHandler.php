<?php
defined('AUTOLOAD') or exit('No direct access!');

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * UserActions
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Pseudo enumerations of available user actions.
 */
class UserActions {
    const Login = 'login';
    const Logout = 'logout';
    const Register = 'register';
    const Autologin = 'autologin';
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * UserHandler
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * @class     -   UserHandler
 * @file      -   UserHandler.php
 * @location  -   ./server/library/UserHandler.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class UserHandler {

    /**
     * Referrer for redirecting.
     *
     * @var string
     */
    private $_referer;

    /**
     * Name of the action to call.
     *
     * @var string
     */
    private $_action;

    /**
     * Flag to enable or disable autologin funtionality.
     *
     * @var bool
     */
    private $_autologin;

    /**
     * Current loaded user instance.
     *
     * @var User
     */
    private $_user;

    /**
     * List of happened error during handling any action.
     *
     * @var array
     */
    private $_error;

    /**
     * Constructor
     *
     * Set configuration values and start handling any user action if available.
     *
     * @param $referer (string) referer for redirecting
     * @param $action (string) name of the action to call
     * @param $autologin (bool) flag to enable or disable autologin funtionality (default true)
     */
    function __construct($referer = null, $action = null, $autologin = true) {
        $this->_referer = $referer;
        $this->_action = $action;
        $this->_autologin = $autologin;
        $this->_user = new User($this);

        if ($this->_action != null) {
            if (is_bool($this->_action)) {
                // Handle action set by GET or POST (if available)
                $this->_action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : null);
            }
            $this->handle();
        }
    }

    /**
     * Set an action command and call the action handler.
     *
     * @access public
     *
     * @param $action (string) - action name
     * @param $referer (string) - referer for redirecting
     */
    public function action($action, $referrer = null) {
        $this->_action = $action;
        if ($referrer != null) {
            $this->_referer = $referrer;
        }
        $this->handle();
    }

    /**
     * Check if current user is loggedin.
     *
     * @access public
     *
     * @return bool
     */
    public function isLoggedin() {
        return $this->_user->isLoggedin();
    }

    /**
     * Returns current loaded usermodel.
     * Add current session id to the model.
     *
     * @access public
     *
     * @return UserModel
     */
    public function getUser() {
        $model = $this->_user->getModel();
        $model->details = $this->_user->getDetails();
        $model->session_id = session_id();
        return $model;
    }

    /**
     * Handle any kind of action defined by its name.
     *
     * @access public
     *
     * @return void
     */
    public function handle() {
        switch ($this->_action) {
            case UserActions::Login:
                $this->handleLogin();
                break;
            case UserActions::Logout:
                $this->handleLogout();
                break;
            case UserActions::Register:
                $this->handleRegister();
                break;
            case UserActions::Autologin:
                $this->handleAutoLogin();
                break;
            default:
                $this->handleAuthentication();
                break;
        }
    }

    /**
     * Handle authentication depending on the users loggedin state.
     *
     * @access private
     *
     * @return bool
     */
    private function handleAuthentication() {
        if ($this->isLoggedin()) {
            // User already loggedin
            return true;
        }
        // User is NOT loggedin -> autologin?
        if ($this->_autologin) {
            return $this->handleAutoLogin();
        }
    }

    /**
     * Handle login request.
     *
     * @access private
     *
     * @return void
     */
    private function handleLogin() {
        // Cookie pleasured?
        $set_cookie = (isset($_POST['co']) && $_POST['co'] == 'on');

        // login credentials
        $username = isset($_POST['username']) ? $_POST['username'] : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';

        if ($this->_user->login($username, $password, $set_cookie)) {
            // login succeeded
            redirect($this->_referer);
        } else {
            $this->error('login failed');
        }
    }

    /**
     * Handle logout request.
     *
     * @access private
     *
     * @return void
     */
    private function handleLogout() {
        if ($this->_user->logout()) {
            // logout succeeded
            redirect($this->_referer);
        } else {
            $this->error('logout failed');
        }
    }

    /**
     * Handle register request.
     *
     * @access private
     *
     * @return void
     */
    private function handleRegister() {
        // register credentials
        $username = isset($_POST['username']) ? $_POST['username'] : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';

        if ($this->_user->register($username, $password)) {
            // registration succeeded
            redirect($this->_referer);
        } else {
            $this->error('registration failed');
        }
    }

    /**
     * Handle autologin.
     *
     * @access private
     *
     * @return void
     */
    private function handleAutoLogin() {
        $result = $this->_user->autoLogin();
        if ($result) {
            // autologin succeeded
            redirect($this->_referer);
        } else {
            #$this->error('autologin failed');
            // TODO Do we need to do something here if autologin failed?
        }
    }

    /**
     * Store current happened error.
     *
     * @access public
     *
     * @param $msg (string) error message
     * @param $type (string) error type
     * @return void
     */
    public function error($msg = null, $type = 'error') {
        if ($msg == null) {
            // Empty error call means there is no error -> clear errors
            $this->_error = array();
            return;
        }
        // Make errors more available and useable
        if (!isset($this->_error[$type])) {
            $this->_error[$type] = array();
        }

        // Prevent redundant errors
        if (!in_array($msg, $this->_error[$type])) {
            $this->_error[$type][] = $msg;
        }
    }

    /**
     * Get all stored errors.
     *
     * @access public
     *
     * @param $type (string) error type
     * @return array
     */
    public function getError($type = 'error') {
        if (isset($this->_error[$type])) {
            return $this->_error[$type];
        }
        return array();
    }

}
