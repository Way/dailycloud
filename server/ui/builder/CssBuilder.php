<?php
defined('ROOT') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * CssBuilder
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * @class     -   CssBuilder
 * @file      -   CssBuilder.php
 * @location  -   /server/ui/builder/CssBuilder.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class CssBuilder extends Builder {
    // Configuration options
    private $css_options = array(
        'file' => 'app',
        'ext' => '.css',
        'name' => 'Stylesheet Application File',
        'contentType' => 'Content-type: text/css; charset=UTF-8',
        'timestamp' => 'D M d H:i:s Y Z',
        'minify' => false,
        'productive' => false,
        'debug' => false
    );

    // Template values for file creation
    private $css_tpl = array(
        'br' => "\n",
        'comment' => array(
            'cm' => " *",
            'start' => '/*',
            'end' => ' */',
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
        $this->options = array_merge($this->options, $this->css_options);
        $this->tpl = array_merge($this->tpl, $this->css_tpl);

        parent::__construct($root);
    }

}
