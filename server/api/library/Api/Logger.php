<?php

/**
 * Handles logging if problems and info
 * 
 * @copyright Copyright (c) 2008-2010 Sitebase (http://www.sitebase.be)
 * @author Wim Mostmans
 * @category   PHP
 * @package    API Framework
 * @license    
 * @version    $Id$
 *
 * You need to buy a license if you want use this script.
 */
class Logger{
	
	/**
	 * Log file extension
	 * @var string
	 */
	const EXT = 'php';
	
	/**
	 * Log file date name format
	 * @var string
	 */
	const DATE_FORMAT = 'Ymd';
	
	/**
	 * Line end
	 * @var string
	 */
	const LINE_END = "\r\n";
	
	/**
	 * Format of the log lines
	 * @var string
	 */
	private $_line_format = '%ip% - [%date% %time%] %type%: %message% (%file%:%line%)';
	
	/**
	 * Log type
	 * @var string
	 */
	private $_max_type = E_NOTICE;
	
	/**
	 * Log buffer, holds all the log file for one run
	 * @var array
	 */
	private $_log_buffer = array();
	
	/**
	 * Enabled log methods
	 * @var bool
	 */
	private $_enabled_file = false;
	private $_enabled_mail = false;
	private $_enabled_server = false;
	private $_enabled_print = false;
	
	/**
	 * Configurations for log methods
	 * @var array
	 */
	private $_config_file = array();
	private $_config_mail = array();
	private $_config_server = array();
	
	/**
	 * Error strings
	 * @var array
	 */
	private $_error_types = array(
							    E_ERROR          	=> 'Error',
							    E_WARNING        	=> 'Warning',
							    E_PARSE          	=> 'Parsing Error',
							    E_NOTICE          	=> 'Notice',
							    E_CORE_ERROR      	=> 'Core Error',
							    E_CORE_WARNING    	=> 'Core Warning',
							    E_COMPILE_ERROR  	=> 'Compile Error',
							    E_COMPILE_WARNING 	=> 'Compile Warning',
							    E_USER_ERROR      	=> 'User Error',
							    E_USER_WARNING    	=> 'User Warning',
							    E_USER_NOTICE    	=> 'User Notice',
							    E_STRICT          	=> 'Runtime Notice',
								E_RECOVERABLE_ERROR => 'Recoverable Error');
	
	/**
	 * Constructor
	 */
	public function __construct(){}
	
	/**
	 * Enable error logging
	 *
	 * @param bool $enabled
	 * @return void
	 */
	public function enable_error($enabled=true, $type=E_NOTICE){
		if(!isset($type)) trigger_error($type . ' is not a valid error type.', E_USER_WARNING);
		$this->_max_type = $type;
		set_error_handler(array(&$this, 'handle_errors'));
	}
	
	/**
	 * Enable fatal error logging
	 *
	 * @param bool $enabled
	 * @return void
	 */
	public function enable_fatal($enabled=true){
		register_shutdown_function(array(&$this, 'handle_shutdown')); 
	}
	
	/**
	 * Enable uncaught exception log
	 *
	 * @param bool $enabled
	 * @return void
	 */
	public function enable_exception($enabled=true){
		set_exception_handler(array(&$this, 'handle_exception')); 
	}
	
	/**
	 * Enable file log method
	 *
	 * @param bool $enabled
	 * @param array $config	// set 'path' key for the destination directory of the log files
	 * @return void
	 */
	public function enable_method_file($enabled=true, $config=array()){
		$this->_enabled_file = $enabled;
		
		$path = !isset($config['path']) ? '.' : $config['path'];
		if($path == '.') $path = dirname(__FILE__);
		$this->_config_file['path'] = $path;
		$this->_config_file['file'] = $this->clean_path($path) . $this->create_filename();
	}
	
	/**
	 * Enable email log method
	 *
	 * @param bool $enabled
	 * @param array $config	// set 'email' key for the destination
	 * @return void
	 */
	public function enable_method_mail($enabled=true, $config=array()){
		$this->_enabled_mail = $enabled;
		$this->_config_mail = $config;
		register_shutdown_function(array(&$this, 'mail_buffer'));
	}
	
	/**
	 * Enable server log method
	 *
	 * @param bool $enabled
	 * @param array $config	// set 'server' key url to the server
	 * @return void
	 */
	public function enable_method_server($enabled=true, $config=array()){
		$this->_enabled_server = $enabled;
		$this->_config_server = $config;
		register_shutdown_function(array(&$this, 'send_server_buffer'));
	}
	
	/**
	 * Enable print log method
	 *
	 * @param bool $enabled
	 */
	public function enable_method_print($enabled=true){
		$this->_enabled_print = $enabled;
		register_shutdown_function(array(&$this, 'print_buffer'));
	}
	
	/**
	 * Print the buffer content on screen
	 *
	 * @return void
	 */
	public function print_buffer(){
		// Strip ip, date and time
		$clean_logs = '';
		foreach($this->_log_buffer as $line){
			$clean_logs .= substr($line, strpos($line, ']')+2);
		}
		echo '<pre style="background: #DDD; padding: 10px; border: solid 1px #AAA; color: #666"><strong>Logger result:</strong><br />------------------------------<br />' . $clean_logs . '</pre>';
	}
	
	/**
	 * S the buffer content on screen
	 *
	 * @return void
	 */
	public function mail_buffer(){
		$headers = 'From: noreply@errorsystem' . "\r\n" .
						'X-Mailer: PHP/' . phpversion();
		mail($this->_config_mail['email'], "Logger notify", implode(self::LINE_END, $this->_log_buffer), $headers);
	}
	
