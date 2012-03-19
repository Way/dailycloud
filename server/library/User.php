<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * User
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * @class     -   User
 * @file      -   User.php
 * @location  -   ./server/library/User.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 *                1.1 added UserDetailsModel
 */
class User {

    private $_handler;
    private $_model;
    private $_details;

    function __construct($handler = null) {
        $this->_handler = $handler;
    }

    public function isLoggedin() {
        if (isset($_SESSION['loggedin']) && isset($_SESSION['userid'])) {
            return $_SESSION['loggedin'] && !empty($_SESSION['userid']);
        }
        return false;
    }

    public function getUserId() {
        return isset($_SESSION['userid']) ? $_SESSION['userid'] : null;
    }

    public function getModel() {
        if ($this->isLoggedin()) {
            if (empty($this->_model)) {
                $this->_model = UserModel::createDirectly(array('id' => $this->getUserId()));
            }
            return $this->_model;
        }

        // User is not logged in
        return $this->_model = null;
    }

    public function getDetails() {
        if ($this->isLoggedin()) {
            if (empty($this->_details)) {
                $this->_details = UserDetailsModel::createDirectly(array('id' => $this->getUserId()));
            }
            return $this->_details;
        }

        // User is not logged in
        return $this->_details = null;
    }

    public function auth() {
        //debug($this->_model, __METHOD__);

        // Is the users model loaded with valid user id?
        if ($this->_model == null || !isset($this->_model->id)) {
            // no valid user(model) loaded
            return false;
        }

        // Is the users fingerprint valid?
        $fingerprint = Server::getFingerprint();
        if (isset($_SESSION['fingerprint'])) {
            if ($_SESSION['fingerprint'] != $fingerprint) {
                // fingerprint invalid
                return false;
            }
        } else {
            $_SESSION['fingerprint'] = $fingerprint;
        }

        // Update last login stamp
        $this->_model->last_login = time();
        if ($this->_model->update()) {
            // set user session variables
            $_SESSION['loggedin'] = true;
            $_SESSION['userid'] = $this->_model->id;
            $_SESSION['username'] = $this->_model->username;

            // User authentication succeeded!
            return true;
        }

        // User authentication failed!
        return false;
    }

    public function autoLogin() {
        // Get user autologin id from cookie
        $uid = Cookie::get('uid');
        // debug($uid, __METHOD__);

        // Without a uid or with an existing try to autologin abort this try
        if (empty($uid) || isset($_SESSION['autologin'])) {
            return false;
        }

        // split user token and its hashed user id and fingerprint
        $pos = strrpos($uid, '-');
        $token_id = substr($uid, 0, $pos);
        $fingerprint = substr($uid, $pos + 1);

        // split token_id again to get the token and the id separated
        $pos = strrpos($token_id, '-');
        $token = substr($token_id, 0, $pos);
        $id_hashed = substr($token_id, $pos + 1);

        // get user by its token
        $user = UserModel::search(array('token' => $token));
        if (!$user || sizeof($user) == 0) {
            // no user found!
            return false;
        }

        // user found -> there have to be only one found!
        $this->_model = new UserModel();
        $this->_model->create($user[0]);

        // Authenticate found user by checking its secret with the given token
        $id = $this->_model->id;
        $secret = $this->_model->secret;
        $token_hashed = Security::saltTheHash($token, $secret);

        // user id, its token and its fingerprint has to be valid in order to auth and autologin successfully
        $valid_id = $id_hashed == sha1($id);
        $valid_token = $token_hashed == $secret;
        $valid_fingerprint = $fingerprint == Server::getFingerprint();
        // debug($valid_id, __METHOD__);
        // debug($valid_token, __METHOD__);
        // debug($valid_fingerprint, __METHOD__);
        // debug($fingerprint, __METHOD__);

        if ($valid_id && $valid_token && $valid_fingerprint) {
            $_SESSION['autologin'] = true;
            return $this->auth();
        }

        // Store in session that the autologin request failed to prevent endless trying
        $_SESSION['autologin'] = false;
        return false;
    }

