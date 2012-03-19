<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * TestRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Server request - Test
 *
 * @class     -   TestRequest
 * @file      -   TestRequest.php
 * @location  -   ./server/request/TestRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class TestRequest extends Request {

    /**
     * Index.
     */
    public function index() {
        debug(__METHOD__);
    }

    public function me() {
        debug(__METHOD__);
    }

}
