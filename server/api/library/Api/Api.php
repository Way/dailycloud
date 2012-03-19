<?php 

/**
 * This is the API main class
 * If you gonna build your API with this framework
 * You will create your own API class that extends this one
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

require_once PATH_API . "/Error.php";
require_once PATH_API_PARSER . "/IParser.php";
require_once PATH_API_HOOK . "/IHook.php";
require_once PATH_API_SERVICE . "/IService.php";
require_once PATH_API . "/Request.php";
require_once PATH_API . "/Response.php";
require_once PATH_API . "/Logger.php";

abstract class Api{
	
	/**
	 * Output type
	 * @var string
	 */
	protected $type	= "xml";
	
	/**
	 * Params array that is used when the api is direct called from code
	 * To set the parameters you can use the SetParams method
	 * @var array
	 */
	protected $params;
	
	/**
	 * Config object
	 * The config is set with some default data
	 * @var array
	 */
	protected $config = array( 
								"auth_required" 		=> true,
								"service_path" 			=> "Service/",
								"custom_path" 			=> "Api"
								);
	
	/**
	 * The parser that is used to generate
	 * the output string
	 * @var Api_Parser_IParser
	 */
	protected $parser;
	
	/**
	 * Response codes with text
	 * @var array
	 */
	protected $codes = Array(
		    100 => 'Continue',
		    101 => 'Switching Protocols',
		    200 => 'OK',
		    201 => 'Created',
		    202 => 'Accepted',
		    203 => 'Non-Authoritative Information',
		    204 => 'No Content',
		    205 => 'Reset Content',
		    206 => 'Partial Content',
		    300 => 'Multiple Choices',
		    301 => 'Moved Permanently',
		    302 => 'Found',
		    303 => 'See Other',
		    304 => 'Not Modified',
		    305 => 'Use Proxy',
		    306 => '(Unused)',
		    307 => 'Temporary Redirect',
		    400 => 'Bad Request',
		    401 => 'Unauthorized',
		    402 => 'Payment Required',
		    403 => 'Forbidden',
		    404 => 'Not Found',
		    405 => 'Method Not Allowed',
		    406 => 'Not Acceptable',
		    407 => 'Proxy Authentication Required',
		    408 => 'Request Timeout',
		    409 => 'Conflict',
		    410 => 'Gone',
		    411 => 'Length Required',
		    412 => 'Precondition Failed',
		    413 => 'Request Entity Too Large',
		    414 => 'Request-URI Too Long',
		    415 => 'Unsupported Media Type',
		    416 => 'Requested Range Not Satisfiable',
		    417 => 'Expectation Failed',
		    500 => 'Internal Server Error',
		    501 => 'Not Implemented',
		    502 => 'Bad Gateway',
		    503 => 'Service Unavailable',
		    504 => 'Gateway Timeout',
		    505 => 'HTTP Version Not Supported'
	);
		
	/**
	 * Hooks that will be executed before executing service
	 * @var array
	 */
	private $_hooks = array(
						Api_Hook_IHook::HOOK_BEFORE_SERVICE_EXECUTE => array("Api_Hook_MethodAllowed")
					);
		
	/**
	 * Request object
	 * @var Api_Request
	 */
	protected $request;
	
	/**
	 * Holds an instance of the logger class
	 * @var Api_Logger
	 */
	protected $logger;
		
	/**
	 * Constructor
	 * 
	 * @return void
	 */
	public function __construct(){
		
		// Create logger
		//$this->_logger = new Api_Logger(LOGGER_NOTICE, METHOD_LOG);
		//set_error_handler(array($this->_logger, "handle"));
		$Logger = new Logger();
		$Logger->enable_error(true, E_NOTICE);
		$Logger->enable_fatal();
		$Logger->enable_exception();
		$Logger->enable_method_file(true, array('path' => PATH_API . '/log/'));
		$this->logger = $Logger;

		// Set default output type
		$this->setType(Api_Response::TYPE_XML);
		
	}

	/**
	 * Handle Request
	 * 
	 * @param Api_Request
	 * @return void
	 */
	final public function handle($request, $config=array()){
		
		// Set request object as local
		$this->request = $request;

		// Get params
		$params = $this->request->getParams();

		// Merge config arrays
		if(isset($config[$params['version']]) && is_array($config[$params['version']])){
			$this->config = array_merge( $this->config, $config[$params['version']] );
		}else{
			throw new Api_Error(Api_Error::VERSION_NOT_FOUND, $params['version']);
		}
		
		// Set response type
		$this->setType(ucfirst(strtolower($params['api_response_type'])));
		
		// Do config modify hooks
		$this->executeHooks(Api_Hook_IHook::HOOK_CONFIG_LOADED);
		
		// Prepare variables
		$service = $this->getServiceClassName( $params['service'] );
		$service_file_path = $this->getServicePath($service);
		$service_file_name = $this->getServiceFileName( $params['service'] );
		$service_file_fullpath = $service_file_path . "/" . $service_file_name;

		// Try to include
		if(file_exists( $service_file_fullpath )){
			require_once $service_file_fullpath;
		}

		// Check if the service is loaded
		if(!class_exists($service)){
			throw new Api_Error(Api_Error::SERVICE_NOT_FOUND, $params['service']);
		}

		// Create service object
		$ServiceObject = new $service($this);
		
		// Do before hooks
		$this->executeHooks(Api_Hook_IHook::HOOK_BEFORE_SERVICE_EXECUTE, array($ServiceObject));

		// Set response data
		$response = new Api_Response();
		if(isset($params['method']) && !empty($params['method'])){
			$method = $this->prepareMethodName($params['method']);
			
			if(is_callable(array($ServiceObject, $method))){
				$response->setData($ServiceObject->$method($params, $this->config));
			}else{
				throw new Api_Error(Api_Error::ACTION_NOT_FOUND, array($method, $params['service']));
			}
		}else{
			$response->setData($ServiceObject->execute($params, $this->config));
		}

		$response->addError($ServiceObject->errors);
		$response->setCode($ServiceObject->code);
		$this->send($response);
		
	}

	/**
	 * Send response to client
	 * 
	 * @param Api_Response $data
	 * @return void
	 */
	final public function send(Api_Response $response)  
    {  
    	
    	// Modify parser
		$this->executeHooks(Api_Hook_IHook::HOOK_MODIFY_PARSER, array($this->parser));

    	// Get content type
    	$content_type = $this->parser->content_type;
    	
	    // Set the content type  
	    header("Generator: Advanced API");
	    header('HTTP/1.0 ' . $response->getCode() . " " . $this->getStatusCodeMessage($response->getCode())); 
	    header('Content-type: ' . $content_type);  
	    
	    // If code is note ok (not 200) then log the returning message
	    if($response->getCode() != 200){
	    	$error = reset($response->getErrors());
	    	if(is_object($error)){
	    		$this->logger->log($error->getMessage());
	    	}
	    }
	    
	    // Create data array from response
	    if(!is_array($response)){
	    	$data['code'] = $response->getCode();
	    	foreach($response->getErrors() as $error){
	    		if(is_object($error)){
	    			$data['errors'][] = $error->getMessage();
	    		}
	    	}
	    	$data['data'] = $response->getData();
	    }

	   	// Parse response array to correct type
	   	$this->parser->setData($data);
	   	$this->parser->setParams($this->request->getParams());
	   	echo $this->parser->parse();
	    exit();
    } 
	
    /**
     * Get a description for a HTTP code
     * 
     * @access public
     * @param int $code
     * @return void
     */
	public function GetStatusCodeMessage($code)
	{
		return (isset($this->codes[$code])) ? $this->codes[$code] : '';
	}
	
	/**
	 * Set response type
	 * 
	 * @param string $type
	 * @return void
	 */
	public function setType($type=self::TYPE_XML){
		$this->type = $type = ucfirst(strtolower($type));

		// Load the correct parser
		if(file_exists(PATH . "/" . $this->config['custom_path'] . "/Parser/" . $type . ".php")){
			$parser = PATH . "/" . $this->config['custom_path'] . "/Parser/" . $type . ".php";
			$parser_class_name = $this->config['custom_path'] . "_Parser_" . $type;
		}else{
			$parser = PATH_API . "/Parser/" . $type . ".php";
			$parser_class_name = "Api_Parser_" . $type;
		}
		require_once $parser;
		$this->parser = new $parser_class_name();
		
	}

	/**
	 * Make service filename
	 * 
	 * @param string $service	The string service that was asked for in the url
	 * @return string
	 */	
	protected function getServiceFileName($service=""){
		return ucfirst($service) . ".php";
	}
	
	/**
	 * Make service classname
	 * 
	 * @param string $service	The string service that was asked for in the url
	 * @return string
	 */
	protected function getServiceClassName($service=""){
		return $this->config['custom_path'] . '_Service_' . ucfirst($service);
	}
	
	/**
	 * Get the path to where the services are saved
	 * 
	 * You can overwrite this if you want the services to be loaded from another location
	 * 
	 * @param string $service	
	 * @return string
	 */
	protected function getServicePath($service=""){
		$api_path = str_replace("\\", "/", dirname(__FILE__));
		return $api_path . "/Service";
	}
	
	/**
	 * Get the path to where the hooks are saved
	 * 
	 * @param string $hook
	 * @return string
	 */
	protected function getHookPath($hook){
		$parts = explode("_", $hook);
		return "Hook/" . end($parts) . ".php";
	}
	
	/**
	 * Return Request object
	 * 
	 * @return Api_Request
	 */
	public function getRequest(){
		return $this->request;
	}
	
	/**
	 * Return config array
	 * 
	 * @return array
	 */
	final public function getConfig(){
		return $this->config;
	}
	
	/**
	 * Return the response mime type for this request
	 * 
	 * @return string
	 */
	final public function getType(){
		return $this->type;
	}
	
	/**
	 * Set config array
	 * 
	 * @param array $config
	 * @return void
	 */
	final public function setConfig($config){
		$this->config = $config;
	}
	
	/**
	 * Return logger instance
	 * 
	 * @return Api_Logger
	 */
	public function getLogger(){
		return $this->logger;
	}
	
	/**
	 * Add key value pair to beginning of array
	 * 
	 * @param array $arr
	 * @param string $key
	 * @param * $val
	 */
	private function arrayUnshiftAssoc(&$arr, $key, $val)
	{
	    $arr = array_reverse($arr, true);
	    $arr[$key] = $val;
	    $arr = array_reverse($arr, true);
	    return count($arr);
	} 
	
	/**
	 * Class factory
	 * Used to load dynamic hooks
	 * 
	 * @param string $class_name
	 * @return Object
	 */
	private function classFactory($class_name){
		
		// Create path
		$path = $this->getHookPath($class_name);

		// Try to load
		@include_once $path;
		
		// Try to create instance
		if(class_exists($class_name)){
			$instance = new $class_name;
		}

		// Return the instance
		if(isset($instance) && is_object($instance)){
			
			// Add api isntance to hook
			$instance->setApi($this);
			
			return $instance;
		}else{
			return false;
		}
	}
	
	/**
	 * Execute list of hooks
	 * 
	 * @param const $type
	 * @return void
	 */
	private function executeHooks($type, $arguments=array()){
		$hooks = $this->_hooks[$type];
		foreach($hooks as $hook){
			if($instance = $this->classFactory( $hook )){
				call_user_func_array(array($instance, 'execute'), $arguments);
			}else{
				$this->logger->log("Hook " . $hook . " could not be loaded");
			}
		}
	}
	
	/**
	 * Add a new hook
	 * 
	 * When using custom hooks make sure you place them in the hook folder
	 * Or when placing in an other folder, make sure you include the class
	 * yourself.
	 * 
	 * @param string $class_name
	 * @return void
	 */
	public function addHook($class_name, $type=Api_Hook_IHook::HOOK_BEFORE_SERVICE_EXECUTE){
		$this->_hooks[$type][] = $class_name;
	}
	
	/**
	 * Prepare url method name for use
	 * This method can be overwritten if you like to use another format of method names
	 * 
	 * Converts a string like "new-file" to "newFile"
	 * 
	 * @param string $method_name
	 * @return string
	 */
	public function prepareMethodName($method_name){
		$parts = explode("-", $method_name);
		$clean_method_name = "";
		$first = true;
		foreach($parts as $part){
			$clean_method_name .= $first ? strtolower($part) : ucfirst(strtolower($part));
			$first = false;
		}
		return $clean_method_name;
	}
	
}
