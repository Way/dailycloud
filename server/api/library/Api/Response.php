<?php

/**
 * Class that will hold the data for a response 
 * to a client request
 *
 * @copyright Copyright (c) 2008-2010 Sitebase (http://www.sitebase.be)
 * @author Wim Mostmans
 * @category   PHP
 * @package    API Framework
 * @license    
 * @version    $Id$
 *
 * You need to buy a license if you want use this script.
 */
class Api_Response{
	
	/**
	 * Output types supported by that API
	 */
	const TYPE_XML 		= "Xml";
	const TYPE_JSON 	= "Json";
	const TYPE_PHP		= "Php";
	const TYPE_TXT		= "Txt";
	const TYPE_PRINTR	= "Printr";
	const TYPE_CSV		= "Csv";
	
	/**
	 * Property that hold the response http code
	 * @var int 
	 */
	protected $code = 200;
	
	/**
	 * Property that holds a list of error that happend while executing
	 * @var array 
	 */
	protected $errors = array();
	
	/**
	 * Property that holds the response data
	 * @var *
	 */
	protected $data;
	
	/**
	 * Constructor
	 * 
	 * @param int $code
	 * @param * $data
	 * @param Api_Error $error
	 * @return void
	 */
	public function __construct($code=200, $data='', $error=null){
		$this->code = $code;
		$this->data = $data;
		$this->addError($error);
	}
	
	/**
	 * Code setter
	 * 
	 * @param int $value
	 * @return void
	 */
	public function setCode($value){
		$this->code = $value;
	}
	
	/**
	 * Code getter
	 * 
	 * @return int
	 */
	public function getCode(){
		return $this->code;
	}
	
	/**
	 * Data setter
	 * 
	 * @param * $value
	 * @return void
	 */
	public function setData($value){
		$this->data = $value;
	}
	
	/**
	 * Data getter
	 * 
	 * @return *
	 */
	public function getData(){
		return $this->data;
	}
	
	/**
	 * Add error
	 * 
	 * @param Api_Error $error
	 * @return void
	 */
	public function addError($error){
		if(is_array($error)){
			$this->errors = array_merge($this->errors, $error);
			return;
		}
		$this->errors[] = $error;
	}
	
	/**
	 * Get errors
	 * 
	 * @return array
	 */
	public function getErrors(){
		return $this->errors;
	}
	
}