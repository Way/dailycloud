<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * DataAccessLayer
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * The DataAccessLayer (DAL) is a abstract class which
 * allocates the connection to the database.
 * Every application model inherits from this DAL and
 * has access to the basic CRUD-functions and some
 * special crap like search or count.
 *
 * @file      -   DataAccessLayer.php
 * @location  -   ./server/database/DataAccessLayer.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 *            -   1.0.1 (use of prepared statements)
 *            -   1.0.2 (new filter function)
 *            -   1.0.3 (changed from mysqli to pdo)
 *            -   1.0.4 (new getSelection function, improved search function)
 *            -   1.0.5 (new getDetails$fields = $this->getFields($this);())
 *            -   1.0.6 (added dbh() as getter for the database handler instance)
 *            -   1.0.7 (added deleteBy(), adjusted deleteByPrimaryKey)
 */

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * DataAccessLayer Exception class
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 */
class DataAccessLayerException extends CustomException {
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Abstract Class: DataAccessLayer
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * abstract => cannot be instantiated
 */
abstract class DataAccessLayer extends AttrObject {
    // Database handler
    private static $_dbh;

    // Flag for DB connection
    private static $_db_connected = false;

    /**
     * Constructor
     *
     * @since 1.0
     * @access public
     */
    public function __construct() {
        self::connect();
    }

    /**
     * Deconstructor
     *
     * @since 1.0
     * @access public
     */
    public function __destruct() {
        self::disconnect();
    }

    /**
     * Establish the database handler instance.
     *
     * @since 1.0.6
     * @access public
     *
     * @return Database instance
     */
    public static function dbh() {
        if (null === self::$_dbh) {
            self::$_dbh = DataBase::instance();
        }
        return self::$_dbh;
    }

    /**
     * Connect to DB
     *
     * @since 1.0
     * @access public
     *
     * @return void
     */
    public static function connect() {
        if (!self::$_db_connected) {
            if (self::dbh()) {
                // Connection established!
                self::$_db_connected = true;
            }
        }
    }

    /**
     * Disconnect from DB
     *
     * @since 1.0
     * @access public
     *
     * @version 1.0.3
     * - adjusted to work with PDO instead of mysqli
     *
     * @return void
     */
    public static function disconnect() {
        if (self::$_db_connected) {
            self::$_dbh = null;
        }
    }

    /**
     * Save object data into DB
     *
     * @since 1.0
     * @access protected
     *
     * @version 1.0.1 - works now with prepared statement
     * @version 1.0.3 - adjusted to work with PDO instead of mysqli
     * @version 1.0.6 - added $update attribute to use "ON DUPLICATE KEY UPDATE"
     *
     * @param (Array) $update - update values to use update instead of insert
     * @return (Int) - id of inserted row in DB or null (if failed)
     */
    protected function save() {
        $table = $this->getTable($this);
        $fields = $this->getFields($this);
        $defaults = $this->getDefaults($this);
        $keys = array_keys($fields);
        $id = null;

        // create query
        $sql = "INSERT $table (" . join(',', $keys) . ") VALUES (" . $this->getPlaceholder($keys) . ")";

        try {
            // create prepared statement
            if ($stmt = self::dbh()->prepare($sql)) {
                // create statemente parameter
                $sp = new StatementParameter;

                // add parameters with their values
                foreach ($fields as $key => $val) {
                    // if parameter value is not defined take default value or set to an empty string ''
                    $value = isset($this->$key) ? $this->$key : (isset($defaults[$key]) ? $defaults[$key] : '');
                    $sp->addParams($key, StatementParameter::getType($val), $value);
                }

                // bind parameters
                $sp->bindParams($stmt);

                // execute prepared statement
                $stmt->execute();

                // set id of new inserted item if the id is available
                $id = self::dbh()->lastInsertId($table);
                if ($id != null && $id != false) {
                    $this->id = $id;
                }

                // get number of affected rows
                #$count = $stmt->rowCount();

                $stmt->closeCursor();
            }
        } catch(PDOException $e) {
            throw new DataAccessLayerException($e->getMessage(), 500);
        }

        return $this;
    }

