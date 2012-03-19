<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * BookmarkMap
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Map the relation between user and his bookmarks.
 *
 * @class     -   BookmarkMap
 * @file      -   BookmarkMap.php
 * @location  -   ./server/database/model/BookmarkMap.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class BookmarkMap extends RemoteDataAccess {
    /**
     * Name of the table.
     */
    public static $table_name = 'bookmarks';

    /**
     * Name of the map table.
     */
    public static $map_table_name = 'bookmarkmap';

    /**
     * Name of the model.
     */
    public static $model_name = 'BookmarkModel';

    /**
     * Model to create new instance.
     */
    private $_model;

    /**
     * Query to get all bookmarks of the user.
     */
    private static $_query_all = <<<SQL
        SELECT DISTINCT
            b.*
        FROM
            TABLE_NAME b
            
        LEFT JOIN 
            MAP_TABLE_NAME bm ON b.id = bm.bookmarkid
            
        WHERE   bm.userid = :userid
        AND     bm.deleted = :deleted
        
        ORDER BY created DESC
SQL;

    /**
     * Query to get all new bookmarks of the user.
     */
    private static $_query_new = <<<SQL
        SELECT DISTINCT
            b.*
        FROM
            TABLE_NAME b
            
        LEFT JOIN
            MAP_TABLE_NAME bm ON b.id = bm.bookmarkid
            
        WHERE   bm.userid = :userid
        AND     bm.deleted = '0'
        AND     bm.new = '1'
        
        ORDER BY created DESC
SQL;

    /**
     * Query to get the latest bookmarks of the user.
     */
    private static $_query_latest = <<<SQL
        SELECT DISTINCT
            b.*
        FROM
            TABLE_NAME b
            
        LEFT JOIN
            MAP_TABLE_NAME bm ON b.id = bm.bookmarkid
            
        WHERE   bm.userid = :userid
        AND     bm.deleted = '0'
        
        ORDER BY created DESC
        
        LIMIT :start, :limit
SQL;

    /**
     * Query to get the number of bookmarks of the user.
     */
    private static $_query_count = <<<SQL
        SELECT COUNT(*) AS count
        FROM
            TABLE_NAME b
            
        LEFT JOIN
            MAP_TABLE_NAME bm ON b.id = bm.bookmarkid
            
        WHERE   bm.userid = :userid
        AND     bm.deleted = '0'
SQL;

    /**
     * Constructor
     *
     * @access public
     */
    public function __construct($userid, $bookmarkid) {
        $this->_model = new BookmarkMapModel();
        $this->_model->create(array(
            'userid' => $userid,
            'bookmarkid' => $bookmarkid,
            'created' => time()
        ));
    }

    /**
     * Static constructor
     *
     * @access public
     */
    public static function __static() {
        // Set query variables.
        // NOTE: Take care of the order in this array to prevent weird replacements.
        self::$vars = array(
            'MAP_TABLE_NAME' => self::$map_table_name,
            'TABLE_NAME' => self::$table_name
        );
    }

    /**
     * Save the current model.
     *
     * @return array
     */
    public function save() {
        if ($this->_model !== null) {
            return $this->_model->save();
        }
    }

    /**
     * Delete the current model.
     *
     * @return boolean
     */
    public function delete($id = null) {
        if ($id !== null) {
            $this->_model = BookmarkMapModel::createDirectly(array('id' => $id));
        }
        if ($this->_model !== null) {
            $this->_model->deleted = 1;
            $this->_model->save();
        }
    }

    /**
     * Get all non-deleted bookmarks of the user.
     *
     * @access public
     *
     * @param int $userid
     * @return array
     */
    public static function getAll($userid, $deleted = '0') {
        $param = array(
            StatementParameter::createParam(':userid', $userid),
            StatementParameter::createParam(':deleted', $deleted)
        );
        return self::runQuery(self::$_query_all, $param, self::$model_name);
    }

    /**
     * Get all new bookmarks of the user.
     *
     * @access public
     *
     * @param int $userid
     * @return array
     */
    public static function getNew($userid) {
        $param = array(StatementParameter::createParam(':userid', $userid));
        return self::runQuery(self::$_query_new, $param, self::$model_name);
    }

    /**
     * Get the latest bookmarks of the user limited.
     *
     * @access public
     *
     * @param int $userid
     * @param int $limit (default: 10)
     * @return array
     */
    public static function getLatest($userid, $limit = 10, $start = 0) {
        $param = array(
            StatementParameter::createParam(':userid', $userid),
            StatementParameter::createParam(':start', $start),
            StatementParameter::createParam(':limit', $limit)
        );
        return self::runQuery(self::$_query_latest, $param, self::$model_name);
    }

    /**
     * Get the number of non-deleted bookmarks of the user.
     *
     * @access public
     *
     * @param int $userid
     * @return array
     */
    public static function getCount($userid) {
        $param = array(StatementParameter::createParam(':userid', $userid));
        $result = self::runQuery(self::$_query_count, $param, self::$model_name);
        
        // return only the first entry of the result
        return $result[0];
    }

}
