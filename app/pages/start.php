<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * StartRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * App request page - Start
 *
 * @class     -   StartRequest
 * @file      -   StartRequest.php
 * @location  -   ./app/pages/StartRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class StartRequest extends Request {

    /**
     * Index.
     */
    public function index() {
        // Page layout
        $page = 'app';

        // Get the Userhandler instance
        $uh = $this->getUserHandler();

        // Get the gears instance
        $gears = $this->getGears();

        // UI variables
        $vars = array(
                'lang' => config('app')->lang,
                'version' => config('app')->version,
                'title' => lang('title'),
            // 'css' => 'app.css',
                'less' => 'app.less',
                'js' => 'app.js',
                'loggedin' => $uh->isLoggedin(),
                'user' => $uh->getUser(),
                'root' => $this->root,
                'uri' => $this->uri,

                'form_action' => 'user/login',
                'register' => 'user/register',
                'username' => Server::post('username'),
                'password' => Server::post('password'),
                'error' => $uh->getError()
        );

        $gears->bind($vars);
        $gears->setLayout($page)->display($page);
    }

    /**
     * Test
     */
    public function test() {
        debug($this->root, 'root');
        debug($this->uri, 'uri');
        debug(func_get_args(), 'parameter');
    }

}
