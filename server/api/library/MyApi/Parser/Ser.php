<?php

class MyApi_Parser_Ser extends Api_Parser_IParser{
	
	public $content_type = 'text/plain';
	
	public function parse(){
		return serialize($this->_data);
	}
	
}