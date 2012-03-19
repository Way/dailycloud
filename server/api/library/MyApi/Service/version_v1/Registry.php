<?php

/**
 * Service to save and retrieve a value to and from a session
 * This service is just an example of how to store data inputted by the user
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
class MyApi_Service_Registry extends Api_Service_IService{
	
	/**
	 * A name for this service
	 * This is the name for this service that is used in errors
	 * that will be shown to the users and in the log files
	 * @var string
	 */
	protected $_name = "Registry";
	
	/**
	 * Construct
	 *
	 * @author Wim Mostmans
	 *
	 * @return void
	 */
	public function __construct($api){
		parent::__construct($api);
		
		// Set newHello request methods
		$this->addAllowedMethod("save", Api_Request::METHOD_GET);
		$this->addAllowedMethod("save", Api_Request::METHOD_PUT);
		$this->addAllowedMethod("get", Api_Request::METHOD_GET);
	}
	
	/**
	 * The main execution point for this service
	 *
	 * @param array $params	Parameters that are submitted
	 * @param array $config	Api config
	 */
	public function execute($params, $config){
		$this->code = 301;
		return "Service to save and retrieve a value.";
	}
	
	/**
	 * Save a value in the session
	 *
	 * @input string value The value you want to save
	 *
	 * @param array $params	Parameters that are submitted
	 * @param array $config	Api config
	 */
	public function save($params, $config){
		$this->code = 200;
		
		// If value is empty
		if(!isset($params['value']) || empty($params['value'])){
			throw new Api_Error(Api_Error::MISSING_PARAMETERS, 'value');
		}
		
		$_SESSION[$_SERVER['REMOTE_ADDR']]['registry'] = htmlspecialchars($params['value']);
		return htmlspecialchars($params['value']);
	}
	
	/**
	 * Get the value from the session
	 *
	 * @param array $params	Parameters that are submitted
	 * @param array $config	Api config
	 */
	public function get($params, $config){
		$this->code = 200;
		session_destroy();
		// If value is empty
		if(!isset($_SESSION[$_SERVER['REMOTE_ADDR']]['registry'])){
			throw new Api_Error("Empty", "Session is empty.");
		}
		
		return $_SESSION[$_SERVER['REMOTE_ADDR']]['registry'];
	}
	
	
	
}