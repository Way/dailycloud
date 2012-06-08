<?php

/**
 * Flag to enable autoload and its debugging.
 */
define('AUTOLOAD', 1);
define('DEBUG_AUTOLOAD', 0);

/**
 * Load mandatory types, functions and application config automatically.
 */
require_once ('functions.php');
require_once ('types.php');
require_once ('settings.php');
require_once (APP_PATH . 'config.php');

/**
 * Load a PHP Class automatically upon instantiation.
 * Register and override this function as __autoload implementation.
 * (use spl_autoload_register('autoload_function_name'); if you don't name the function __autoload)
 * 
 * @version 1.0
 * @access public
 *  
 * @param (String) $class_name
 * @return
 */
function __autoload($class_name) {
    static $files = null;

    $success = false;
    $class_file = strtolower($class_name) . EXT;

    DEBUG_AUTOLOAD && dump($class_name, '__autoload');

    if (empty($files)) {
        $files = array();
        
        // List all directories that contains autoloadable files.
        // Use '*' to include all subdirectories.
        $dirs = array(
            'auth/*',
            'database/*',
            'externals/*',
            'helper/*',
            'i18n/*',
            'library/*',
            'ui/builder/*'
        );
        
        DEBUG_AUTOLOAD && dump($dirs, 'dirs');
        
        // Check for directory with subdirectories (marked with a '*' in its name).
        // Add server root path to the directories.
        $search_dirs = array();
        foreach ($dirs as $dir) {
            if (strstr($dir, '*')) {
                $dir = SERVER_PATH . str_replace('*', '', $dir);
                $search_dirs[] = $dir;
                
                DEBUG_AUTOLOAD && dump($dir, 'dir');
                
                $iterator = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($dir), 
                    RecursiveIteratorIterator::SELF_FIRST
                );

                foreach ($iterator as $filename => $file) {
                    if ($file->isDir()) {
                        $search_dirs[] = str_replace('\\', '/', strtolower($file)) . '/';
                    }
                }
            }
            else {
                $search_dirs[] = SERVER_PATH . $dir;
            }
        }
        
        DEBUG_AUTOLOAD && dump($search_dirs, 'search_dirs');

        // For each directory, save the available files in the $files array.
        $fn_filter_name = create_function('$a', 'return strtolower(basename($a));');
        foreach ($search_dirs as $dir) {
            $glob = glob($dir . '*' . EXT);
            if ($glob === false || empty($glob)) continue;
            
            $fnames = array_map($fn_filter_name, $glob);
            $files = array_merge($files, array_combine($fnames, $glob));
        }

        DEBUG_AUTOLOAD && dump($files, 'files');
    }

    // Search in the available files for the undefined class file.
    if (isset($files[$class_file])) {
        require $files[$class_file];
        
        // If the class has a static method named __static(), execute it now, on initial load.
        if (class_exists($class_name, false) && method_exists($class_name, '__static')) {
            call_user_func(array($class_name, '__static'));
        }
        $success = true;
    }
}
