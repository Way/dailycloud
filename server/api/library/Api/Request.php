<?php 

/**
 * Handles requests to the API
 * Retrieve data that is submitted ..
 */
class Api_Request{
	
	/**
	 * Request methods
	 */
	const METHOD_GET	= "GET";
	const METHOD_POST	= "POST";
	const METHOD_PUT	= "PUT";
	const METHOD_DELETE = "DELETE";
	
	/**
	 * Files posted
	 * @var array
	 */
	public $files = array();
	
	/**
	 * The used request method
	 * @var string
	 */
	public $method = Api_Request::METHOD_GET;
	
	/**
	 * Request url format
	 * @var string
	 */
	private $_params = array(	"version" 	=> "", 
								"service" 	=> "",
								"method"	=> "");
	
	/**
	 * Paths
	 */
	private $_endpoint_url;
	private $_endpoint_path;
	private $_url_data;
	
	/**
	 * Constructor
	 */
	public function __construct($endpoint_url=""){
		
		// Make sure the endpoint url has no trailing/prefix slash
		
		$this->_endpoint_url = $endpoint_url;
		$this->_endpoint_path = str_replace($this->url(), "", $endpoint_url);

		// Check if it is a valid request
		if(!isset($_GET['api_request'])){
			echo "Call not allowed.";
			exit();
		}

		$_SERVER["REQUEST_URI"] = str_replace($endpoint_url, "", $this->url() . $_SERVER["REQUEST_URI"]);
		$_SERVER["REQUEST_URI"] = str_replace(array("%2f", "%2F", "%252f", "%252F"), "--slash--", $_SERVER["REQUEST_URI"]);
		$extension_pos = strrpos($_SERVER["REQUEST_URI"], ".");
		$_SERVER["REQUEST_URI"] = substr($_SERVER["REQUEST_URI"], 0, $extension_pos);
		$this->_url_data = explode("/", trim($_SERVER["REQUEST_URI"], "/"));
		
		// Decode url parts
		$this->_url_data = array_map(array($this, 'urlDecode'), $this->_url_data);
		
		// Set the request method
		$this->method = $_SERVER['REQUEST_METHOD'];
		
	}
	
	/**
	 * Post method type
	 *
	 * @access private
	 * @return bool
	 */
	protected function isPost(){
		return $_SERVER['REQUEST_METHOD'] == "POST";
	} 
	
	/**
	 * Get method type
	 *
	 * @access private
	 * @return bool
	 */
	protected function isGet(){
		return $_SERVER['REQUEST_METHOD'] == "GET";
	} 
	
	/**
	 * Put method type
	 *
	 * @access private
	 * @return bool
	 */
	protected function isPut(){
		return $_SERVER['REQUEST_METHOD'] == "PUT";
	} 
	
	/**
	 * Delete method type
	 *
	 * @access private
	 * @return bool
	 */
	protected function isDelete(){
		return $_SERVER['REQUEST_METHOD'] == "DELETE";
	}
	
	/**
	 * Get data out of the request
	 * 
	 * @return void
	 */
	public function analyze(){
		
		// Set data
        $this->files = $_FILES; 
		
        // Loop through url data and match them with the
        // format position variables
        $counter = 0;
        foreach($this->_params as $key => $value){
        	$this->_params[$key] = isset($this->_url_data[$counter]) ? $this->_url_data[$counter] : "";
			$counter++;
        }
        
        $url_data_num = count($this->_url_data);
        for($i=$counter ; $i < $url_data_num ; $i+=2){
        	$this->_params[ $this->_url_data[$i] ] = isset( $this->_url_data[($i+1)] ) ? $this->_url_data[($i+1)] : "";
        }
        
        // Merge GET in params
        $this->_params = array_merge($this->_params, $_GET);
        
        // Merge POST in params
        $this->_params = array_merge($this->_params, $_POST);
        
	}
	
	/**
	 * Get the base url for this service
	 * 
	 * @return string
	 */
	private function url() {
	 	$url = 'http';
		if (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on") {$url .= "s";}
	 	$url .= "://";
	 	if ($_SERVER["SERVER_PORT"] != "80") {
	  		$url .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"];
	 	} else {
	 	 	$url .= $_SERVER["SERVER_NAME"];
	 	}
	 	return $url;
	}
	
	/**
	 * Set the param format
	 * Define on what position is what variable
	 * 
	 * @param array
	 * @return void
	 */
	public function setParams($array){
		
		$clean_array = array();
		
		// Transform key value array
		foreach($array as $key){
			$clean_array[$key] = "";
		}
		
		// Set to local
		$this->_params = $clean_array;
		
	}
	
	/**
	 * Get parameters data
	 * 
	 * @return array
	 */
	public function getParams(){
		return $this->_params;
	}
	
	/**
	 * Url decode the url parts
	 * 
	 * @param string $part
	 * @return string
	 */
	private function urlDecode($part){
		return str_replace("--slash--", "/", urldecode(urldecode($part)));
	}
	
	
}