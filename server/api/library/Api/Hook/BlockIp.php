<?php 


/**
 * Block requests from particular ip address
 * 
 * @author Wim
 */
class Api_Hook_BlockIp extends Api_Hook_IHook {
	
	public function execute(){
		
		$service = func_get_arg(0);
		
		$config = $this->api->getConfig();
		$logger = $this->api->getLogger();
		
		// Stop if blocks is not configured
		if(!isset($config['block'])) return;
		
		$blocked = explode(',', $config['block']);
		
		if(in_array($_SERVER['REMOTE_ADDR'], $blocked)){
			$logger->log("Request blocked for this IP by BlockIp Hook.");
			$response = new Api_Response();
			$response->setCode(406);
			$response->addError("Stop it you Spammer!");
			$this->api->send($response);
		}
	}
	
}