    /**
     * Update object data from DB
     *
     * @since 1.0
     * @access protected
     *
     * @version 1.0.3 - works now with prepared statement
     *          1.0.4 - added $prevent parameter to prevent values from updating
     *          1.0.5 - added $limit parameter to improve speed of the query
     *
     * @param (array) $prevent - (optional) contains values which should not be updated
     * @param (int) $limit - (optional) improve speed of the query
     * @return Boolean
     */
    protected function update($prevent = array(), $limit = null) {
        $table = $this->getTable($this);
        $fields = $this->getFields($this);
        $defaults = $this->getDefaults($this);
        $primaryKey = $this->getPrimaryKey($this);
        $set = $update = $where = array();

        // create query part SET
        foreach ($fields as $key => $val) {
            // only if parameter value is not null (do not replace it with '' but ignore it).
            // check prevent values and do not add them!.
            if (isset($this->$key) && !isset($prevent[$key])) {
                $set[] = "$key=" . self::getPlaceholder($key);
                $update[$key] = $this->$key;
            }
        }

        // create query part WHERE by the primary key
        foreach ($primaryKey as $key) {
            $val = $this->$key;
            $where[] = "$key='$val'";
        }

        // create query
        $set = join(',', $set);
        if (sizeof($where) > 0) {
            $where = 'WHERE ' . join(' AND ', $where);
        }
        $sql = "UPDATE $table SET $set $where";

        // Add optional limit value
        if ($limit !== null) {
            $sql .= " LIMIT $limit";
        }

        // run statement and return result
        return self::runStatement($sql, $update, $fields);
    }

    /**
     * Update object data from DB identified by its where condition(s).
     *
     * @since 1.0.7
     * @access protected
     *
     * @param  (array) $update - Table with keys and their values to update
     * @param  (array) $by - Query condition
     * @param  (array) $table - Name of the affected DB table
     * @param  (array) $fields - Contains all parameters with their type
     * @return (boolean)
     */
    protected static function updateBy(array $update, array $by, $table, $fields) {
        // parse where condition and generate parameters
        $a = self::getWhereAndParams($by);
        $where = $a['where'];
        $set = array();

        foreach ($update as $key => $val) {
            $set[] = "$key=" . self::getPlaceholder($key);
        }

        // create query
        $set = join(',', $set);
        $sql = "UPDATE $table SET $set $where";

        // Merge params from the set and the where condition
        $params = array_merge($update, $a['params']);

        // run statement and return result
        return self::runStatement($sql, $params, $fields);
    }

    /**
     * Delete object data from DB
     *
     * @since 1.0
     * @access protected
     *
     * @return Boolean
     */
    protected function delete() {
        $table = $this->getTable($this);
        $fields = $this->getFields($this);
        $primaryKey = $this->getPrimaryKey($this);

        $pk = array();
        foreach ($primaryKey as $key => $val) {
            $pk[$val] = $this->$val;
        }
        return self::deleteByPrimaryKey($pk, $primaryKey, $table, $fields);
    }

    /**
     * Remove a record directly from the database identified by its where condition(s).
     *
     * @since 1.0.7
     * @access protected
     *
     * @param  (array) $by - Query condition
     * @param  (array) $table - Name of the affected DB table
     * @param  (array) $fields - Contains all parameters with their type
     * @return (boolean)
     */
    protected static function deleteBy(array $by, $table, $fields) {
        // Parse where condition and generate parameters
        $a = self::getWhereAndParams($by);
        $where = $a['where'];
        $params = $a['params'];

        // Create query
        $sql = "DELETE FROM $table $where";

        // run statement and return result
        return self::runStatement($sql, $params, $fields);
    }

    /**
     * Remove a record directly from the database by its primary key.
     *
     * @since 1.0
     * @access protected
     *
     * @version 1.0.1
     * - works now with prepared statement
     *
     * @param  (array) $pk  - Current primay key values
     * @param  (array) $primaryKey - Stored primary key values
     * @param  (array) $table - Name of the affected DB table
     * @param  (array) $fields - Contains all parameters with their type
     * @return (boolean)
     */
    protected static function deleteByPrimaryKey(array $pk, $primaryKey, $table, $fields) {
        // To be sure $pk is filled with enough keys to describe a primary key, we have to verify
        $primaryKey = array_flip($primaryKey);
        if (sizeof($pk) === 0) {
            printf('There is no primary key defined for the table ' . $table);
            return false;
        }
        if (count(array_intersect_key($pk, $primaryKey)) != count($primaryKey)) {
            printf('Primary key fields does not match those of table ' . $table);
            return false;
        }

        return self::deleteBy($pk, $table, $fields);
    }

