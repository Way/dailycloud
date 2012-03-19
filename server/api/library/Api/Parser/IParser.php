<?php

/**
 * The base class for the output parsers
 * 
 * @author Wim
 */
abstract class Api_Parser_IParser{
	
	/**
	 * Holds data objects that must be parsed
	 * @var *
	 */
	protected $_data;
	
	/**
	 * The parameters set in the url request
	 * @var array 
	 */
	protected $params;
	
	/**
	 * The content type that the parser returns
	 * @var string
	 */
	public $content_type = "";
	
	/**
	 * Parse data to the correct format
	 * 
	 * @return string
	 */
	public function parse(){}
	
	/**
	 * Set data
	 * 
	 * @param * $data
	 * @return void
	 */
	public function setData($data){
		$this->_data = $data;
	}
	
	/**
	 * Set params
	 * 
	 * @param array $params
	 * @return void
	 */
	public function setParams($params){
		$this->params = $params;
	}
	
}