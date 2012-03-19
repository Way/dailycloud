<?php

/**
 * Parse output to Json
 * Use "cb" parameter for a callback function (/cb/myFunction.json)
 * 
 * @author Wim
 */
class Api_Parser_Json extends Api_Parser_IParser{
	
	/**
	 * Content type
	 * @var string
	 */
	public $content_type = "application/json";
	
	/**
	 * Parse to Json
	 * 
	 * @return string
	 */
	public function parse(){
		if(isset($this->params['cb']) && !empty($this->params['cb'])){
			return $this->params['cb'] . '(' . json_encode( $this->_data ) . ')';
		}
		return json_encode( $this->_data );
		
	}
	
}