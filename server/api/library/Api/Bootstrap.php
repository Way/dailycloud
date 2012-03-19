<?php

/**
 * Construct paths and other resources
 */

// Current directory
$current_dir = str_replace('\\', '/', dirname(__FILE__));
$last_slash_pos = strrpos($current_dir, '/');

define('PATH'				, substr($current_dir, 0, $last_slash_pos));
define('PATH_API'			, PATH . '/Api');
define('PATH_API_HOOK'		, PATH_API . '/Hook');
define('PATH_API_SERVICE'	, PATH_API . '/Service');
define('PATH_API_PARSER'	, PATH_API . '/Parser');