<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * PubnubHandler
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Handles the pubnub connection and publishs events.
 *
 * @class     -   PubNubHandler
 * @file      -   PubNubHandler.php
 * @location  -   ./server/library/PubNubHandler.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class PubNubHandler extends Singleton {

    /**
     * Pubnub instance.
     */
    private $_pubnub;

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * Ensure an active pubnub connection.
     *
     * @access private
     *
     * @return Pubnub active pubnub instance
     */
    private function pubnub() {
        if ($this->_pubnub == null) {
            $cfg = (config('service')->pubnub);
            $this->_pubnub = new Pubnub($cfg['publish_key'], $cfg['subscribe_key']);
        }
        return $this->_pubnub;
    }

    /**
     * Publish a message to a channel.
     *
     * @access public
     *
     * @param string $channel
     * @param array $message
     * @return void
     */
    public function publish($channel, $message) {
        $this->pubnub()->publish(array(
            'channel' => $channel,
            'message' => $message
        ));
    }

}
