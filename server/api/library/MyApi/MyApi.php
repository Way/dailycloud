<?php

include("library/Api/Api.php");

class MyApi extends Api{
	
	public function __construct(){
		parent::__construct();
	}
	
	/**
	 * Overwrite the function with the same code so that it looks for the service directory
	 * in this MyApi directory
	 */
	protected function getServicePath(){
		$api_path = PATH . '/' . $this->config['custom_path'];
		$params = $this->request->getParams();
		return $api_path . "/Service/version_" . str_replace(".", "_", $params['version']);
	}

}