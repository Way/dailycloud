<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Language
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Language class
 *
 * @file      -   Language.php
 * @location  -   ./server/library/Language.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Language extends Singleton {

    const i18n_filePath = 'server/i18n/lang/lang_{LANGUAGE}.ini';
    const i18n_cachePath = 'server/i18n/langcache/';

    private $lang;
    private $i18n;
    private $entries = array();

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * Initialize language environment.
     * Loads the language currently set in the configuration.
     *
     * @access public
     */
    public static function init() {
        $lang = (config('app')->lang);
        self::instance()->setup($lang);
    }

    /**
     * Setup language and create i18n instance.
     *
     * @access private
     */
    private function setup($lang) {
        $this->lang = $lang;
        $this->loadLang();

        // Create i18n instance
        $this->i18n = new I18n(self::i18n_filePath, self::i18n_cachePath, $this->lang);
        $this->i18n->init();
    }

    /**
     * Load current language.
     *
     * @since 1.0
     * @access public
     *
     * @param (string) $lang - [optional] name of language
     * @param (string) $file - [optional] name of the file to load
     * @return self::instance
     */
    public function loadLang($language = null, $file = 'lang.php') {
        if ($language != null) {
            $this->lang = $language;
        }
        $this->loadFile($file);
        return $this;
    }

    /**
     * Load langauge file.
     *
     * @since 1.0
     * @access public
     *
     * @param (string) $file - name of the file to load
     * @return self::instance
     */
    public function loadFile($file) {
        $file = APP_PATH . 'lang/' . $this->lang . '/' . $file;

        if (file_exists($file)) {
            include ($file);
            if (isset($lang)) {
                $this->entries = array_merge($this->entries, $lang);
            }
            unset($lang);
        }
        return $this;
    }

    /**
     * Return the language specific entry element.
     *
     * @since 1.0
     * @access public
     *
     * @param (string) $entry - name of entry
     * @return (string) value of entry
     */
    public function lang($entry) {
        if (isset($this->entries[$entry])) {
            return $this->entries[$entry];
        }
        return $entry;
    }

}
