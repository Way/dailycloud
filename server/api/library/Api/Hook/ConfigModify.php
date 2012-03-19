<?php 

/**
 * Handle login calls for api
 * 
 * @author Wim
 */
class Api_Hook_ConfigModify extends Api_Hook_IHook {
	
	public function execute(){
		$config = $this->api->getConfig();
		
		// Add database connection
		$mysqli = new mysqli($config['db_host'], $config['db_user'], $config['db_pass'], $config['db_name'], $config['db_port']);
		$config['database'] = $mysqli;
		
		// Add cache path
		$current_file_path = str_replace("\\", "/", dirname(__FILE__));
		$lib_pos = strpos($current_file_path, "/library/");
		$config['cache'] = substr($current_file_path, 0, $lib_pos) . "/cache";
		
		// Save new config
		$this->api->setConfig($config);
	}
	
}