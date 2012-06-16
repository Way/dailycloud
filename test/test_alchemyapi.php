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
#include '../server/externals/alchemyapi/AlchemyAPI.php';

// Or load the AlchemyAPI PHP+CURL module.
include '../server/externals/alchemyapi/AlchemyAPI_CURL.php';

// Create an AlchemyAPI object.
$alchemy = new AlchemyAPI();

// Load the API key from disk.
$alchemy->setAPIKey(config('service')->alchemyapi['api_key']);

$url = 'http://dailyjs.com/';

// Get html from url
$html = file_get_contents($url);

// Output mode
$mode = AlchemyAPI::JSON_OUTPUT_MODE;

// Keyword / Terminology Extraction
// @url http://www.alchemyapi.com/api/keyword/
$keywords = $alchemy->HTMLGetRankedKeywords($html, $url, $mode);
debug($keywords, 'Keywords');

// Topic Categorization
// @url http://www.alchemyapi.com/api/categ/
$topic = $alchemy->HTMLGetCategory($html, $url, $mode);
debug($topic, 'Topic');

// Language Detection
// @url http://www.alchemyapi.com/api/lang/
$language = $alchemy->HTMLGetLanguage($html, $url, $mode);
debug($language, 'Language');

// Author Extraction
// @url http://www.alchemyapi.com/api/author/
$author = $alchemy->HTMLGetAuthor($html, $url, $mode);
debug($author, 'Author');

// Text Extraction / Web Page Cleaning
// @url http://www.alchemyapi.com/api/text/
$text = $alchemy->HTMLGetText($html, $url, $mode);
debug($text, 'Text');

// Output and teardown test environment
$test->finish();
