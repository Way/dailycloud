<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Test
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * @class     -   Test
 * @file      -   Test.php
 * @location  -   ./server/library/Test.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Test {

    // Test file reference
    private $_file;

    // Test file name
    private $_filename;

    // Test name (file name without extension)
    private $_name;

    // Url path to the test file
    private $_path;

    /**
     * Constructor
     *
     * @param (object) $file - test __FILE__
     */
    public function __construct($file) {
        $this->_file = $file;
        $this->setup();
    }

    /**
     * Destructor
     */
    public function __destruct() {
        $this->finish();
    }

    /**
     * Getter for test path.
     */
    public function getPath() {
        return $this->_path;
    }

    /**
     * Setup test.
     *
     * @access private
     */
    private function setup() {
        // Start output buffering
        ob_start();

        // Test data
        $this->_filename = pathinfo($this->_file, PATHINFO_BASENAME);
        $this->_testname = pathinfo($this->_file, PATHINFO_FILENAME);

        // Enable global diagnostic.
        Diagnostic::instance()->start($this->_testname);

        // Some cleaning?
        if(isset($_GET['clear'])) {
            Session::kill();
            header('Location: ' . $this->_filename);
            exit ;
        }

        // Url path to this file
        $this->_path = ROOT . 'test/' . $this->_filename;

        $this->buildHeader();
    }

    /**
     * Build and output the test header.
     */
    private function buildHeader() {
        // Navigation
        $navi = array();
        $navi['Home'] = ROOT . 'test';
        $navi['Reload'] = $this->_filename;
        $navi['Clear'] = $this->_filename . '?clear';

        // Header
        $header = array();
        foreach($navi as $key => $val) {
            $header[] = "<a href=\"$val\">$key</a>";
        }
        echo '<h1>' . $this->_testname . '</h1>';
        echo '<p>' . implode('&nbsp;&nbsp;', $header) . '</p>';

    }

    /**
     * Finish test.
     *
     * @access private
     */
    private function finish() {
        // Finish global diagnostic.
        Diagnostic::instance()->output($this->_testname);

        // Flush (send) the output buffer.
        $buffer = ob_get_clean();
        echo $buffer;
    }

}
