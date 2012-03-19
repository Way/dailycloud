<?php

/**
 * Parse output to Txt
 * 
 * @author Wim
 */
class Api_Parser_Txt extends Api_Parser_IParser{
	
	/**
	 * New line var
	 * @var string
	 */
	const NEWLINE = "\n";
	
	/**
	 * Content type
	 * @var string
	 */
	public $content_type = "text/plain";
	
	/**
	 * Remove empty vars
	 * @var bool
	 */
	public $remove_empty_elements = true;
	
	/**
	 * Parse to XML
	 * 
	 * @return string
	 */
	public function parse(){
		
		// Start flatten data
		$result = '';
		$this->add($this->_data, $result);

		return $result;
		
	}
	
	/**
	 * Add element plain content to the output
	 * 
	 * @param string $value
	 */
	private function add($value, &$result){
		
		// Get variable type
		$type = gettype($value);
		
		switch($type){
			case "boolean";
				$result .= $value ? "true" : "false";
				$result .= self::NEWLINE;
				break;
			case "integer":
				$result .= $value . self::NEWLINE;
				break;
			case "double":
				$result .= $value . self::NEWLINE;
				break;
			case "string":
				$result .= $value . self::NEWLINE;
				break;
			case "array":
				if($this->remove_empty_elements && count($value) == 0) return;
				foreach($value as $arr_key => $arr_val){
					$this->add($arr_key . '::' . $arr_val, $result);
				}
				break;
			case "object":
				$properties = get_object_vars($value);
				foreach($properties as $obj_key => $obj_val){
					$this->add($obj_key . '::' . $obj_val . self::NEWLINE, $result);
				}
				break;
			default:
				
				break;
		}

	}
	
}