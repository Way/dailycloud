<?php

/**
 * Parse output to Xml
 * 
 * @author Wim
 */
class Api_Parser_Xml extends Api_Parser_IParser{
	
	/**
	 * Root XML elment
	 * @var string
	 */
	public $root_element = "response";
	
	/**
	 * Content type
	 * @var string
	 */
	public $content_type = "text/xml";
	
	/**
	 * Remove empty vars
	 * @var bool
	 */
	public $remove_empty_elements = true;
	
	/**
	 * Add variable type to output
	 * @var bool
	 */
	public $add_var_type = false;
	
	/**
	 * Parse to XML
	 * 
	 * @return string
	 */
	public function parse(){
		
		// Create root element
		$root = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><message/>');
		
		// Add metadata
		$root->addAttribute("client", $_SERVER['REMOTE_ADDR']);
		$root->addAttribute("time", time());
		
		// Start encoding
		$this->encode($this->root_element, $this->_data, &$root);
		
		return $root->asXML();
		
	}
	
	/**
	 * Recursive add element to xml
	 * 
	 * @param string $key
	 * @param * $value
	 * @param SimpleXMLElement $root
	 */
	private function encode($key, $value, &$root){
		
		// Get variable type
		$type = gettype($value);

		if(is_numeric($key)){
			$key = substr($root->getName(), 0, -1);
		}
		
		switch($type){
			case "boolean";
				$value = $value ? "true" : "false";
				$root->addChild($key, $value);
				break;
			case "integer":
				$root->addChild($key, $value);
				break;
			case "double":
				$root->addChild($key, $value);
				break;
			case "string":
				$root->addChild($key, $value);
				break;
			case "array":
				if($this->remove_empty_elements && count($value) == 0) return;
				$child = $root->addChild($key, "");
				foreach($value as $arr_key => $arr_val){
					$this->encode($arr_key, $arr_val, $child);
				}
				break;
			case "object":
				$properties = get_object_vars($value);
				$child = $root->addChild($key, "");
				foreach($properties as $arr_key => $arr_val){
					$this->encode($arr_key, $arr_val, $child);
				}
				break;
			default:
				
				break;
		}

		// Add type attribute
		if($this->add_var_type) @$root->$key->addAttribute('type', $type);
		
	}
	
	/**
	 * Set the element to use as root
	 * 
	 * @param string $name
	 * @return void
	 */
	public function setRoot($name){
		$this->root_element = $name;	
	}
	
	/**
	 * Remove empty elements
	 * 
	 * @param bool $enable
	 * @return void
	 */
	public function enableRemoveEmpty($enable=true){
		$this->remove_empty_elements = $enable;	
	}
	
	/**
	 * Add var types
	 * 
	 * @param bool $enable
	 * @return void
	 */
	public function enableAddVarTypes($enable=true){
		$this->add_var_type = $enable;	
	}
	
}