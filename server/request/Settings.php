<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * SettingsRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Server request - Test
 *
 * @class     -   SettingsRequest
 * @file      -   SettingsRequest.php
 * @location  -   ./server/request/SettingsRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class SettingsRequest extends Request {

    /**
     * pubnub.
     */
    public function pubnub() {
        // Requires user authentication
        $this->getUser();

        return $this->json(config('service')->pubnub);
    }

}
