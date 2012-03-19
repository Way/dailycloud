<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Html
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * HTML Tag Builder
 *
 * @class     -   Html
 * @file      -   Html.php
 * @location  -   ./server/library/Html.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Html {

    /**
     * Anchor Link
     *
     * Creates an anchor based on the local URL.
     *
     * @access  public
     *
     * @param $uri string - the URL
     * @param $title string - the link title
     * @param $attr mixed - any attributes (optional)
     * @return string
     */
    public static function anchor($uri = '', $title = '', $attr = '') {
        $title = (string)$title;

        if (!is_array($uri)) {
            $site_url = (!preg_match('!^\w+://! i', $uri)) ? url($uri) : $uri;
        } else {
            $site_url = url($uri);
        }

        if ($title == '') {
            $title = $site_url;
        }

        if ($attr != '') {
            $attr = self::_parse_attributes($attr);
        }

        return '<a href="' . $site_url . '"' . $attr . '>' . $title . '</a>';
    }

    /**
     * Script tag
     *
     * Creates a script tag.
     *
     * @access public
     *
     * @param $src string - source (path) of the script
     * @param $attr mixed - any attributes (optional)
     */
    public static function script($src, $attr = '') {
        if ($attr != '') {
            $attr = self::_parse_attributes($attr);
        }

        return '<script src="' . $src . '"' . $attr . '></script>';
    }

    /**
     * Link tag
     *
     * Creates a link tag.
     *
     * @access public
     *
     * @param $href string - href of the link
     * @param $attr mixed - any attributes (optional)
     */
    public static function link($href, $attr = '') {
        if ($attr != '') {
            $attr = self::_parse_attributes($attr);
        }

        return '<link href="' . $href . '"' . $attr . '/>';
    }

    /**
     * Parse out the attributes
     *
     * Some of the functions use this
     *
     * @access  private
     * @param   array
     * @param   bool
     * @return  string
     */
    static function _parse_attributes($attr, $javascript = false) {
        if (is_string($attr)) {
            return ($attr != '') ? ' ' . $attr : '';
        }

        $att = '';
        foreach ($attr as $key => $val) {
            if ($javascript == true) {
                $att .= $key . '=' . $val . ',';
            } else {
                $att .= ' ' . $key . '="' . $val . '"';
            }
        }

        if ($javascript == true && $att != '') {
            $att = substr($att, 0, -1);
        }

        return $att;
    }

}
