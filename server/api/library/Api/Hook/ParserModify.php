<?php 


/**
 * With this hook you can modify some settings from the current parser
 * 
 * @author Wim
 */
class Api_Hook_ParserModify extends Api_Hook_IHook {
	
	public function execute(){
		$parser = func_get_arg(0);

		// Uncomment the lines below to add var type to the output xml
		//if($this->api->getType() == Api_Response::TYPE_XML){
		//	$parser->enableAddVarTypes();
		//}
	}
	
}