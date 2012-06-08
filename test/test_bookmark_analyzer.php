<?php
/**
 * TEST
 *
 * Request functionality
 */

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Start session
Session::init();

//
// START TEST
//

$url = get('url');

$data = array();
$data['url'] = $url;

if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
    // ignore non valid url requests
    $data['error'] = 'Invalid url';
    echo json_encode($data);
    exit ;
}

$content = get_url_contents($url);

$dom = new SimpleHtmlDom;
#$dom->load($content);
$dom = file_get_html($url);

$title = $dom->find('title', 0);
$data['title'] = $title != null ? trim($title->innertext) : null;

$desc = $dom->find('meta[name=description]', 0);
$data['desc'] = $desc != null ? trim($desc->content) : null;

$tags = $dom->find('meta[name=keywords]', 0);
$data['tags'] = $tags != null ? trim($tags->content) : null;


// memory leak clean up
$dom->clear();
unset($dom);

echo json_encode($data);

// Output and teardown test environment
$test->finish();
