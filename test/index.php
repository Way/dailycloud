<?php
/**
 * Test startpage
 * List of all available test files with their link to start.
 *
 * @package dailyd
 * @version 1.0
 */

if(!defined('TEST_PATH')) {
    $path = pathinfo(__FILE__, PATHINFO_DIRNAME);
    define('TEST_PATH', str_replace('\\', '/', rtrim($path, '/') . '/'));
}

/**
 * List of all tests
 */
$tests = glob(TEST_PATH . 'test_*' . '.php');
if($tests === false || empty($tests)) {
    exit('No tests available!');
}

echo "<ul>";
foreach($tests as $test) {
    $pathinfo = pathinfo($test);
    $filename = $pathinfo['filename'];
    $basename = $pathinfo['basename'];
    echo "<li><a href=\"$basename\">$filename</a></li>";
}
echo "</ul>";
