<?php

class Api_Service_Helloworld extends Api_Service_IService{
	
	public function __construct($api){
		parent::__construct($api);
		
		// Set newHello request methods
		$this->addAllowedMethod("newHello", Api_Request::METHOD_PUT);
		$this->addAllowedMethod("newHello", Api_Request::METHOD_GET);
		
	}
	
	public function execute($params, $config){
		
		$this->code = 301;
		$this->addError("Foutje met de input string");
		$this->addError("Nog een andere fout");
		return "Hello world";
		
	}
	
	public function newHello($params, $config){
		$this->code = 200;
		return "New hello world";
	}
	
}