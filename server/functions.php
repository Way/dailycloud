<?php
defined('AUTOLOAD') or exit('No direct access!');

/**
 * Ease the access to the configuration.
 * @use config(key) to get the specified config value(s).
 * @use config(key, val) to set the specified config value(s).
 */
function config($key, $val = null) {
    if ($val == null) {
        // get
        return Config::instance()->$key;
    }
    // set
    Config::instance()->$key = $val;
}

/**
 * Ease the access to the loaded language entries.
 */
function lang($entry) {
    return Language::instance()->lang($entry);
}

/**
 * Ease the access to the global GET values.
 */
function get($key) {
    if (isset($_GET[$key])) {
        return $_GET[$key];
    }
    return null;
}

/**
 * Ease the access to the global POST values.
 */
function post($key) {
    if (isset($_POST[$key])) {
        return $_POST[$key];
    }
    return null;
}

/**
 * Ease the curl functionality to fetch the content of any page by its url
 */
function get_url_contents($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    #curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
    #curl_setopt($ch, CURLOPT_ENCODING, 'deflate, gzip, identity');
    #curl_setopt($ch, CURLOPT_HEADER, TRUE);

    $response = curl_exec($ch);

    // Check for error or not valid response code
    if (curl_errno($ch) || curl_getinfo($ch, CURLINFO_HTTP_CODE) != 200) {
        $response = null;
    }

    curl_close($ch);
    return $response;
}

/**
 * Helper function to call http requests (GET or POST) with parameters and to handle the response format
 */
function rest_helper($url, $params = null, $verb = 'GET', $format = 'json') {
    $cparams = array('http' => array(
                'method' => $verb,
                'ignore_errors' => true
        ));
    if ($params !== null) {
        $params = http_build_query($params);
        if ($verb == 'POST') {
            $cparams['http']['content'] = $params;
        } else {
            $url .= '?' . $params;
        }
    }

    $context = stream_context_create($cparams);
    $fp = @fopen($url, 'rb', false, $context);
    if (!$fp) {
        $res = false;
    } else {
        // If you're trying to troubleshoot problems, try uncommenting the
        // next two lines; it will show you the HTTP response headers across
        // all the redirects:
        // $meta = stream_get_meta_data($fp);
        // var_dump($meta['wrapper_data']);
        $res = stream_get_contents($fp);
    }

    if ($res === false) {
        throw new Exception("$verb $url failed: $php_errormsg");
    }

    switch ($format) {
        case 'json':
            $r = json_decode($res);
            if ($r === null) {
                throw new Exception("failed to decode $res as json");
            }
            return $r;

        case 'xml':
            $r = simplexml_load_string($res);
            if ($r === null) {
                throw new Exception("failed to decode $res as xml");
            }
            return $r;
    }
    return $res;
}

/**
 * Asynchronous POST request.
 * Fire off a POST request via a socket and return immediately.
 */
function curl_post_async($url, $params, $sleep_ms = 0) {
    foreach ($params as $key => &$val) {
        if (is_array($val)) {
            $val = implode(',', $val);
        }
        $post_params[] = $key . '=' . urlencode($val);
    }
    $post_string = implode('&', $post_params);
    $parts = parse_url($url);

    $fp = fsockopen($parts['host'], isset($parts['port']) ? $parts['port'] : 80, $errno, $errstr, 30);

    $out = "POST " . $parts['path'] . " HTTP/1.1\r\n";
    $out .= "Host: " . $parts['host'] . "\r\n";
    $out .= "Content-Type: application/x-www-form-urlencoded\r\n";
    $out .= "Content-Length: " . strlen($post_string) . "\r\n";
    $out .= "Connection: Close\r\n\r\n";
    if (isset($post_string))
        $out .= $post_string;

    fwrite($fp, $out);
    fclose($fp);

    if ($sleep_ms > 0) {
        usleep($sleep_ms * 1000);
    }
}

/**
 * Debug the output of a value wrapped by '<pre>'-tags.
 * Optional set a title for the debugged value.
 */
function debug() {
    call_user_func_array(array(
            Diagnostic::instance(),
            'log'
    ), func_get_args());
}

/**
 * Returns the url which is set as root url.
 */
function root_url() {
    return ROOT;
}

/**
 * Returns the site url which is created by concatting the root url and a site name.
 */
function url($site) {
    if (!is_array($site)) {
        $site = array($site);
    }
    $url = root_url() . trim(join('/', $site), '/');
    return $url;
}

/**
 * Header Redirect.
 *
 * @param string the URL for the redirect
 * @param string the method: refresh or location
 */
function redirect($uri = '', $method = 'location', $http_response_code = 302) {
    if (!preg_match('#^https?://#i', $uri)) {
        $uri = url($uri);
    }

    switch($method) {
        case 'refresh':
            header("Refresh:0;url=" . $uri);
            break;
        default:
            header("Location: " . $uri, TRUE, $http_response_code);
            break;
    }
    exit ;
}

/**
 * Throw exception wrapper.
 */
function throw_exception($ex) {
    throw $ex;
}

/**
 * is_productive
 */
function is_productive() {
    if (defined('ENVIRONMENT')) {
        return ENVIRONMENT == ApplicationEnvironment::PRODUCTIVE;
    }
    return false;
}

/**
 * is_localhost
 */
function is_localhost() {
    $pos = strpos(Server::getCurrentUrl(), 'http://localhost/');
    if ($pos === false) {
        return false;
    }
    return true;
}

/**
 * is_https
 */
function is_https() {
    return isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on';
}
