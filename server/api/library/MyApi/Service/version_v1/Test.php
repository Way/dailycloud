<?php

class MyApi_Service_Test extends Api_Service_IService{
	
	public function __construct(){
		$this->addAllowedMethod("sum", Api_Request::METHOD_GET);
		$this->addAllowedMethod("fromConfig", Api_Request::METHOD_GET);
	}
	
	public function execute($params, $config){
		
		// HTTP Code
		$this->code = 200;
		
		return 'This is the main method!';
		
	}
	
	public function sum($params, $config){
		
		$this->code = 200;
		
		if(!isset($params['value1']) || !isset($params['value2'])){
			throw new Api_Error('Missing param', 'Make sure to fill in value1 and value2.');
		}
		
		return $params['value1'] + $params['value2'];
		
	}
	
	
	public function fromConfig($params, $config){
		$this->code = 200;
		return $config['myvalue'];
	}
	
}