<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * UserRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * App request page - User
 *
 * @class     -   UserRequest
 * @file      -   UserRequest.php
 * @location  -   ./app/pages/UserRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class UserRequest extends Request {

    /**
     * Index.
     */
    public function index() {
    }

    public function login() {
        $uh = $this->getUserHandler();
        $uh->action(UserActions::Login, root_url());
        redirect();
    }

    public function logout() {
        $uh = $this->getUserHandler();
        $uh->action(UserActions::Logout, root_url());
    }

    public function register() {
        $uh = $this->getUserHandler();

        // Get the gears instance
        $gears = $this->getGears();

        $vars = array(
            '' => '',
            'form_action' => '',
            'login' => root_url(),
            'username' => isset($_POST['username']) ? $_POST['username'] : '',
            'password' => isset($_POST['password']) ? $_POST['password'] : '',
            'error' => $uh->getError()
        );

        $page = 'register';
        $gears->bind($vars)->setLayout($page)->display($page);
    }

    public function debug() {
        $user = $this->getUser();
        debug($user);
    }

}
