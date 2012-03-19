<?php

/**
 * The base class for hooks
 * 
 * @author Wim
 */
abstract class Api_Hook_IHook{
	
	/**
	 * List of Hook types
	 * @var string
	 */
	const HOOK_BEFORE_SERVICE_EXECUTE 	= "HOOK_BEFORE_SERVICE_EXECUTE";
	const HOOK_CONFIG_LOADED 			= "HOOK_CONFIG_LOADED";
	const HOOK_MODIFY_PARSER			= "HOOK_MODIFY_PARSER";
	
	/**
	 * Api instance
	 * @var Api $api
	 */
	protected $api;
	
	/**
	 * Function that is called to execute the hoo
	 * 
	 * @param Api $api
	 * @param Api_Service_IService $service
	 * @return *
	 */
	abstract public function execute();
	
	/**
	 * Set api
	 * 
	 * @param Api $api
	 * @return void
	 */
	public function setApi(&$api){
		$this->api = $api;
	}
	
}