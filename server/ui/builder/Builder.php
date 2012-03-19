<?php
defined('ROOT') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Builder
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Abstract builder class to generate a file out of a list of files.
 *
 * @class     -   Builder
 * @file      -   Builder.php
 * @location  -   ./server/ui/builder/Builder.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
abstract class Builder {
    // Configuration options
    protected $options = array(
        'prefix_plain' => 'plain',
        'prefix_http' => 'http://'
    );

    // Template values for file creation
    protected $tpl = array();

    // Root which will be used for adding new files
    public $root;

    // Contains any errors
    public $error = array();

    // Contains all files
    public $files = array();

    // Contains all filenames
    public $names = array();

    // cache file
    public $cache_file;

    // cache time (for 1 week
    public $cache_time;

    // Built output
    public $output;

    // Scaffold root elements which will be ignored on parsing
    public $scaffold_root_elements = array(
        'version',
        'http',
        'files'
    );

    /**
     * Constructor
     */
    public function __construct($root = '') {
        // Set relative root path to the directory where the files to build are located
        $this->root = $root;

        // Adjust options with the current settings
        $this->set('lang', (config('app')->lang));

        // Adjust ext(ionson) option by parsing it to an array if it is a simple string
        // This way allows the builder to handle multiple extensions.
        // The generated file will use the first entry of the ext array as its extension.
        if (is_array($this->get('ext')) === false) {
            $this->set('ext', array($this->get('ext')));
        }
    }

    /**
     * Setup builder.
     *
     * @param string $scaffold_file
     */
    public function setup($scaffold_file = '') {
        Diagnostic::instance()->start(__CLASS__);

        // Set scaffold file
        $this->scaffold_file = $this->root . $scaffold_file;

        // Check existence of a cached file
        $this->cache_file = SERVER_PATH . 'cache/' . basename($this->get('file')) . $this->get('ext', 0);

        // Handle cache header and time
        if ($this->get('productive')) {
            Server::expireCache();
            $this->cache_time = 86400;
        } else {
            Server::disableCache();
            $this->cache_time = 0;
        }

        // Chaining...
        return $this;
    }

