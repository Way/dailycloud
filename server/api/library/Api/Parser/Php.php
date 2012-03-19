<?php

/**
 * Parse output to serialized PHP type
 * 
 * @author Wim
 */
class Api_Parser_Php extends Api_Parser_IParser{
	
	/**
	 * Content type
	 * @var string
	 */
	public $content_type = "text/plain";
	
	/**
	 * Parse to Json
	 * 
	 * @return string
	 */
	public function parse(){
		return serialize( $this->_data );
	}
	
}