<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Config
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Configuration registry class
 *
 * @class     -   Config
 * @file      -   Config.php
 * @location  -   ./server/library/Config.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Config extends Singleton {
    /**
     * Registry of configuration data
     */
    private $registry = array();

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * See if a key exists
     *
     * @param string $key key name
     * @return bool
     */
    public function exists($key) {
        return isset($this->registry[$key]);
    }

    /**
     * Fetch data from registry
     *
     * @param string $key key name
     * @return mixed (empty object on invalid key)
     */
    public function get($key) {
        if (!isset($key) || empty($key)) {
            return null;
        }
        if (!$this->exists($key)) {
            return new stdClass;
        }
        return $this->registry[$key];
    }

    /**
     * Magically get.
     */
    public function __get($key) {
        return $this->get($key);
    }

    /**
     * Set data in registry
     *
     * Note: arrays become objects for easy fetching
     *
     * @param string $key key name
     * @param mixed  $val value to store
     * @return bool true if new key, false if key already exists
     */
    public function set($key, $val) {
        $new = !$this->exists($key);
        if (!$new && is_array($val)) {
            // Extend existing config key-value pair when the value is an array.
            $val_key = key($val);
            $this->registry[$key]->$val_key = $val[$val_key];
        } else {
            if (is_scalar($val)) {
                $this->registry[$key] = $val;
            } else {
                $this->registry[$key] = (object)$val;
            }
        }
        return $new;
    }

    /**
     * Magically set.
     */
    public function __set($key, $val) {
        return $this->set($key, $val);
    }

    /**
     * Unset data
     *
     * @param string $key key name
     * @return void
     */
    public function clear($key) {
        if ($this->exists($key)) {
            unset($this->registry[$key]);
        }
    }

}