    /**
     * Initialize an object from its primary key.
     *
     * @since 1.0
     * @access protected
     *
     * @version 1.0.1 - works now with prepared statement
     * @version 1.0.3 - adjusted to work with PDO instead of mysqli
     *
     * @param  (mixed) $pk - Primary key of object
     * @return (Object) or null
     */
    protected function initByPrimaryKey(array $pk) {
        $fields = $this->getFields($this);
        $table = $this->getTable($this);
        $primaryKey = $this->getPrimaryKey($this);

        // Verify if $pk is filled with enough keys to describe a primary key
        $primaryKey = array_flip($primaryKey);
        if (count(array_intersect_key($pk, $primaryKey)) != count($primaryKey)) {
            printf('Primary key fields does not match those of table ' . $table);
            return null;
        }

        // create query part WHERE
        $where = array();
        foreach ($pk as $key => $val) {
            $where[] = "$key=" . self::getPlaceholder($key);
        }

        $select = join(',', array_keys($fields));
        $where = join(' AND ', $where);

        // create query
        $sql = "SELECT $select FROM $table WHERE $where";

        if ($stmt = self::dbh()->prepare($sql)) {
            // create statemente parameter
            $sp = new StatementParameter;

            // add parameters with their values
            foreach ($pk as $key => $val) {
                $sp->addParams($key, StatementParameter::getType($fields[$key]), $val);
            }

            // bind parameters
            $sp->bindParams($stmt);

            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            if (!empty($result)) {
                // Because the result has to be one single entry in consequence of regarding
                // the primary key we take only the very first entry of the result list.
                foreach ($result[0] as $key => $val) {
                    $this->$key = $val;
                }
                return $this;
            }
        }
        return null;
    }

    /**
     * Search
     *
     * Get the row data from table where...
     *
     * @since 1.0.1
     * @access protected
     *
     * @examples
     *   $page = page::search(array('PageID' => 125));
     *
     *   Use a different compare sign
     *   $pages = page::search(array('PageDate' => array('<', now())));
     *   or
     *   $pages = page::search(array('PageDate <' => now()));
     *
     * @param (string) $class - Class name of class which will be created
     * @param (string) $table - Name of the affected DB table
     * @param (AssocArray) $fields - Selection fields (NOTE: Be sure that it is an associative array
     *                               with the fields and their types!)
     * @param (string) $by - Where statement for the DB query
     * @param (string) $order - [Optional] Order by statement
     * @param (int) $index - [Optional] return only the found element with that index
     * @param (int) $limit - [Optional] Limit by statement
     * @return Array (contains objects)
     */
    protected static function search($class, $table, $fields, $by = array(), $order = null, $index = null, $limit = null) {
        $table = strtolower($table);
        $selection = sizeof($fields) > 0 ? join(',', array_keys($fields)) : '*';

        // Parse where condition and generate parameters
        $a = self::getWhereAndParams($by);
        $where = $a['where'];
        $params = $a['params'];

        // Create query
        $sql = "SELECT $selection FROM $table $where";

        // Add order
        if ($order !== null) {
            $sql .= " ORDER BY $order";
        }

        // Add limit
        if ($limit !== null) {
            $sql .= " LIMIT $limit";
        }

        // create statemente parameter
        $sp = new StatementParameter;

        // add parameters with their values
        foreach ($params as $key => $val) {
            $sp->addParams($key, StatementParameter::getType($fields[$key]), $val);
        }

        $result = self::getSelection($sql, $class, $sp);

        // check to return only the requested index
        if ($index !== null && $index < count($result)) {
            return $result[$index];
        }
        return $result;
    }

    /**
     * Filter the array of fields by taking only
     * the columns defined in the parameter array
     * and return the new created array.
     *
     * @since 1.0.2
     * @access protected
     *
     * @param (array) $fields - fields of array
     * @param (boolean) $exclude - reverse the filter by removing the listed fields
     * @return (array)
     */
    protected function filter($fields, $exclude = false) {
        $newFields = array();
        $modelFields = $this->getFields($this);
        if ($exclude) {
            foreach (array_keys($modelFields) as $key) {
                if (!in_array($key, $fields)) {
                    $newFields[$key] = isset($this->$key) ? $this->$key : NULL;
                }
            }
            return $newFields;
        }

        foreach ($fields as $key) {
            if (array_key_exists($key, $modelFields)) {
                if ($exclude) {
                    continue;
                }
                $newFields[$key] = isset($this->$key) ? $this->$key : NULL;
            }
        }
        return $newFields;
    }

