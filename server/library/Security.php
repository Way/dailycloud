<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Security
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Measure the runtime and memory usage of function.
 *
 * @class     -   Security
 * @file      -   Security.php
 * @location  -   ./server/library/Security.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Security extends Singleton {

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * saltTheHash(a,b)
     *
     * @param {string} $givenPassword = beliebiges Kennwort, das ver- bzw. entschluesselt wird
     * @param {string} $givenSalt = Vergleichskennwort, welches z.B. aus der Datenbank gelesen wird
     */
    public static function saltTheHash($givenPassword, $givenSalt = null) {
        $saltHash = array();
        $saltHash['salt'] = $givenSalt;
        $saltHash['password'] = $givenPassword;
        $saltHash['saltedHash'] = null;

        /**
         * Private key
         * NOTE: Take care of the escape sequences!
         */
        $saltHash['privateKey'] = "
        WKobxlp9Gr1
        JH41VCC,@i*6I714N7@744GIbYbkUbLTO5UU4uv/E0Y(h:F;Fao*OReDK?LP66ajhDvb-3IF6FM%zEk*8ZYf>@30@s
        H-Gs%s4DAiO##1*4s029UX6iWUq*rO>8&5V:Ut-&Wa)v,&qVS1MVNy-IwH@Y6-Gs%s43&k6CVIELQCY5cM30XW97LY
        1j0l2OU<<9c5uYGHk:
        e3lNTe4R4LNT*f!9VoOFfO3<6CM8kfVAM<5%6Vve86+gKm*m(Bnce?E3AiWRLRZjV5yvZT98P/1!g!ZtGs%s4?;h5%
        ";

        // With only one parameter we shall generate a new salt
        if ($saltHash['salt'] == null) {

            // Use timestamp with microseconds accuracy to ensure the uniqueness of the salt
            $saltHash['salt'] = microtime();

            // Store the salt as 32bit polynomial string
            $saltHash['salt'] = crc32($saltHash['salt']);

            // Pack the salt into a binary string
            $saltHash['salt'] = pack('N', $saltHash['salt']);

            // Encode the salt with MIME base64
            $saltHash['salt'] = base64_encode($saltHash['salt']);

            // Take only the first 6 chars of the salt
            $saltHash['salt'] = substr($saltHash['salt'], 0, 6);
        }
        // With two parameters available we have to compare a password with its hash.
        // Ensure that the defined and necessary delimiter "|" (Pipe) does exist.
        else if (strpos($saltHash['salt'], "|") !== false) {
            // Strip out the salt of the hash
            $saltHash['salt'] = substr($saltHash['salt'], 0, strpos($saltHash['salt'], "|"));
        }

        //
        // Generate the salted hash
        //
        $saltHash['saltedHash'] = $saltHash['salt'];
        $saltHash['saltedHash'] .= "|";
        $saltHash['saltedHash'] .= sha1($saltHash['privateKey']);
        $saltHash['saltedHash'] .= sha1($saltHash['salt'] . $saltHash['password']);

        return $saltHash['saltedHash'];
    }

    /**
     * Translates a number to a short alhanumeric version
     *
     * Translated any number up to 9007199254740992
     * to a shorter version in letters e.g.:
     * 9007199254740989 --> PpQXn7COf
     *
     * specifiying the second argument true, it will
     * translate back e.g.:
     * PpQXn7COf --> 9007199254740989
     *
     * this function is based on any2dec && dec2any by
     * fragmer[at]mail[dot]ru
     * see: http://nl3.php.net/manual/en/function.base-convert.php#52450
     *
     * If you want the alphaID to be at least 3 letter long, use the
     * $pad_up = 3 argument
     *
     * In most cases this is better than totally random ID generators
     * because this can easily avoid duplicate ID's.
     * For example if you correlate the alpha ID to an auto incrementing ID
     * in your database, you're done.
     *
     * The reverse is done because it makes it slightly more cryptic,
     * but it also makes it easier to spread lots of IDs in different
     * directories on your filesystem. Example:
     * $part1 = substr($alpha_id,0,1);
     * $part2 = substr($alpha_id,1,1);
     * $part3 = substr($alpha_id,2,strlen($alpha_id));
     * $destindir = "/".$part1."/".$part2."/".$part3;
     * // by reversing, directories are more evenly spread out. The
     * // first 26 directories already occupy 26 main levels
     *
     * more info on limitation:
     * - http://blade.nagaokaut.ac.jp/cgi-bin/scat.rb/ruby/ruby-talk/165372
     *
     * if you really need this for bigger numbers you probably have to look
     * at things like: http://theserverpages.com/php/manual/en/ref.bc.php
     * or: http://theserverpages.com/php/manual/en/ref.gmp.php
     * but I haven't really dugg into this. If you have more info on those
     * matters feel free to leave a comment.
     *
     * The following code block can be utilized by PEAR's Testing_DocTest
     * <code>
     * // Input //
     * $number_in = 2188847690240;
     * $alpha_in  = "SpQXn7Cb";
     *
     * // Execute //
     * $alpha_out  = alphaID($number_in, false, 8);
     * $number_out = alphaID($alpha_in, true, 8);
     *
     * if ($number_in != $number_out) {
     *   echo "Conversion failure, ".$alpha_in." returns ".$number_out." instead of the ";
     *   echo "desired: ".$number_in."\n";
     * }
     * if ($alpha_in != $alpha_out) {
     *   echo "Conversion failure, ".$number_in." returns ".$alpha_out." instead of the ";
     *   echo "desired: ".$alpha_in."\n";
     * }
     *
     * // Show //
     * echo $number_out." => ".$alpha_out."\n";
     * echo $alpha_in." => ".$number_out."\n";
     * echo alphaID(238328, false)." => ".alphaID(alphaID(238328, false), true)."\n";
     *
     * // expects:
     * // 2188847690240 => SpQXn7Cb
     * // SpQXn7Cb => 2188847690240
     * // aaab => 238328
     *
     * </code>
     *
     * @author  Kevin van Zonneveld <kevin@vanzonneveld.net>
     * @author  Simon Franz
     * @author  Deadfish
     * @copyright 2008 Kevin van Zonneveld (http://kevin.vanzonneveld.net)
     * @license   http://www.opensource.org/licenses/bsd-license.php New BSD Licence
     * @version   SVN: Release: $Id: alphaID.inc.php 344 2009-06-10 17:43:59Z kevin $
     * @link      http://kevin.vanzonneveld.net/
     *
     * @param mixed   $in     String or long input to translate
     * @param boolean $to_num  Reverses translation when true
     * @param mixed   $pad_up  Number or boolean padds the result up to a specified length
     * @param string  $passKey Supplying a password makes it harder to calculate the original ID
     *
     * @return mixed string or long
     */
    public static function alphaID($in, $to_num = false, $pad_up = false, $passKey = null) {
        #$index = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        $index = "bcdfghjklmnpqrstvwxyz0123456789BCDFGHJKLMNPQRSTVWXYZ";
        if ($passKey !== null) {
            // Although this function's purpose is to just make the
            // ID short - and not so much secure,
            // with this patch by Simon Franz (http://blog.snaky.org/)
            // you can optionally supply a password to make it harder
            // to calculate the corresponding numeric ID

            for ($n = 0; $n < strlen($index); $n++) {
                $i[] = substr($index, $n, 1);
            }

            $passhash = hash('sha256', $passKey);
            $passhash = (strlen($passhash) < strlen($index)) ? hash('sha512', $passKey) : $passhash;

            for ($n = 0; $n < strlen($index); $n++) {
                $p[] = substr($passhash, $n, 1);
            }

            array_multisort($p, SORT_DESC, $i);
            $index = implode($i);
        }

        $base = strlen($index);

        if ($to_num) {
            // Digital number  <<--  alphabet letter code
            $in = strrev($in);
            $out = 0;
            $len = strlen($in) - 1;
            for ($t = 0; $t <= $len; $t++) {
                $bcpow = bcpow($base, $len - $t);
                $out = $out + strpos($index, substr($in, $t, 1)) * $bcpow;
            }

            if (is_numeric($pad_up)) {
                $pad_up--;
                if ($pad_up > 0) {
                    $out -= pow($base, $pad_up);
                }
            }
            $out = sprintf('%F', $out);
            $out = substr($out, 0, strpos($out, '.'));
        } else {
            // Digital number  -->>  alphabet letter code
            if (is_numeric($pad_up)) {
                $pad_up--;
                if ($pad_up > 0) {
                    $in += pow($base, $pad_up);
                }
            }

            $out = "";
            for ($t = floor(log($in, $base)); $t >= 0; $t--) {
                $bcp = bcpow($base, $t);
                $a = floor($in / $bcp) % $base;
                $out = $out . substr($index, $a, 1);
                $in = $in - ($a * $bcp);
            }
            $out = strrev($out);
            // reverse
        }

        return $out;
    }

}
