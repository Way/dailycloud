<?php

/**
 * Hello world example class
 * Little example service class how to response to a request
 *
 * @copyright Copyright (c) 2008-2010 Sitebase (http://www.sitebase.be)
 * @author Wim Mostmans
 * @category   PHP
 * @package    API Framework
 * @license    http://codecanyon.net/wiki/buying/howto-buying/licensing/
 * @version    $Id$
 *
 * You need to buy a license if you want use this script.
 */
class MyApi_Service_Helloworld extends Api_Service_IService{
	
	/**
	 * A name for this service
	 * This is the name for this service that is used in errors
	 * that will be shown to the users and in the log files
	 * @var string
	 */
	protected $_name = "HelloWorld";
	
	/**
	 * Construct
     * 
	 * @author Wim Mostmans
	 *
	 * @param Api $api
	 */
	public function __construct($api){
		parent::__construct($api);
		
		// Set request methods
		$this->addAllowedMethod("execute", Api_Request::METHOD_POST);
		$this->addAllowedMethod("with", Api_Request::METHOD_GET);
		$this->addAllowedMethod("arrayLanguages", Api_Request::METHOD_GET);
		$this->addAllowedMethod("objectLanguages", Api_Request::METHOD_GET);
	}
	
	/**
	 * Show the string "Hello World!"
	 * 
     * e.g. http://localhost/projects/api/v1/public/helloworld.xml
     * 
	 * @param array $params	Parameters that are submitted
	 * @param array $config	Api config
	 */
	public function execute($params, $config){
		$this->code = 200;
        
        // Log a string
        //$this->_api->getLogger()->log(__METHOD__);
        
		return "Hello World!";
	}
	
	/**
	 * Say hello with a name
	 * 
	 * @input string name The name you want to use to say hello
     * e.g. http://localhost/projects/api/v1/public/helloworld/with.xml?name=me
	 * 
	 * @param array $params	Parameters that are submitted
	 * @param array $config	Api config
	 */
	public function with($params, $config){
		
		// Check if parameters isset
		if(!isset($params['name'])){
			throw new Api_Error(Api_Error::MISSING_PARAMETERS, 'name');
		} 
		
		$this->code = 200;
		return 'Hello, ' . $params['name'] . '!';
	}
	
	/**
	 * Say hello world in different languages based on a array
	 * 
	 * @param array $params	Parameters that are submitted
	 * @param array $config	Api config
	 */
	public function arrayLanguages($params, $config){
		$this->code = 200;
		return array('english' => 'Hello World!', 
						'dutch' => 'Hallo Wereld!', 
						'french' => 'Bonjour tout le monde!');
	}
	
	/**
	 * Say hello world in different languages based on a object
	 * 
	 * @param array $params	Parameters that are submitted
	 * @param array $config	Api config
	 */
	public function objectLanguages($params, $config){
		$this->code = 200;
		return new HelloWorld();
	}
	
}

/**
 * Example class used in the objectLanguages method above
 */
class HelloWorld{
	public $english = 'Hello World!';
	public $dutch = 'Hallo Wereld!';
	public $french = 'Bonjour tout le monde!';
}