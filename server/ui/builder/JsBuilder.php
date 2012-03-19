<?php
defined('ROOT') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * JsBuilder
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * @class     -   JsBuilder
 * @file      -   JsBuilder.php
 * @location  -   /server/ui/builder/JsBuilder.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class JsBuilder extends Builder {
    // Configuration options
    private $js_options = array(
        'file' => 'app',
        'ext' => '.js',
        'name' => 'Javascript Application File',
        'contentType' => 'Content-type: text/javascript; charset=UTF-8',
        'timestamp' => 'D M d H:i:s Y Z',
        'strict' => false,
        'minify' => false,
        'productive' => false,
        'debug' => false
    );

    // Template values for file creation
    private $js_tpl = array(
        'br' => "\n",
        'comment' => array(
            'cm' => "//",
            'ln' => "-----------------------------------------------------------------------------"
        ),
        'error' => array(
            'missing' => '### MISSING ###',
            'nofile' => 'failed to open stream: No such file or directory!'
        )
    );

    /**
     * Constructor
     */
    public function __construct($root = '') {
        // Extend options and template values
        $this->options = array_merge($this->options, $this->js_options);
        $this->tpl = array_merge($this->tpl, $this->js_tpl);

        parent::__construct($root);
    }

}
