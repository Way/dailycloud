<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * RequestHandler
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Parsing the server request.
 *
 * @class     -   RequestHandler
 * @file      -   RequestHandler.php
 * @location  -   ./server/library/RequestHandler.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class RequestHandler {

    // Permitted chars for a request
    private $permitted_chars = 'a-z 0-9~%.:_\-';

    // Request URI
    private $uri = '';

    // Segments of the URI
    private $segments = array();

    // Default request name
    private $default_request = 'start';

    // Default method of a request
    private $default_method = 'index';

    // Request instance
    private $request;

    // Directory where requests are located (set by constructor)
    private $request_dir = '';

    // Name of the current request
    private $request_name;

    // File of the current request
    private $request_file;

    // Class of the current request
    private $request_class;

    // Suffix for a request class
    private $request_class_suffix = 'Request';

    // Request method
    private $method;

    // Request parameters
    private $params = array();

    /**
     * Constructor
     */
    public function __construct() {
        // Set request diretory (where request files are located)
        // NOTE: The order in the array defines their priority -> first found calling!
        $this->request_dir = array(
            APP_PATH . 'pages/',
            SERVER_PATH . 'request/'
        );

        $this->route();
    }

    /**
     * GZIPing the output of the request
     */
    public function gzip() {
        if (isset($_SERVER['HTTP_ACCEPT_ENCODING']) && substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') && !extension_loaded('zlib')) {
            ob_start('ob_gzhandler');
        } else {
            ob_start();
        }
    }

    /**
     * Statically run. Creates new instance and handles current request.
     *
     * @param (bool) $error_reporting_level
     */
    public static function run($error_reporting_level = 0) {
        error_reporting($error_reporting_level);
        $instance = new self;
        $instance->handle();
    }

    /**
     * Handle request
     *
     * @access public
     * @return void
     */
    public function handle() {
        // First segment is the name of the request (file name in the requests directory)
        $this->request_name = ($seq0 = $this->getSegment(0)) !== null ? $seq0 : $this->default_request;

        // Second segment is the name of the requested method
        $this->method = ($seq1 = $this->getSegment(1)) !== null ? $seq1 : $this->default_method;

        // All segments behind the second one count as parameters
        $this->params = array_slice($this->segments, 2);

        // compress output
        $this->gzip();

        // Locate file of the request by concatting the request directory with the request name and its extension
        foreach ($this->request_dir as $i => $request_dir) {
            $this->request_file = $request_dir . $this->request_name . EXT;

            // Check if the requested file exists
            $exceptionToThrow = null;
            if (file_exists($this->request_file)) {
                include $this->request_file;

                // Get request class by extending the request with the request class suffix
                $this->request_class = ucfirst($this->request_name) . $this->request_class_suffix;

                // Check if the request class exists
                if (class_exists($this->request_class)) {
                    // Create instance of request class
                    $this->request = new $this->request_class();

                    // Check if the requested class has a method prefix for its methods
                    // Add prefix to the request method except its the default method which
                    // is not allowed to have a prefix!
                    if (strcasecmp($this->method, $this->default_method) !== 0) {
                        if ($this->request->prefix !== null) {
                            $this->method = $this->request->prefix . $this->method;
                        }
                    }

                    // Set current request url to the request instance
                    $this->request->uri = ROOT . $this->uri;
                    if (is_array($this->segments) && sizeof($this->segments) >= 1) {
                        // first of the segments is the root of the request
                        $this->request->root = ROOT . $this->segments[0];
                    } else {
                        // without segments take the request uri as root
                        $this->request->root = ROOT . $this->uri;
                    }

                    $requestMethod = array(
                        $this->request,
                        $this->method
                    );
                    if (is_callable($requestMethod)) {
                        call_user_func_array($requestMethod, $this->params);

                        //
                        // Request successfully handled! -> BREAK OUT
                        //
                        break;
                    } else {
                        $exceptionToThrow = 'Unknown requested method: ' . $this->method . ' in the class ' . $this->request_class . ' (' . $this->request_file . ')';
                    }
                } else {
                    $exceptionToThrow = 'Unknown requested class: ' . $this->request_class . ' (' . $this->request_file . ')';
                }
            } else {
                $exceptionToThrow = 'Unknown requested file: ' . $this->request_file;
            }
        }

        if ($exceptionToThrow) {
            throw_exception(new RequestHandlerException($exceptionToThrow));
        }
    }

    /**
     * Get current URI
     *
     * @access public
     * @return string
     */
    public function getUri() {
        return $this->uri;
    }

    /**
     * Get segment of current URI by its index.
     * Call without an index to get the complete segment array.
     *
     * @access public
     *
     * @param int - index of the segment [optional]
     * @return mixed - string by using index, otherwise array
     */
    public function getSegment($index = null) {
        // Check if an index is available
        if ($index !== null) {
            // Check if the index exists in the segments
            if ($index < sizeof($this->segments)) {
                // Return segment value at the given index
                return $this->segments[$index];
            }
            return null;
        }

        return $this->segments;
    }

    /**
     * Route the current request.
     *
     * @access private
     * @return void
     */
    private function route() {
        // Fetch the complete URI string
        $this->fetchUri();

        // Remove slash if it is first char
        if (substr($this->uri, 0, 1) == '/') {
            $this->uri = substr($this->uri, 1);
        }

        // Is there a URI string?
        if ($this->uri != '') {
            // Compile the segments into an array
            $this->explodeSegments();
        }
    }

    /**
     * Fetch the complete URI.
     *
     * @access private
     * @return void
     */
    private function fetchUri() {
        $this->uri = '';

        // If the URL has a question mark then it's simplest to just
        // build the URI string from the zero index of the $_GET array.
        // This avoids having to deal with $_SERVER variables, which
        // can be unreliable in some environments
        if (is_array($_GET) && count($_GET) == 1 && trim(key($_GET), '/') != '') {
            return $this->uri = key($_GET);
        }

        // Is there a PATH_INFO variable?
        // Note: some servers seem to have trouble with getenv() so we'll test it two ways
        $path = (isset($_SERVER['PATH_INFO'])) ? $_SERVER['PATH_INFO'] : @getenv('PATH_INFO');
        if (trim($path, '/') != '' && $path != "/" . SELF) {
            return $this->uri = $path;
        }

        // No PATH_INFO?... What about QUERY_STRING?
        $path = (isset($_SERVER['QUERY_STRING'])) ? $_SERVER['QUERY_STRING'] : @getenv('QUERY_STRING');
        if (trim($path, '/') != '') {
            return $this->uri = $path;
        }

        // No QUERY_STRING?... Maybe the ORIG_PATH_INFO variable exists?
        $path = (isset($_SERVER['ORIG_PATH_INFO'])) ? $_SERVER['ORIG_PATH_INFO'] : @getenv('ORIG_PATH_INFO');
        if (trim($path, '/') != '' && $path != "/" . SELF) {
            // remove path and script information so we have good URI data
            return $this->uri = str_replace($_SERVER['SCRIPT_NAME'], '', $path);
        }

        // If the URI contains only a slash we'll kill it
        if ($this->uri == '/') {
            return $this->uri = '';
        }
    }

    /**
     * Filter segments for malicious characters
     *
     * @access private
     *
     * @param string - value to filter
     * @return string
     */
    private function filterUri($str) {
        if ($str != '') {
            if (!preg_match("|^[" . str_replace(array(
                '\\-',
                '\-'
            ), '-', preg_quote($this->permitted_chars, '-')) . "]+$|i", $str)) {
                // HANDLE 400 -> The URI you submitted has disallowed characters
            }
        }

        // Convert programatic characters to entities
        $bad = array(
            '$',
            '(',
            ')',
            '%28',
            '%29'
        );
        $good = array(
            '&#36;',
            '&#40;',
            '&#41;',
            '&#40;',
            '&#41;'
        );

        $str = str_replace($bad, $good, $str);
        return $str;
    }

    /**
     * Explode the URI Segments and store them.
     *
     * @access private
     *
     * @return void
     */
    private function explodeSegments() {
        foreach (explode("/", preg_replace("|/*(.+?)/*$|", "\\1", $this->uri)) as $val) {
            // Filter segments for security
            $val = trim(self::filterUri($val));

            if ($val != '') {
                $this->segments[] = $val;
            }
        }
    }

}

/**
 * RequestHandler Exception
 */
class RequestHandlerException extends Exception {
    public $type = __CLASS__;
}
