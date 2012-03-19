<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * BookmarkModel
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Represent a Bookmark with all values and CRUD-functions.
 *
 * @class     -   BookmarkModel
 * @file      -   BookmarkModel.php
 * @location  -   ./server/database/model/BookmarkModel.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Class: BookmarkModel
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * (>) DataAccessLayer
 */
class BookmarkModel extends DataAccessModel {

    // Set the name of this class.
    // This is necessary because "Late Static Binding" class name
    // with get_called_class() is only available since PHP >= 5.3.
    private static $_className = __CLASS__;

    /**
     * Get the name of the corresponding (calling) class.
     *
     * @since 1.0
     * @access public
     *
     * @return string - name of the class
     */
    public static function getClassName() {
        return self::$_className;
    }

    /**
     * Constructor
     *
     * @since 1.0
     * @access public
     *
     * @return void
     */
    public function __construct($init = true) {
        parent::__construct();

        if ($init) {
            // Set the attrAccessor for class properties as well.
            $name = self::getClassName();
            self::attrAccessor(join(',', array_keys(self::getFields($name))));
        }
    }

    /**
     * Create new by its primary key.
     *
     * @since 1.0
     * @access public
     *
     * @param (Array) $pk - Primary key(s)
     * @return Object
     */
    public static function createDirectly(array $pk) {
        $name = self::getClassName();
        $instance = new $name;
        return $instance->initByPrimaryKey($pk);
    }

    /**
     * Update by condition.
     *
     * @since 1.0
     * @access public
     *
     * @param (Array) $set - Table of keys and their values to update
     * * @param (Array) $where - Query condition
     * @param (boolean) $primary_key - [optional] delete by primary key
     * @return Object
     */
    public static function updateDirectly(array $set, array $where) {
        $name = self::getClassName();
        return parent::updateBy($set, $where, self::getTable($name), self::getFields($name));
    }

    /**
     * Delete by its primary key.
     *
     * @since 1.0
     * @access public
     *
     * @param (Array) $by - Query condition
     * @param (boolean) $primary_key - [optional] delete by primary key
     * @return Object
     */
    public static function deleteDirectly(array $by, $primary_key = false) {
        $name = self::getClassName();
        if ($primary_key) {
            return parent::deleteByPrimaryKey($by, self::getPrimaryKey($name), self::getTable($name), self::getFields($name));
        } else {
            return parent::deleteBy($by, self::getTable($name), self::getFields($name));
        }
    }

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
     * @param $by (String) - Where statement for query
     * @param $fields (Array) - Fields to select [optional]
     * @param $order (String) - Order by statement [optional]
     * @param $index (int) - Use to return only the result item at that index [optional]
     * @return Object
     */
    public static function search($by, $fields = null, $order = null, $index = null) {
        $name = self::getClassName();
        return parent::search($name, $by, $fields, $order, $index);
    }

    /**
     * Search
     *
     * Get data from DB where...
     *
     * @since 1.0.1
     * @access public
     *
     * @param $req (DataAccessRequest) - Request object contains all statement values
     * @return Object
     */
    public static function searchReq(DataAccessRequest $req) {
        $req->name = self::getClassName();
        return parent::searchReq($req);
    }

    /**
     * Get all from DB
     *
     * @since 1.0
     * @access public
     *
     * @return Array
     */
    public static function getAll() {
        $name = self::getClassName();
        return parent::getAll($name, self::getTable($name), self::getFields($name));
    }

    /**
     * Get number of all from DB
     *
     * @since 1.0
     * @access public
     *
     * @param $by array - Where statement for query
     * @return int
     */
    public static function getCount(array $by) {
        $name = self::getClassName();
        return parent::getCount(self::getTable($name), $by, self::getFields($name));
    }

}
