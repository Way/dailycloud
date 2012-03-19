<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * Diagnostic
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Measure the runtime and memory usage of function.
 *
 * @class     -   Diagnostic
 * @file      -   Diagnostic.php
 * @location  -   ./server/library/Diagnostic.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class Diagnostic extends Singleton {
    // Section for measurement
    private $_section;

    // Name of the default section name
    private $_default_section = 'global';

    // Diagnostic values
    private $_values = array();

    // Finished diagnostic values
    private $_values_finished = array();

    // Log cache
    private $_cache_log = array();

    /**
     * Enables singleton working properly
     *
     * @see Singleton.php
     */
    public static function instance() {
        return self::getInstanceOf(__CLASS__);
    }

    /**
     * Start diagnostic logger.
     * Store current memory usage and starttime.
     *
     * @since 1.0
     * @access public
     *
     * @param (string) section - Name of the diagnostic section
     *
     * @return void
     */
    public function start($section = null) {
        if ($section == null) {
            $section = $this->_default_section;
        }
        $this->_section = $section;

        // Store memory at startup
        $this->_values[$this->_section] = array(
                'memory_init' => memory_get_usage(),
                'time_init' => microtime()
        );
    }

    /**
     * Finish and return diagnostic values for a section.
     *
     * @since 1.0
     * @access public
     *
     * @param (string) section - Name of the diagnostic section
     *
     * @return array
     */
    public function finish($section = null) {
        if ($section == null) {
            $section = $this->_default_section;
        }
        if (empty($this->_values_finished[$section])) {
            $this->_values_finished[$section] = $this->getMemoryUsage($section);
        }
        return $this->_values_finished[$section];
    }

    /**
     * Show all diagnostic values.
     *
     * @since 1.0
     * @access public
     *
     * @param (string) section - Name of the diagnostic section
     *
     * @return void
     */
    public function output($section = null) {
        $values = $this->finish($section);
        $output = array();
        $output[] = "<fieldset><legend>$section</legend>";
        $output[] = "<pre>";
        foreach ($values as $key => $val) {
            $output[] = "$key = $val\n";
        }
        $output[] = "</pre></fieldset>";
        echo join('', $output);
    }

    /**
     * Show memory used by this server request.
     * I: In, O: Out, P: Peak
     *
     * @since 1.0
     * @access private
     *
     * @return
     */
    private function getMemoryUsage($section = null) {
        $data = array();
        if (array_key_exists($section, $this->_values) && is_array($this->_values[$section])) {
            $now = microtime();
            $values = $this->_values[$section];
            $in = $values['memory_init'];
            $out = memory_get_usage(true);
            $data['in'] = $this->bytesConvert($in);
            $data['out'] = $this->bytesConvert($out);
            $data['usage'] = $this->bytesConvert($out - $in);
            $data['peak'] = $this->bytesConvert(memory_get_peak_usage());
            $data['time'] = round($now - $values['time_init'], 5) . 's';
        }
        return $data;
    }

    /**
     * Convert bytes to their nearest name size.
     * Round that value and return it.
     *
     * @param (Number) $bytes
     * @param (Integer) $precision - [optional]
     */
    private function bytesConvert($bytes, $precision = 2) {
        $ext = array(
                'B',
                'kB',
                'MB',
                'GB',
                'TB',
                'PB',
                'EB',
                'ZB',
                'YB'
        );
        $unitCount = 0;
        for (; $bytes > 1024 && $unitCount < sizeof($ext); $unitCount++)
            $bytes /= 1024;
        return round($bytes, $precision) . " " . $ext[$unitCount];
    }

    /**
     * Put a log entry to the log cached which will be displayed as soon as
     * the Diagnostic destructor will be called.
     */
    public function log($val, $title = null) {
        $timestamp = '(' . time() . ')';
        if ($title !== null) {
            $title .= ' ' . $timestamp;
        } else {
            $title = $timestamp;
        }
        $this->_cache_log[] = array($title => $val);
    }

    /**
     * Destructor
     *
     * Will output the log cache.
     */
    public function __destruct() {
        if (empty($this->_cache_log) === FALSE) {
            ob_start();
            foreach ($this->_cache_log as $i => $entry) {
                $timestamp = key($entry);
                $value = $entry[$timestamp];
                echo "<fieldset><legend>$i - $timestamp</legend><pre>";
                var_dump($value);
                echo "</pre></fieldset>";
            }
            ob_end_flush();
        }

    }

}
