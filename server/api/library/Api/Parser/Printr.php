<?php

/**
 * Parse output to Printr
 * 
 * @author Wim
 */
class Api_Parser_Printr extends Api_Parser_IParser{
	
	/**
	 * Content type
	 * @var string
	 */
	public $content_type = "text/plain";
	
	/**
	 * Parse to XML
	 * 
	 * @return string
	 */
	public function parse(){
		return print_r($this->_data, true);
	}
	
}