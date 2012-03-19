<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * iDataModel - Interface
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * The iDataModel Interface describes all necessary functions
 * an application model needs.
 * Beside the basic CRUD-functions a model needs at least
 * the getter to allocate access to their table and fields.
 *
 * @interface -   iDataModel
 * @file      -   iDataModel.php
 * @location  -   ./server/database/interface/iDataModel.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
interface iDataModel {
    // Create new instance
    public function create($attr);

    // Save instance in db
    public function save();

    // Update instance
    public function update();

    // Delete instance
    public function delete();

    // Get name of table in db
    public static function getTable($class);

    // Get all fields of this model
    public static function getFields($class);

}
