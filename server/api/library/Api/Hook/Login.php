<?php 


/**
 * Handle login calls for api
 * 
 * @author Wim
 */
class Api_Hook_Login extends Api_Hook_IHook {
	
	/**
	 * Parameters
	 * This array will contain the database settings
	 * that you can use in the login function to connect 
	 * to a database
	 * @var array $params
	 */
	private $_params = array();
	
	public function execute(){
		
		$service = func_get_arg(0);
		$this->_params = $this->api->getRequest()->getParams();
		if(!$this->login($this->_params['username'], $this->_params['password'])){
			throw new Api_Error(Api_Error::UNAUTHORIZED);
		}
	}
	
	/**
	 * An example login function
	 * For the moment this function is using static data but you can 
	 * easely extend it so that it uses a database
	 * 
	 * @param unknown_type $username
	 * @param unknown_type $password
	 */
	private function login($username, $password){
		return ($username == 'admin' && $password == '123');
	}
	
}