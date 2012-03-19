<?php
defined('ROOT') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Server UI loading
 *---------------------------------------------------------------
 *
 * Set up user interface engine and display startpage.
 *
 * @package dailyd
 * @version 1.0
 */

define('UI_PATH', str_replace(BASE_PATH, '', SERVER_UI_PATH));

$gears = new Gears(APP_UI_PATH, 'php');
$gears->bind(array('lang' => config('app')->lang,
    'version' => config('app')->version,
    'title' => lang('title'),
    'css' => UI_PATH . 'css' . EXT,
    'js' => UI_PATH . 'js' . EXT . '?hl=' . config('app')->lang));

$gears->setLayout('app')->display('app');
