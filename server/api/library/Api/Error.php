<?php

class Api_Error extends Exception {
	
	/**
	 * Error constants
	 */
	const MISSING_PARAMETERS 	= 'MISSING_PARAMETERS';
	const VERSION_NOT_FOUND 	= 'VERSION_NOT_FOUND';
	const SERVICE_NOT_FOUND 	= 'SERVICE_NOT_FOUND';
	const ACTION_NOT_FOUND 		= 'ACTION_NOT_FOUND';
	const REQUEST_METHOD_DISABLED = 'REQUEST_METHOD_DISABLED';
	const UNAUTHORIZED = 'UNAUTHORIZED';
	const TO_MANY_REQUESTS = 'TO_MANY_REQUESTS';
	
	/**
	 * Error constants data
	 * @var array
	 */
	private $_errors = array(
					'MISSING_PARAMETERS' => array('number' => 400, 'message' => 'Required parameters: %s'),
					'SERVICE_NOT_FOUND' => array('number' => 404, 'message' => 'Service with name "%s" is not found.'),
					'VERSION_NOT_FOUND' => array('number' => 404, 'message' => 'Version with name "%s" is not found.'),
					'ACTION_NOT_FOUND' => array('number' => 501, 'message' => 'Action with name "%s" is not found in service "%s".'),
					'REQUEST_METHOD_DISABLED' => array('number' => 405, 'message' => 'The used HTTP request method "%s" is not allowed for the action "%s".'),
					'UNAUTHORIZED'	=> array('number' => 401, 'message' => 'You are not authorized to do this action.'),
					'TO_MANY_REQUESTS' => array('number' => 406, 'message' => 'Max request per time unit reached.')
	);

	public function __construct($name, $message='', $code=404){
		
		if(isset($this->_errors[$name])){
		
			// Create prepared messages
			if(isset($message) && is_array($message)){
				$message = call_user_func_array('sprintf', array_merge(array($this->_errors[$name]['message']), $message));
			}else{
				$message = sprintf($this->_errors[$name]['message'], $message);
			}
			
			$code = $this->_errors[$name]['number'];
		
		}
		
		parent::__construct($message, $code);
		
	}
	
}