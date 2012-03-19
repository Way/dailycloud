<?php
/**
 * TEST
 *
 * Favicon creator
 */

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Load test environment
$test = new Test(__FILE__);

$favicon = new favicon('http://stackoverflow.com/', 0);
$fv = $favicon->get_output_data();

if ($fv !== '') {
    header('Content-type: image/png');
    echo $fv;
}
