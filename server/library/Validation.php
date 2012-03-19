<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Validation
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Validation class
 *
 * @file      -   Validation.php
 * @location  -   ./server/library/Validation.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Validation extends Singleton {
    private $_rules = array();

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * Validate url by using filter_var but with the support of internationalized domain names (IDN).
     * A non-ascii char is more than one byte long. We replace every one of those chars by "X" and check again.
     *
     * @see http://www.php.net/manual/en/function.filter-var.php#104160
     *
     * @access public
     *
     * @param string $url
     * @return boolean
     */
    public function validateUrl($url, $filter = FILTER_VALIDATE_URL) {
        // TODO is this method sufficiently enough?
        return filter_var($url, $filter);
    }

}
