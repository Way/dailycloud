<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * DataTables
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Enum-like class to hold and provide global access to the
 * available database table names.
 *
 * @file      -   DataTables.php
 * @location  -   ./server/database/DataTables.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class DataTables extends Singleton {

    // Relation between model and their datatable names
    private $BookmarkModel = 'bookmarks';
    private $BookmarkMapModel = 'bookmarkmap';
    private $SessionModel = 'sessions';
    private $UserModel = 'users';
    private $UserDetailsModel = 'userdetails';
    private $NoteModel = 'notes';
    private $TagModel = 'tags';
    private $TagMapModel = 'tagmap';
    private $SettingsModel = 'settings';

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * Get the table name of the data model by its class name.
     *
     * @access public
     *
     * @return string
     */
    public static function getTable($className) {
        if (is_string($className) == false) {
            // class instance
            $className = get_class($className);
        }
        return self::instance()->$className;
    }

    public function __get($name) {
        return $this->$name;
    }

}
