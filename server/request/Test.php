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

    /**
     * PubNub test.
     */
    public function pubnub() {
        // Get the pubnub service config.
        $cfg =  config('service')->pubnub;

        // Initialize PubNub.
        $pubnub = new Pubnub($cfg['publish_key'], ## publish key
        $cfg['subscribe_key'], ## subscribe key
        '', ## secret key
        false ## ssl
        );

        // Request messages (history)
        $messages = $pubnub->history(array(
            'channel' => 'my_channel', ## REQUIRED Channel to Send
            'limit' => 100 ## OPTIONAL Limit Number of Messages
        ));
        var_dump($messages);
        ## Prints array of messages.

        // Receive message (subscribe) - PHP 5.2.0 (this will block!)
        // $pubnub->subscribe(array(
        // 'channel'  => 'my_channel',        ## REQUIRED Channel to Listen
        // 'callback' => create_function(      ## REQUIRED PHP 5.2.0 Method
        // '$message',
        // 'var_dump($message); return true;'
        // )
        // ));

        // Receive message (subscribe) - PHP 5.3.0 (this will block!)
        // $pubnub->subscribe(array(
        // 'channel'  => 'my_channel',        ## REQUIRED Channel to Listen
        // 'callback' => function($message) {  ## REQUIRED Callback With Response
        // var_dump($message);  ## Print Message
        // return true;         ## Keep listening (return false to stop)
        // }
        // ));

        // Send message.
        $info = $pubnub->publish(array(
            'channel' => 'my_channel', ## REQUIRED Channel to Send
            'message' => 'Hey World!' ## REQUIRED Message String/Array
        ));
        var_dump($info);
    }

}
