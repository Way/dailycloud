<?php

/**
 * The base class for the services
 * 
 * When parameter "method" is not set the Api will always call the
 * execute method. So this execute method is required for all services
 * 
 * All the method that you include in the service must have the same parameters
 * as the execute method
 * 
 * @author Wim
 */
abstract class Api_Service_IService{
	
	/**
	 * A name for this service
	 * @var string
	 */
	protected $_name = "Service Name";
	
	/**
	 * Api instance
	 * This is used to send messages to the browser from the service class
	 * For examle when the execution time is expired
	 * @var Api
	 */
	protected $_api;
	
	/**
	 * Start execution time
	 * This is used to deturmine in the shutdown method 
	 * is the service has timedout
	 * @var int
	 */
	private $_start_execution = 0;
	
	/**
	 * @obsolete
	 * Response code
	 * @var int
	 */
	public $code = 200;
	
	/**
	 * @obsolete
	 * Errors that where triggered while executing this service
	 * @var array
	 */
	public $errors = array();
	
	/**
	 * Maximum execution time
	 * @var int
	 */
	protected $_ttl = 60;
	
	/**
	 * Method that are accepted
	 * @var array
	 */
	protected $_accept_methods = array( 
						'execute' 	=> array(Api_Request::METHOD_GET),
						'help'		=> array(Api_Request::METHOD_GET)
	);
	
	/**
	 * Constructor
	 */
	public function __construct($api=""){

		// Set start execution time
		$this->_start_execution = $this->microtimeFloat();
		
		// Set api to local
		$this->_api = $api;

		// Set the timeout for this service
		set_time_limit($this->_ttl);
		
		// Create instance of response
		$this->_response = new Api_Response();
		
		// Register function to call when script ends
		register_shutdown_function(array($this, "shutdown"));
	}
	
	/**
	 * Execute this service and return the result variable
	 * 
	 * @param array $params
	 * @return *
	 */
	abstract public function execute($params, $config);
	
	/**
	 * Add an error to the error array
	 * 
	 * @param string $error
	 * @return void
	 */
	protected function addError($error){
		array_push( $this->errors, $error);
	}
	
	/**
	 * Returns a list of methods that are accepted for this service
	 * 
	 * Get the accepted request method for a class method
	 * default the execute method will be selected
	 * 
	 * @return array
	 */
	public function getAcceptMethods($method_name="execute"){
		if(isset($this->_accept_methods[$method_name])){
			return $this->_accept_methods[$method_name];
		}else{
			return false;
		}
	}
	
	/**
	 * This function is called when the script is shutdown
	 * In this function we check if the script was expired and if so
	 * we send an expired message back
	 * 
	 * @return void
	 */
	final public function shutdown(){
		
		// Check if it is a timeout
		$execution_time = ($this->microtimeFloat() - $this->_start_execution);
		if($execution_time > ($this->_ttl + 0.01)){
			$this->_api->getLogger()->note("Service timeout " . get_class($this) . " (" . $execution_time . " seconds)");
			$response['code'] = 504;
			$response['error'] = "The service took too long to execute.";
			$this->_api->send($response);
		}

	}
	
	/**
	 * Get current time in seconds
	 * 
	 * @return int
	 */
	private function microtimeFloat()
	{
	    list($usec, $sec) = explode(" ", microtime());
	    return ((float)$usec + (float)$sec);
	}
	
	/**
	 * Add a method type that is allowed for a particular
	 * class method
	 * 
	 * @param string $class_method
	 * @param string $request_method
	 * @return void
	 */
	final protected function addAllowedMethod($class_method, $request_method){
		$this->_accept_methods[$class_method][] = $request_method;
	}
	
	/**
	 * Help method call
	 */
	final public function help($params, $config){
		header("Content-Type: text/plain");
		echo "API Doc\n";
		echo "-----------------------------------\n\n";
		
		$childReflectionInstance = new ReflectionClass($this);
		$public_methods = $childReflectionInstance->getMethods(ReflectionMethod::IS_PUBLIC);
		
		foreach($public_methods as $method) {
		    $declaringClass = $childReflectionInstance->getMethod($method->getName())
		                            ->getDeclaringClass()
		                            ->getName();
		    if($declaringClass === $childReflectionInstance->getName() && $method->getName() != "__construct") {

		    	// Get method name
		    	$method_name = $method->getName();
		        
		        // Get comment for the method
		        $reflect = new ReflectionMethod($this, $method_name);
		        $comment = $reflect->getDocComment();
		        
		        $parsed = $this->parseComment($method_name, $comment);
		        
		        echo $parsed;
		        
		    }
		    
		}
		
		exit();
	}
	
	/**
	 * Parse method comment
	 * 
	 * @param string $method_name
	 * @param string $comment
	 * @return string
	 */
	private function parseComment($method_name, $comment){
		
		$lines = explode("\n", $comment);
		$description = "METHOD: " . $method_name . ": \n";
		$parameters = "";
		foreach($lines as $line){
			$clean_line = trim(str_replace(array("/**", "* ", "*/"), "", $line));
			if(substr($clean_line, 0, 1) != "@" && trim($clean_line) != ""){
				$description .= "\t" . $clean_line . "\n";
			}else if(strstr($clean_line, "@input ")){
				$clean_input_parts = explode(" ", $clean_line);
				$param_description = str_replace($clean_input_parts[0] . " " . $clean_input_parts[1] . " " . $clean_input_parts[2] , "", $clean_line);
				$parameters .= "\t- " . $clean_input_parts[2] . "(" . $clean_input_parts[1] . "): " . $param_description . "\n";
			}
		}
		return $description . "\n" . $parameters . "\n";
		
	}
	
	/**
	 * Return the name of this service
	 * 
	 * @return string
	 */
	public function getName(){
		return $this->_name;
	}
	
}