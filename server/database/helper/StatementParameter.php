<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Class: StatementParameter
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Helps to handle parameter binding for prepared statements.
 *
 * @file      -   StatementParameter.php
 * @location  -   ./server/database/helper/StatementParameter.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version -   1.0
 */
class StatementParameter {

    // Contains all added parameters
    private $_array = array();

    /**
     * Get all stored parameters
     *
     * @since 1.0
     * @access public
     *
     * @return Array
     */
    public function getParams() {
        return $this->_array;
    }

    /**
     * Add a parameter with name, type and optional value
     *
     * @since 1.0
     * @access public
     *
     * @param $name (String) - name of parameter
     * @param $type (String) - type of parameter
     * @param $value (String) [optional] - value of parameter
     */
    public function addParams($name, $type, $value = NULL) {
        if ($value) {
            $value = $this->adeptValue($value);
        }
        $this->_array[$name] = array(
            'type' => $type,
            'value' => $value
        );
    }

    /**
     * Set a parameter value identified by his name (key)
     *
     * @since 1.0
     * @access public
     *
     * @param $name (String) - name of parameter
     * @param $value (String|Integer) - value of parameter
     * @return Boolean
     */
    public function setParams($name, $value) {
        if (isset($this->_array[$name])) {
            $this->_array[$name]['value'] = $value;
            return true;
        }
        return false;
    }

    /**
     * Bind all stored parameters to the given statement.
     *
     * @since 1.0
     * @access public
     *
     * @param &$stmt (Object) - Reference to statement
     * @param $char (String) - Optional char prefix for key
     * @return call_user_func_array
     */
    public function bindParams(&$stmt, $char = ':') {
        foreach ($this->_array as $key => $val) {
            $value = &$this->_array[$key]['value'];
            $type = &$this->_array[$key]['type'];
            $length = $type == PDO::PARAM_STR ? strlen($value) : null;

            $stmt->bindParam($char . $key, $value, $type, $length);
        }
    }

    /**
     * Checks and corrects a value which
     * comes from the default field value of a table.
     * Some default values has to be replaced to
     * get interpreted correctly from the database
     * and this will happen right here.
     *
     * @since 1.0
     * @access public
     *
     * @param $value (String) - value to check
     * @return String
     */
    public function adeptValue($value) {
        switch($value) {
            case 'CURRENT_TIMESTAMP':

            case '0000-00-00 00:00:00':
                return date('Y-m-d H:i:s');
            default:
                return $value;
        }
    }

    /**
     * Get the type of an value for a prepared statement.
     * Extract the name of the type and return that.
     *
     * @since 1.0
     * @access public static
     *
     * @param $type (String) - type stored in database
     * @return String|Boolean
     */
    public static function getType($type) {
        // Remove any kind of length definitions (e.g. int(11) -> int)
        $type = preg_replace('/\([0-9]+\)/', '', $type);
        switch($type) {
            case 'int':

            case 'tinyint':

            case 'timestamp':
                return PDO::PARAM_INT;
            case 'date':

            case 'datetime':

            case 'varchar':

            case 'text':

            case 'time':
                return PDO::PARAM_STR;
            default:
                return PDO::PARAM_NULL;
        }
    }

    /**
     * Helper function to convert string numerics to real numeric values.
     *
     * @since 1.1
     * @access public
     *
     * @param $val (any) - value to convert to numeric
     * @return numeric value
     */
    public static function getNumeric($val) {
        if (is_numeric($val)) {
            return $val + 0;
        }
        return 0;
    }

    /**
     * Create a statement parameter array which contains the parameter name,
     * its value and type and maybe the length of the value in case of type
     * string.
     *
     * @since 1.1
     * @access public static
     *
     * @param $name (string) - name of the parameter
     * @param $value (any) - value of the parameter
     * @return array
     */
    public static function createParam($name, $value) {
        $param = array($name);

        // Check if the value is numeric because numeric values as string
        // will be typed as string by gettype.
        $type = is_numeric($value) ? 'numeric' : gettype($value);

        switch ($type) {
            case 'boolean':
                array_push($param, $value, PDO::PARAM_BOOL);
                break;
            case 'numeric':
            case 'integer':
            case 'double':
                array_push($param, self::getNumeric($value), PDO::PARAM_INT);
                break;
            case 'string':
                array_push($param, $value, PDO::PARAM_STR, strlen($value));
                break;
            default:
                array_push($param, PDO::PARAM_NULL);
                break;
        }

        return $param;
    }

}
