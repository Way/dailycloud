<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * DataBase
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Global Instance of a DataBase connection.
 *
 * @file      -   DataBase.php
 * @location  -   ./server/DataBase/DataBase.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class DataBase extends Singleton {
    private static $instance = null;

    const config_db_key = 'db';

    /**
     * Return DB instance or create intitial connection
     *
     * @since 1.0
     * @access public
     *
     * @return object (PDO)
     */
    public static function instance() {
        if(!self::$instance) {
            try {
                $cfg = config(self::config_db_key);
                
                $dns = $cfg->dns;
                $user = $cfg->username;
                $pass = $cfg->password;
                self::$instance = new PDO($dns, $user, $pass);

                // set the error reporting attribute
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch(PDOException $e) {
                // DB Connection error
                printf("Connect failed: %s\n", $e->getMessage());
                exit();
            }
        }
        return self::$instance;
    }

}
