<?php

class Api_Service_Bitly extends Api_Service_IService{
	
	private $_username = "sitebase";
	private $_apikey = "R_bbd96c1ad55f39b6be3e2bb53ba40104";
	private $_request = 'http://api.bit.ly/v3/shorten?login=%s&apiKey=%s&longUrl=%s&format=json';
	
	public function execute($params, $config){
		$response = file_get_contents(sprintf($this->_request, $this->_username, $this->_apikey, "http://www.sitebase.be"));
		$object = json_decode($response);
		return $object->data->url;
		
	}
	
}