	/**
	 * Send the buffer content to the server
	 *
	 * @return void
	 */
	public function send_server_buffer(){
		$this->post($this->_config_server['server'], array("data" => implode(self::LINE_END, $this->_log_buffer)));
	}
	
	
	
	/**
	 * Write value to a file
	 *
	 * @param string $value
	 * @param string $path
	 * @return void
	 */
	private static function file_write($value, $path){
		if(!file_exists($path)) self::file_create($path);
		$fh = fopen($path, 'a'); 
		fwrite($fh, $value); 
		fclose($fh); 
	}
	
	/**
	 * Create a file
	 *
	 * @param string $path
	 * @return bool
	 */
	private static function file_create($path){
		$fh = @fopen($path, 'w');
		if($fh == NULL) return false;
		fwrite($fh, "<?php exit() ?> \n"); 
		fclose($fh);
		if(file_exists($path)) return true;
		return false;
	}
	
	/**
	 * Handle normal errors
	 *
	 * @param string $type
	 * @param string $message
	 * @param string $file
	 * @param int $number
	 * @param string $context
	 * @return void
	 */
	public function handle_errors($type, $message, $file, $line, $context){
		if($this->_max_type >= $type){
			$data['%message%'] = $message;
			$data['%file%'] = $file;
			$data['%line%'] = $line;
			$data['%type%'] = $this->_error_types[$type];
			$line = $this->prepare_line($data);
			$this->send($line);
		}
	}
	
	/**
	 * Handle uncaught exceptions
	 *
	 * @param s $exception
	 * @return void
	 */
	public function handle_exception($exception){
	
		// Build tracelist
		$trace = $exception->getTrace();
		foreach ($trace as $key => $stackPoint) {
			// I'm converting arguments to their type
			// (prevents passwords from ever getting logged as anything other than 'string')
			$trace[$key]['args'] = array_map('gettype', $trace[$key]['args']);
		}
		$result = array();
		foreach ($trace as $key => $stackPoint) {
			$result[] = sprintf(
				$traceline,
				$key,
				$stackPoint['file'],
				$stackPoint['line'],
				$stackPoint['function'],
				implode(', ', $stackPoint['args'])
			);
		}
		print_r($result);
	
		$data['%message%'] = $exception->getMessage();
		$data['%file%'] = $exception->getFile();
		$data['%line%'] = $exception->getLine();
		$data['%type%'] = 'Exception';
		$line = $this->prepare_line($data);
		$this->send($line);
	}
	
	/**
	 * Handle fatal errors
	 *
	 * @return void
	 */
	public function handle_shutdown(){
		if(!function_exists('error_get_last')) return;
		$error = error_get_last();
		if($error !== NULL){
			$data['%message%'] = $error['message'];
			$data['%file%'] = $error['file'];
			$data['%line%'] = $error['line'];
			$data['%type%'] = 'Fatal';
			$line = $this->prepare_line($data);
			$this->send($line);
		}
	}
	
	/**
	 * Write a line to the log
	 *
	 * @param * $value
	 * @return void
	 */
	public function log($value){
		if(!is_string($value) && !is_int($value)){
			$value = print_r($value, true);
		}
		
		// Get the line and file where the log is called
		$trace = debug_backtrace();

		$data['%message%'] = $value;
		$data['%file%'] = $trace[0]['file'];
		$data['%line%'] = $trace[0]['line'];
		$data['%type%'] = 'Log';
		$line = $this->prepare_line($data);
		$this->send($line);
	}
	
	/**
	 * Prepare a log line
	 *
	 * @param array $params
	 * @return string
	 */
	private function prepare_line($params){
		$find = array('%ip%', '%date%', '%time%');
		$replace = array($_SERVER['REMOTE_ADDR'], date("m/d/y"), date('H:i:s'));
		$line = str_replace( $find, $replace, $this->_line_format);
		foreach($params as $find => $replace){
			$line = str_replace($find, $replace, $line);
		}
		return $line . self::LINE_END;
	}
	
	/**
	 * Create a filename for this file
	 * 
	 * @return string
	 */
	private function create_filename(){
		return date(self::DATE_FORMAT) . '.' . self::EXT;
	}
	
	/**
	 * Cleanup a directory path
	 *
	 * @param string $path
	 * @return string
	 */
	private function clean_path($path){
		$clean_path = str_replace('\\', '/', $path);
		return substr($clean_path, -1) == '/' ? $clean_path : $clean_path . '/';
	}
	
	/**
	 * Send logline where needed
	 *
	 * @param string $line
	 * @return void
	 */
	private function send($line){
		
		// Log file
		if($this->_enabled_file){
			$this->file_write($line, $this->_config_file['file']);
		}
		
		// Print or Email or Server
		if($this->_enabled_print || $this->_enabled_mail || $this->_enabled_server){
			$this->_log_buffer[] = $line;
		}
		
	}
	
	/**
	 * Post data to an url
	 *
	 * @param string $url
	 * @param array $data
	 * @return void
	 */
	private function post($url, $data){
		$fields_string = "";
		foreach($data as $key=>$value) { 
			$fields_string .= $key.'='.$value.'&';
		}
		rtrim($fields_string,'&');
		
	     //open connection
		$ch = curl_init();
		
		//set the url, number of POST vars, POST data
		curl_setopt($ch,CURLOPT_URL,$url);
		curl_setopt($ch,CURLOPT_POST,count($data));
		curl_setopt($ch,CURLOPT_POSTFIELDS,$fields_string);
		
		//execute post
		curl_exec($ch);

		//close connection
		curl_close($ch);

	}
	
}

?>