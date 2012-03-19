<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * RemoteDataAccess
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Abstract Remote DataAccess class to maintain a remote
 * access to the database by a data link.
 *
 * @class     -   RemoteDataAccess
 * @file      -   RemoteDataAccess.php
 * @location  -   ./server/database/RemoteDataAccess.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 *                1.1 - new prepareQuery method
 */
abstract class RemoteDataAccess {
    /**
     * Map with query variables.
     * This map should be filled by a static constructor.
     */
    public static $vars;

    /**
     * Database instance
     */
    private static $_dbh;

    /**
     * Establish the link to the database handler instance.
     *
     * @since 1.0
     * @access public
     *
     * @return Database instance
     */
    public static function dbh() {
        if (self::$_dbh === null) {
            self::$_dbh = DataBase::instance();
        }
        return self::$_dbh;
    }

    /**
     * Run a query and return its result.
     * Use class to set the fetch mode to class.
     *
     * @since 1.0
     * @access public
     *
     * @param string $query
     * @param array $param
     * @param string $class
     *
     * @return array
     */
    public static function runQuery($query, $param, $class = null) {
        $result = array();
        try {
            // Prepare query
            $query = self::prepareQuery($query, $param);
            $stmt = self::dbh()->prepare($query);

            // Bind parameters
            foreach ($param as $i => $pmi) {
                if (!is_array($pmi[1])) {
                    //
                    // (1) Single parameter
                    //
                    self::bindParam($stmt, $pmi[0], $pmi[1], $pmi[2]);
                } else {
                    //
                    // (2) Multiple parameters
                    //
                    foreach ($pmi[1] as $j => $pmj) {
                        // Use the placeholder token and add current index
                        $token = $pmi[0] . $j;
                        self::bindParam($stmt, $token, $pmj[0], $pmj[1]);
                    }
                }
            }

            self::dbh()->beginTransaction();
            if ($stmt->execute()) {
                if ($class !== null) {
                    $stmt->setFetchMode(PDO::FETCH_CLASS, $class);
                } else {
                    $stmt->setFetchMode(PDO::FETCH_ASSOC);
                }
                while ($data = $stmt->fetch()) {
                    $result[] = $data;
                }
            }
            $stmt->closeCursor();
            self::dbh()->commit();
        } catch (PDOException $e) {
            // recognize mistake and roll back changes
            self::dbh()->rollBack();
            throw new DataAccessLayerException($e->getMessage(), 500);
        }
        return $result;
    }

    /**
     * Adjust query and the list of filters if we have to match multiple tags.
     *
     * @param string $query
     * @param array $param
     *
     * @return array($query, $param)
     */
    private static function prepareQuery($query, $param) {
        // First replace the variable placeholder with their respective values
        $query = self::replaceVars($query);

        // Parameters are defined as array like:
        // param = array(
        //  0 => :placeholder,
        //  1 => 'value' | array('values'),
        //  2 => PDO::PARAM_[INT|STR]
        // [3 => (int)length of value] <- necessary for PDO::PARAM_STR
        // )
        foreach ($param as $i => $pmi) {
            // The query parameter values are stored at index 1
            if (is_array($pmi)) {
                $query_filter = array();
                if (is_array($pmi[1])) {
                    foreach ($pmi[1] as $j => $tag) {
                        // Add each tag with its placeholder name and its index to the new filter
                        $placeholder = $pmi[0] . $j;

                        // Replacement for the ':tags' placeholder in the query
                        $query_filter[] = $placeholder;
                    }

                    // Join new parameter placeholder to a sequence of placeholder
                    $query_filter = (join(',', $query_filter));

                    // Replace the parameter placeholder
                    $query = str_replace($pmi[0], $query_filter, $query);
                }
            }
        }
        return $query;
    }

    /**
     * Modify a query by replacing its variable placeholders with their respective values.
     *
     * @since 1.1
     * @access private
     *
     * @param string $query the query
     * @return string
     */
    private static function replaceVars($query) {
        if (empty(self::$vars)) {
            // Nothing to do here when there are no variables set.
            return $query;
        }
        return str_replace(array_keys(self::$vars), self::$vars, $query);
    }

    /**
     * Bind parameter by its token, value, type and (if string by its length)
     * to the reference of a statement.
     */
    private static function bindParam(&$stmt, $token, $value, $type) {
        $length = $type === PDO::PARAM_STR ? strlen($value) : null;
        $stmt->bindParam($token, $value, $type, $length);
    }

}