    /**
     * Output built js file.
     */
    public function output() {
        $modified = 0;
        if (file_exists($this->cache_file)) {
            $modified = filemtime($this->cache_file);
        }

        $is_productive = $this->get('productive') && !$this->get('debug');

        if ($is_productive && isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) >= $modified) {
            Server::cacheControl();
        } else if ($is_productive && isset($_SERVER['HTTP_IF_NONE_MATCH']) && $modified > 0 && (str_replace('"', '', $_SERVER['HTTP_IF_NONE_MATCH']) == md5(file_get_contents($this->cache_file)))) {
            Server::cacheControl();
        } else {
            // Set the right header for javascript resource
            if ($this->get('debug')) {
                header('Content-Type: text/html;charset=utf-8');
            } else {
                header($this->get('contentType'));
            }

            $this->generate();

            // Control output zipping
            Server::gzip();
            header('ETag: "' . md5($this->output) . '"');

            // open the cache file for writing
            $fp = fopen($this->cache_file, 'w');
            echo $this->output;

            // save the contents of output buffer to the file and close it
            fwrite($fp, ob_get_contents());
            fclose($fp);

            while (@ob_end_flush());
        }
    }

    /**
     * Generate new js file.
     */
    public function generate() {
        // Setup build process variables
        $this->set('lang', isset($_GET['hl']) && $_GET['hl'] != '' ? $_GET['hl'] : $this->get('lang'));

        // Load js scaffold which contains all necessary js files
        if (file_exists($this->scaffold_file)) {
            //$src = parse_ini_file($this->scaffold_file);
            $json = file_get_contents($this->scaffold_file);
            $scaffold = json_decode($json, true);
            $this->add($scaffold);

            // Build...
            $this->build();
        }
    }

    /**
     * Setter for options
     *
     * @since 1.0
     * @access public
     *
     * @param $key
     * @param $val
     * @return void
     */
    public function set($key, $val = null) {
        $this->options[$key] = $val;
    }

    /**
     * Getter for options
     *
     * @since 1.0
     * @access public
     *
     * @param string $key
     * @param integer $index [optional]
     * @return Any or null
     */
    public function get($key, $index = null) {
        if (isset($this->options[$key])) {
            if ($index !== null && isset($this->options[$key][$index])) {
                return $this->options[$key][$index];
            } else {
                return $this->options[$key];
            }
        }
        return null;
    }

    /**
     * Add a file to filelist for the file creation.
     *
     * @since 1.0
     * @access public
     *
     * @param array $files
     * @param string $curpath
     * @return void
     */
    public function add($files, $curpath = '') {
        if (is_array($files)) {
            foreach ($files as $path => $file) {
                if (in_array($path, $this->scaffold_root_elements)) {
                    if (strcmp($path, 'version') == 0) {
                        $this->set('version', $file);
                        continue;
                    } else {
                        // Ignore path
                        $path = null;
                    }
                }

                // Is file in plain text?
                $is_plain = strcmp($path, $this->get('prefix_plain')) == 0;

                // Need a directory separator to append the current path?
                $ds = ($curpath != '' ? '/' : '');

                if (is_array($file) && !$is_plain) {
                    $this->add($file, $curpath . (is_string($path) ? ($ds . $path) : ''));
                } else {
                    if ($is_plain) {
                        if (is_array($file)) {
                            $plain = join("\n", $file);
                        } else {
                            $plain = $file;
                        }
                        $file = $this->get('prefix_plain') . $plain;
                    }
                    $this->files[] = $curpath . $ds . $file;
                }
            }
        }
    }

    /**
     * Build the js file with all added files and return it.
     *
     * @since 1.0
     * @access public
     *
     * @return String
     */
    public function build() {
        $output = '';
        $br = $this->tpl['br'];

        // Support strict mode
        if ($this->get('strict')) {
            $output = $br . '"use strict";';
        }

        // Take all files
        foreach ($this->files as $file) {
            // Filter plain text and add its content right into the output
            if (strpos($file, $this->get('prefix_plain')) !== false) {
                $file = str_replace($this->get('prefix_plain'), '', $file);
                $output .= $br . $br . $file;
                continue;
            }

            // Prepend the root path only to local files
            // Also add file extension only to local file paths
            if (strpos($file, $this->get('prefix_http')) === false) {
                // Path to local file
                $file = $this->root . $file;

                // Add file extension to files without an extension
                $last_token = end(preg_split('/\./', $file));
                $file_ext = '.' . $last_token;
                if (in_array($file_ext, $this->get('ext')) === false) {
                    // Take always the first entry of the extensions array
                    $file .= $this->get('ext', 0);
                }
            }

            // Replace placeholder with their values
            $file = preg_replace_callback('/{(\w+)}/i', array(
                &$this,
                'replace'
            ), $file);

            // Get content of file
            $output .= $this->getFile($file);
        }

        // Concat errors, header and created script to the output
        $this->output = $this->addError() . $this->addHeader() . $output;
    }

    private function replace($matches) {
        return $this->get($matches[1]);
    }

    /**
     * Load content of file and store it.
     *
     * @since 1.0
     * @access private
     *
     * @param (String) $file
     * @return String
     */
    private function getFile($file) {
        $output = '';
        $output .= $this->addComment($file);

        // If file doesn't exist add error to head
        if (!file_exists($file) && !fopen($file, 'r')) {
            $tpl = $this->tpl['error'];
            $output .= $tpl['missing'] . ' ' . $file;
            $this->error[] = $file . ' ' . $tpl['nofile'];
            if (!$this->get('productive')) {
                $this->names[] = $tpl['missing'] . ' ' . $file;
            }
        } else {
            $content = file_get_contents($file);

            // Optionally minify the content at this position
            if ($this->get('productive') && $this->get('minify')) {
                //$content = $this->minify($content);
            }

            $output .= $content;

            // Store the name of the read file if we are not on productive mode
            if (!$this->get('productive')) {
                $this->names[] = $file;
            }
        }
        return $output;
    }

    /**
     * Generate a comment that contains all errors.
     *
     * @since 1.0
     * @access private
     *
     * @return String
     */
    private function addError() {
        $error = '';
        $br = "\n";
        if (sizeof($this->error) > 0) {
            $error = '/**' . $br . ' * ERROR' . $br . ' *' . $br;
            foreach ($this->error as $err) {
                $error .= ' * ' . $err . "\n";
            }
            $error .= ' */' . $br . $br;
        }
        return $error;
    }

    /**
     * Generate the header for the js file.
     *
     * @since 1.0
     * @access private
     *
     * @return String
     */
    private function addHeader() {
        $diagnostic = Diagnostic::instance()->finish(__CLASS__);
        $diagnostic['time'] *= $diagnostic['time'] < 0 ? -1 : 1;
        if (is_array($diagnostic) && array_key_exists('time', $diagnostic)) {
            $this->set('generated_in', $diagnostic['time']);
        }

        $br = "\n";
        $header = array();
        $header[] = '/*!';
        $header[] = ' * ' . $this->get('name');
        $header[] = ' * ';
        $header[] = ' * @version ' . $this->get('version');
        $header[] = ' * ';
        $header[] = ' * @mode ' . ApplicationEnvironment::toString();
        $header[] = ' * @generated in ' . $this->get('generated_in') . 's';
        $header[] = ' * @date ' . date($this->get('timestamp'));
        $header[] = ' * @lang ' . $this->get('lang');

        $num_files = sizeof($this->names);
        if ($num_files > 0) {
            $header[] = ' *';
            $header[] = ' * @files (' . $num_files . ')';
            $header[] = ' * ' . join($br . ' * ', $this->names);
        }
        $header[] = ' */';

        return (join($br, $header));
    }

    /**
     * Generate a comment for the js file.
     *
     * @since 1.0
     * @access private
     *
     * @param (String) $str
     * @return String
     */
    private function addComment($str) {
        $br = $this->tpl['br'];
        $cm = $this->tpl['comment'];
        $start = isset($cm['start']) ? $cm['start'] : '';
        $end = isset($cm['end']) ? $cm['end'] : '';
        return (join($br, array(
            $br,
            $start,
            $cm['cm'] . $cm['ln'],
            $cm['cm'] . ' ' . $str,
            $cm['cm'] . $cm['ln'],
            $end,
            $br
        )));
    }

}