    /**
     * Get the primary key
     *
     * @since 1.0
     * @access protected
     *
     * @version 1.0.3
     * - adjusted to work with PDO instead of mysqli
     *
     * @return (mixed)
     */
    protected function _getPrimaryKey() {
        $table = $this->getTable($this);
        $keys = array();

        // Run query
        $result = self::dbh()->query('SHOW KEYS FROM ' . $table);
        if (!$result) {
            printf('Impossible to get primary key(s) of table ' . $table);
        }

        // Fetch result
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            if ($row['Key_name'] == 'PRIMARY') {
                $keys[$row['Seq_in_index'] - 1] = $row['Column_name'];
            }
        }
        return $keys;
    }

    /**
     * Get the table fields of the class
     *
     * @since 1.0
     * @access protected
     *
     * @version 1.0.1
     * - $col parameter to get specific column (default: 'Type')
     *
     * @param $col (String) - [optional] Name of column
     * @return Array
     */
    protected function _getFields($col = 'Type') {
        $table = $this->getTable($this);
        $tb = array();

        // Run query
        $stmt = self::dbh()->query('SHOW COLUMNS FROM ' . $table);

        // Fetch result
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tb[$row['Field']] = $row[$col];
        }
        return $tb;
    }

    /**
     * Get the extra table fields of the class.
     * Same es getFields() but with different table name.
     *
     * @since 1.0.5
     * @access protected
     *
     * @param $table (String) - Name of table
     * @param $col (String) - [optional] Name of column
     * @return Array
     */
    protected function _getExtraFields($table, $col = 'Type') {
        $tb = array();

        // Run query
        $stmt = self::dbh()->query('SHOW COLUMNS FROM ' . $table);

        // Fetch result
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tb[$row['Field']] = $row[$col];
        }
        return $tb;
    }

    /**
     * Get the table default field values
     *
     * @since 1.0.1
     * @access protected
     *
     * @return (array)
     */
    protected function _getDefaults() {
        return $this->_getFields('Default');
    }

    /**
     * Get all stored items by selecting all from table.
     *
     * @since 1.0
     * @access protected
     *
     * @version 1.0.1 - works now with prepared statement
     * @version 1.0.3 - adjusted to work with PDO instead of mysqli
     *
     * @param (string) $class - Class name of class which will be created
     * @param (string) $table - Name of the affected DB table
     * @param (array) $fields - Contains all fields that should be selected (@since 1.0.1)
     * @param (string) $order - Order By statement for the query (@since 1.0.2)
     *
     * @return array
     */
    protected static function getAll($class, $table, $fields = array(), $order = null) {
        $table = strtolower($table);
        $fields = sizeof($fields) > 0 ? join(',', array_keys($fields)) : '*';

        // create query
        $sql = "SELECT $fields FROM $table";

        if ($order !== null) {
            // Add order by statement
            $sql .= " ORDER BY $order";
        }

        return self::getSelection($sql, $class);
    }

    /**
     * Get number of stored items in DB by selecting count all.
     *
     * @since 1.0
     * @access protected
     *
     * @version 1.0.3 - adjusted to work with PDO instead of mysqli
     * @version 1.1 - added $by and $fields parameter to filter selection result
     *
     * @param (string) $table - Name of the affected DB table
     * @param (array) $fields - Contains all fields that should be selected
     * @return int
     */
    protected static function getCount($table, $by = array(), $fields = array()) {
        // Parse where condition and generate parameters
        $a = self::getWhereAndParams($by);
        $where = $a['where'];
        $params = $a['params'];

        // Create query
        $sql = "SELECT COUNT(*) AS count FROM $table $where";

        // create statemente parameter
        $sp = new StatementParameter;

        // add parameters with their values
        foreach ($params as $key => $val) {
            $sp->addParams($key, StatementParameter::getType($fields[$key]), $val);
        }

        $result = self::getSelection($sql, false, $sp);
        
        // Return only the first entryas count
        return $result[0];
    }

    /**
     * Prepare und execute a database select query and return
     * the result of this query.
     *
     * @since 1.0.4
     * @access private
     *
     * @param  (string) $sql
     * @param  (string) $class
     * @return (array)
     */
    private static function getSelection($sql, $class = false, $sp = false) {
        $result = array();
        $dbh = self::dbh();
        try {
            // create a prepared statement
            if ($stmt = $dbh->prepare($sql)) {
                // exist statement parameters?
                if ($sp) {
                    // bind parameters
                    $sp->bindParams($stmt);
                }

                // begin transation, turning off autocommit
                $dbh->beginTransaction();

                // execute the prepared statement
                $stmt->execute();

                if ($class !== false) {
                    $result = $stmt->fetchAll(PDO::FETCH_CLASS, $class);
                } else {
                    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                $stmt->closeCursor();

                // commit the changes
                $dbh->commit();
            }
        } catch (PDOException $e) {
            // recognize mistake and roll back changes
            $dbh->rollBack();

            throw new DataAccessLayerException($e->getMessage(), 500);
        }
        return $result;
    }

    /**
     * Creates a string with a the leading char (default ':')
     * and the name of the parameter for each entry in the array.
     *
     * @since 1.0.1
     * @access private
     *
     * @version 1.0.3 - renamed from getHolder to getPlaceholder
     *                - adjusted to work with PDO instead of mysqli
     * @version 1.0.4 - now supports single string key and array with keys as parameter
     *
     * @param  (array|string) $key
     * @param  (string) $char
     * @return (string)
     */
    private function getPlaceholder($key, $char = ':') {
        if (is_array($key)) {
            $holder = array();
            foreach ($key as $a) {
                $holder[] = $char . $a;
            }
            return join(',', $holder);
        } else {
            return $char . $key;
        }
    }

    /**
     * Parse where condition by generating where string.
     * Create additional parameter array with parsed values.
     *
     * @param  (array) $by filter condition
     * @return (array)
     *  $val> where condition string for the query
     *          'params' => parameters as key => val array
     */
    private function getWhereAndParams(array $by) {
        // Return values
        $where = array();
        $params = array();

        foreach ($by as $key => $val) {
            // // only allow regular values
            // if (!empty($val)) {
            $compare = "=";
            if (strpos($key, ' ') !== false) {
                // if key is contains a space the compare sign
                // differs from the default compare '='.
                // e.g.: $where = array('num <', 10)
                $key_expl = explode(' ', $key);
                if (sizeof($key_expl) > 1) {
                    $compare = $key_expl[1];
                }
                $key = $key_expl[0];
            } else {
                if (is_array($val)) {
                    // if value is an array the compare sign
                    // differs from the default compare '='.
                    // e.g.: $where = array('num' array('<', 10))
                    if (sizeof($val) > 1) {
                        $compare = $val[0];
                        $val = $val[1];
                    } else {
                        $val = $val[0];
                    }
                }
            }
            $where[] = "$key $compare " . self::getPlaceholder($key);

            // store key and its value in parameter array for later statement parameter binding
            $params[$key] = $val;
        }

        // Join where to string before returned
        if (sizeof($where) > 0) {
            $where = 'WHERE ' . join(' AND ', $where);
        } else {
            $where = '';
        }

        $whereAndParams = array(
            'where' => $where,
            'params' => $params
        );
        return $whereAndParams;
    }

    /**
     * Run a database statemend by preparing,
     * adding parameters und executing.
     *
     * @since 1.0.1
     * @access private
     *
     * @version 1.0.3
     * - adjusted to work with PDO instead of mysqli
     *
     * @param  (string) $sql - SQL query
     * @param  (array)  $params - contains all parameters
     * @param  (array)  $fields - contains all table fields and their types
     * @return (boolean)
     */
    private function runStatement($sql, $params, $fields) {
        try {
            $dbh = self::dbh();

            // create prepared statement
            if ($stmt = $dbh->prepare($sql)) {
                // create statemente parameter
                $sp = new StatementParameter;

                // add parameters with their values
                foreach ($params as $key => $val) {
                    $sp->addParams($key, StatementParameter::getType($fields[$key]), $val);
                }

                // bind parameters
                $sp->bindParams($stmt);

                // begin transation, turning off autocommit
                $dbh->beginTransaction();

                // execute prepared statement
                $affected = $stmt->execute();

                // commit the changes
                $dbh->commit();

                // ok when at least one row is affected
                $ok = $affected > 0;
                $stmt->closeCursor();

                return $ok;
            }
        } catch (PDOException $e) {
            // recognize mistake and roll back changes
            $dbh->rollBack();
            throw new DataAccessLayerException($e->getMessage(), 500);
        }
        return true;
    }

}
