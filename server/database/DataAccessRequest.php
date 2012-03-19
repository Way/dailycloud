<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * DataAccessRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Global Instance of a DataAccessRequest connection.
 *
 * @file      -   DataAccessRequest.php
 * @location  -   ./server/DataAccessRequest/DataAccessRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class DataAccessRequest {

    // Location for overloaded data.
    private $_data = array();

    private $_triggerErrorForUndefProps = false;

    public function __set($name, $value) {
        $this->_data[$name] = $value;
    }

    public function __get($name) {
        if (array_key_exists($name, $this->_data)) {
            return $this->_data[$name];
        }

        if ($this->_triggerErrorForUndefProps) {
            $trace = debug_backtrace();
            trigger_error('Undefined property via __get(): ' . $name . ' in ' . $trace[0]['file'] . ' on line ' . $trace[0]['line'], E_USER_NOTICE);
        }
        return null;
    }

    public function __isset($name) {
        return isset($this->_data[$name]);
    }

    public function __unset($name) {
        unset($this->_data[$name]);
    }

}