    public function login($username, $password, $set_cookie = false) {
        // username
        $vars['username'] = htmlspecialchars(trim($username));

        // password
        $vars['password'] = md5(htmlspecialchars(trim($password)));

        // salted hash (password verschluesselt)
        $vars['salted_hash'] = Security::saltTheHash($vars['password']);

        // Validate credentials
        if (strlen($vars['username']) == 0 || strlen($vars['password']) == 0 || !$this->checkString($vars['username'])) {
            // invalid input
            $this->_handler->error('Username and Password are mandatory');
            return false;
        }

        // get user by its username
        $user = UserModel::search(array('username' => $vars['username']));
        if (!$user || sizeof($user) == 0) {
            // no user found!
            $this->_handler->error('Unknown username');
            return false;
        }

        // user found! -> there can be only one
        $user = $user[0];

        // Check password (by comparing salted hash)
        $id = $user->id;
        $name = $user->username;
        $pass = $user->password;

        // Create salted password hash
        $pwSalted = Security::saltTheHash($vars['password'], $pass);
        if ($pwSalted == $pass) {
            // Password match! -> create new user model out of the user
            $this->_model = new UserModel();
            $this->_model->create($user);

            if ($set_cookie) {
                // cookie value will be composed by the users token, its hashed id and the hashed fingerprint
                $cookie_value = $user->token . '-' . sha1($id) . '-' . Server::getFingerprint(false);
                Cookie::set('uid', $cookie_value);
            }
            // User authentifieren
            $this->_handler->error();
            return ($this->auth());
        }

        // password invalid
        $this->_handler->error('Invalid password');
        return false;
    }

    public function logout() {
        // delete cookie
        if (Cookie::get('uid')) {
            Cookie::remove('uid');
        }

        // Unset all of the session variables.
        $_SESSION = array();

        // If it's desired to kill the session, also delete the session cookie.
        // Note: This will destroy the session, and not just the session data!
        if (ini_get('session.use_cookies')) {
            Cookie::remove(session_name());
        }

        // Finally, destroy the session.
        session_destroy();

        return true;
    }

    public function register($username, $password) {
        // username
        $vars['username'] = htmlspecialchars(trim($username));

        // password
        $vars['password'] = md5(htmlspecialchars(trim($password)));

        // salted hash (password verschluesselt)
        $vars['salted_hash'] = Security::saltTheHash($vars['password']);

        // Validate credentials
        if (strlen($vars['username']) == 0 || strlen($vars['password']) == 0 || !$this->checkString($vars['username'])) {
            $this->_handler->error('Username and Password are mandatory');
            return false;
        }

        // Check if user already registered
        $foundUser = UserModel::search(array('username' => $vars['username']));
        if (sizeof($foundUser) > 0) {
            // User with this username already exists!
            $this->_handler->error('User with this username already exists');
            return false;
        }

        // Generate user token and secret
        $token = substr(trim($this->guid(), '{}'), 0, 36);
        $secret = Security::saltTheHash($token);

        // Set user values
        $values = array(
            'created' => time(),
            'username' => $vars['username'],
            'password' => $vars['salted_hash'],
            'token' => $token,
            'secret' => $secret
        );

        // Create and save new user
        $this->_model = new UserModel();
        $this->_model->create($values);
        if ($this->_model->save()) {
            // User registered successfully
            return true;
        }

        // Registration failed
        $this->_handler->error('Registration failed');
        return false;
    }

    private function checkString($str) {
        return (preg_match('/^[a-zA-Z0-9\-\_]+$/', $str));
    }

    private function guid() {
        if (function_exists('com_create_guid')) {
            return (com_create_guid());
        }
        mt_srand((double)microtime() * 10000);
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hyphen = chr(45);
        $uuid = chr(123) . substr($charid, 0, 8) . $hyphen . substr($charid, 8, 4) . $hyphen . substr($charid, 12, 4) . $hyphen . substr($charid, 16, 4) . $hyphen . substr($charid, 20, 12) . chr(125);
        return $uuid;
    }

}
