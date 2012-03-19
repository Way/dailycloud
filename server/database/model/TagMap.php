<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * TagMap
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Map the relation between tags and their targets.
 *
 * @class     -   TagMap
 * @file      -   TagMap.php
 * @location  -   ./server/database/model/TagMap.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class TagMap extends RemoteDataAccess {
    /**
     * Name of the table.
     */
    public static $table_name = 'tags';

    /**
     * Name of the map table.
     */
    public static $map_table_name = 'tagmap';

    /**
     * Name of the model.
     */
    public static $model_name = 'TagModel';

    /**
     * Model to create new instance
     */
    private $_model;

    /**
     * Query to get all targets with their tags.
     */
    private static $_query_all = <<<SQL
        SELECT DISTINCT
            x.*
            
        FROM
            :target x
            
        LEFT JOIN
            MAP_TABLE_NAME tm ON x.id = tm.targetid
            
        LEFT JOIN
            TABLE_NAME t ON tm.tagid = t.id
            
        WHERE   x.userid = :userid
        AND     x.deleted = '0'
            
        ORDER BY updated DESC
SQL;

    /**
     * Query to get all targets matching a given list of tags.
     *
     * Leaving HAVING COUNT leads to OR instead of AND by matching the tags
     */
    private static $_query_filter = <<<SQL
        SELECT DISTINCT
            x.*
            
        FROM
            :target x,
            MAP_TABLE_NAME tm,
            TABLE_NAME t
            
        WHERE   x.userid = :userid
        AND     tm.userid = :userid
        AND     t.userid = :userid
        AND     tm.tagid = t.id
        AND     tm.target = :target
        AND     x.id = tm.targetid
        AND     (t.name IN (:tags))
        
        HAVING COUNT(x.id) >= :count
        
        ORDER BY updated DESC
SQL;

    /**
     * Query to search for all tags associated with a target by the tagmap.
     */
    private static $_query_search = <<<SQL
        SELECT DISTINCT
            t.id, t.name
            
        FROM
            TABLE_NAME t
            
        INNER JOIN
            MAP_TABLE_NAME tm ON tm.tagid = t.id
        
        WHERE   t.userid = :userid
        AND     tm.userid = :userid
        AND     tm.targetid = :targetid
        AND     tm.target = :target
        
        ORDER BY t.name DESC
SQL;

    /**
     * Query to get the number of tags of the user.
     */
    private static $_query_count = <<<SQL
        SELECT COUNT(*) AS count
        FROM
            MAP_TABLE_NAME tm
        WHERE   tm.userid = :userid
SQL;

    /**
     * Constructor
     *
     * @access public
     */
    public function __construct($userid, $tagid, $targetid, $target) {
        $this->_model = new TagMapModel();
        $this->_model->userid = $userid;
        $this->_model->tagid = $tagid;
        $this->_model->targetid = $targetid;
        $this->_model->target = $target;
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
    public function delete() {
        if ($this->_model !== null) {
            return $this->_model->delete();
        }
    }

    /**
     * Add new tag to a target.
     * Maybe create the tag firstly when it doesn't exists yet.
     *
     * @access public
     *
     * @param $userid
     * @param $target
     * @param $targetId
     * @param $tagName
     * @return $tag
     */
    public static function addTag($userid, $target, $targetId, $tagName) {
        $tagAttr = array(
            'userid' => $userid,
            'name' => strtolower($tagName)
        );

        $req = new DataAccessRequest();
        $req->where = $tagAttr;
        $req->limit = 1;
        $tag = TagModel::searchReq($req);

        if ($tag === null || sizeof($tag) === 0) {
            // Tag does not already exist -> Create it
            $tag = new TagModel;
            $tag->create($tagAttr);
            $tag->save();
        } else {
            // Tag found <-> already exists
            $tag = $tag[0];
        }

        // Create tagmap entry
        $tagmap = new self($userid, $tag->id, $targetId, $target);
        $tagmap->save();
        return $tag;
    }

    /**
     * Get all targets that will match the filter.
     * The filter needs to contain the name of the
     * targets table 'target' as well as its class name.
     * The 'tags' and the 'count' value will define the
     * at least number of tags that will be returned.
     *
     * @access public
     *
     * @param array $param
     * @param string $class [optional] - to set the fetch mode to class
     * @return array
     */
    public static function filter(array $param, $class = null) {
        $result = array();
        $query = self::$_query_filter;
        $result = self::runQuery($query, $param, $class);
        return $result;
    }

    /**
     * Search for all tags assigned to a target.
     *
     * @access public
     *
     * @param array $param
     * @param string $class [optional] - to set the fetch mode to class
     * @return array
     */
    public static function search($param, $class = 'TagModel') {
        $result = array();
        $query = self::$_query_search;
        $result = self::runQuery($query, $param, $class);
        return $result;
    }

    /**
     * Get all tags of the user assigned to the object.
     *
     * @access public
     *
     * @param $userid int - user id
     * @param $obj object - target
     * @return array
     */
    public static function getTags($userid, $obj) {
        $params = array(
            array(
                ':userid',
                $userid,
                PDO::PARAM_INT
            ),
            array(
                ':targetid',
                $obj->id,
                PDO::PARAM_INT
            ),
            array(
                ':target',
                DataTables::getTable($obj),
                PDO::PARAM_STR
            )
        );
        return self::search($params);
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
