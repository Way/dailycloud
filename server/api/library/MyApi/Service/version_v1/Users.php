<?php

class MyApi_Service_Users extends Api_Service_IService{
	
	/**
	 * A name for this service
	 * This is the name for this service that is used in errors
	 * that will be shown to the users and in the log files
	 * @var string
	 */
	protected $_name = "Users";
	
	public function __construct($api){
		parent::__construct($api);
		
		// Set newHello request methods
		$this->addAllowedMethod("all", Api_Request::METHOD_GET);
		
	}
	
	public function execute($params, $config){
		
		$this->code = 301;
		return "User information service.";
		
	}
	
	public function all($params, $config){
		$this->code = 200;
		$config = $this->_api->getConfig();
		
		// Connect to mysql
		$link = mysqli_connect(
            $config['db_host'],  /* The host to connect to */
            $config['db_user'],       /* The user to connect as */
            $config['db_pass'],   /* The password to use */
            $config['db_name']);     /* The default database to query */
            
		$result = mysqli_query($link, 'SELECT * FROM wp_users');
		
		$users = array();
	    while( $row = mysqli_fetch_assoc($result) ){
	    	$users[] = $row;
	    } 
		return array('users' => $users);
	}
	
}