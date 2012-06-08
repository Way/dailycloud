<?php
/**
 * TEST
 *
 * Request functionality
 */

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Load test environment
$test = new Test(__FILE__);

//
// START TEST
//

$data = array();
$data['tags'] = 'TagA,TagB, TagC TagD, TagE TagA,    TagB,     TagF';

// Split tags by comma and space
$data['tags'] = preg_split("/[,| ]+/", $data['tags']);

// Trim splitted tags
$data['tags'] = array_map('trim', $data['tags']);

// Remove duplicated tags (using array_values to close the gaps between the keys)
$data['tags'] = array_values(array_unique($data['tags']));

debug($data['tags']);

// Output and teardown test environment
$test->finish();

