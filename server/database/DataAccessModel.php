<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * DataAccessModel
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Represent a BOOKMARK with all values and CRUD-functions.
 *
 * @class     -   DataAccessModel
 * @file      -   DataAccessModel.php
 * @location  -   ./server/database/helper/DataAccessModel.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Class: DataAccessModel
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * (>) DataAccessLayer
 * (+) IDataModel
 */
abstract class DataAccessModel extends DataAccessLayer implements IDataModel {

    // Table names
    protected static $_table = array();

    // Fields of the tables
    protected static $_fields = array();

    // Default field values of the tables
    protected static $_defaults = array();

    // Primary key(s) of the tables
    protected static $_primaryKey = array();

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct();

        // Make sure that the database table is defined for
        // the class which inherits from this class.
        if (!DataTables::getTable($this->getClassName())) {
            throw new DataAccessLayerException("For the DataAccessModel class " . $this->getClassName() . " is no Table defined!", 1);
        }
    }

    /**
     * Deconstructor
     *
     * @since 1.0
     * @access public
     *
     * @return void
     */
    public function __destruct() {
        // unset all member
        foreach ($this as $key => $value) {
            unset($this->$key);
        }
    }

    /**
     * ToString will fetch all fields of the model and concat their names with
     * their values to return it as a string.
     */
    public function __toString() {
        $str = array();
        foreach ($this->getFields($this->getClassName()) as $field => $type) {
            if (!isset($this->$field)) {
                continue;
            }
            $value = $this->$field;
            $str[] = "$field: $value";
        }
        return join(", ", $str);
    }

    /**
     * Static getter for the name of the class.
     * Abstract so every class that inherits from this
     * has to implement this function in order to
     * deliver their correct class name.
     */
    public static abstract function getClassName();

    /**
     * Search
     *
     * Get data from DB where...
     *
     * @since 1.0.1
     * @access public
     * 
     * @deprecated use searchReq instead
     *
     * @param $name (string) - name of the requested table
     * @param $where (string) - Where statement for query
     * @param $fields (array) - Fields to select [optional]
     * @param $order (string) - Order by statement [optional]
     * @param $index (int) - Use to return only the result item at that index [optional]
     * @param $limit (int) - Limit by statement [optional]
     * @return Object
     */
    public static function search($name, $where, $fields = null, $order = null, $index = null, $limit = null) {
        $req = new DataAccessRequest();
        $req->name = $name;
        $req->where = $where;
        $req->fields = $fields;
        $req->order = $order;
        $req->index = $index;
        $req->limit = $limit;
        return self::searchReq($req);
    }

    /**
     * Search
     *
     * Get data from DB where...
     *
     * @since 1.0.2
     * @access public
     *
     * @param $req DataAccessRequest - Request object which contains all request values
     * @return Object
     */
    public static function searchReq(DataAccessRequest $req) {
        if ($req->fields === null) {
            $req->fields = self::getFields($req->name);
        } else {
            // Check whether the fields array is already assocciative (col -> type)
            if (array_keys($req->fields) === range(0, count($req->fields) - 1)) {
                // Create field selection array by using the given field names and attaching their types
                $modelFields = self::getFields($req->name);
                $selectFields = array();
                foreach ($req->fields as $key) {
                    if (array_key_exists($key, $modelFields)) {
                        $selectFields[$key] = $modelFields[$key];
                    }
                }
                $req->fields = $selectFields;
            }
        }
        return parent::search($req->name, self::getTable($req->name), $req->fields, $req->where, $req->order, $req->index, $req->limit);
    }

    /**
     * Create model with new properties.
     *
     * @since 1.0
     * @access public
     *
     * @param (Object|Array) $attr - Object or Array with class attributes
     * @return void
     */
    public function create($attr) {
        $attr = is_array($attr) ? $attr : get_object_vars($attr);
        foreach ($attr as $key => $value) {
            $this->$key = $value;
        }
    }

    /**
     * Save
     *
     * @since 1.0
     * @access public
     *
     * @return id
     */
    public function save() {
        return parent::save();
    }

    /**
     * Update
     *
     * @since 1.0
     * @access public
     *
     * @param (array) $prevent
     * @param (int) $limit - [optional] to improve speed of the query
     * @return Boolean
     */
    public function update($prevent = array(), $limit = null) {
        return parent::update($prevent, $limit);
    }

    /**
     * Delete
     *
     * @since 1.0
     * @access public
     *
     * @return Boolean
     */
    public function delete() {
        return parent::delete();
    }

    /**
     * Filter
     *
     * @since 1.0
     * @access public
     *
     * @see system/helpers/DataAccessLayer#filter($fields)
     *
     * @param (array) $fields
     * @param (boolean) $exclude - reverse the filter by removing the listed fields
     * @return array
     */
    public function filter($fields, $exclude = false) {
        return parent::filter($fields, $exclude);
    }

    /**
     * Get the corresponding db table name of a (Database model) class.
     *
     * @since 1.0
     * @access public
     *
     * @param (string@object) $class - name or instance of the class
     * @return string - db table name of the class
     */
    public static function getTable($class) {
        // Allow using this function with the name or instance of the class
        if ($class instanceof self) {
            $class = get_class($class);
        }

        // Check if the name was already set
        if (isset(self::$_table[$class]) == false) {
            self::$_table[$class] = DataTables::getTable($class);
        }
        return self::$_table[$class];
    }

    /**
     * Get the corresponding db fields name of a (Database model) class.
     *
     * @since 1.0
     * @access public
     *
     * @param (string@object) $class - name or instance of the class
     * @return array - db table fields of the class
     */
    public static function getFields($class) {
        // Allow using this function with the name or instance of the class
        if ($class instanceof self) {
            $class = get_class($class);
        }

        // Check if the name was already set
        if (isset(self::$_fields[$class]) == false) {
            $cls = new $class(false);
            self::$_fields[$class] = $cls->_getFields();
        }
        return self::$_fields[$class];
    }

    /**
     * Get the corresponding db default values of a (Database model) class.
     *
     * @since 1.0
     * @access public
     *
     * @param (string@object) $class - name or instance of the class
     * @return array - db table default values of the class
     */
    public static function getDefaults($class) {
        // Allow using this function with the name or instance of the class
        if ($class instanceof self) {
            $class = get_class($class);
        }

        // Check if the name was already set
        if (isset(self::$_defaults[$class]) == false) {
            $cls = new $class(false);
            self::$_defaults[$class] = $cls->_getDefaults();
        }
        return self::$_defaults[$class];
    }

    /**
     * Get the corresponding db primary key of a (Database model) class.
     *
     * @since 1.0
     * @access public
     *
     * @param (string@object) $class - name or instance of the class
     * @return array - db table primary key of the class
     */
    public static function getPrimaryKey($class) {
        // Allow using this function with the name or instance of the class
        if ($class instanceof self) {
            $class = get_class($class);
        }

        // Check if the name was already set
        if (isset(self::$_primaryKey[$class]) == false) {
            $cls = new $class(false);
            self::$_primaryKey[$class] = $cls->_getPrimaryKey();
        }
        return self::$_primaryKey[$class];
    }

}
