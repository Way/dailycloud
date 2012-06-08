<?php
/**
 * TEST
 *
 * Alchemy API
 */

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Load test environment
$test = new Test(__FILE__);

// Load the AlchemyAPI module code.
#include "../server/externals/alchemyapi/AlchemyAPI.php";

// Or load the AlchemyAPI PHP+CURL module.
include "../server/externals/alchemyapi/AlchemyAPI_CURL.php";

// Create an AlchemyAPI object.
$alchemyObj = new AlchemyAPI();

// Load the API key from disk.
$alchemyObj->setAPIKey(config('service')->alchemyapi['api_key']);

// Extract topic keywords from a web URL.
$result = $alchemyObj->URLGetRankedKeywords("http://www.techcrunch.com/", AlchemyAPI::JSON_OUTPUT_MODE);
echo "$result<br/><br/>\n";

// Output and teardown test environment
$test->finish();
