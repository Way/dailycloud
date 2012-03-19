<?php

class MyApi_Service_Database extends Api_Service_IService
{
    /**
     * A name for this service
     * This is the name for this service that is used in errors
     * that will be shown to the users and in the log files
     * @var string
     */
    protected $_name = "Database";
    
    /**
     * Construct
     *
     * @param Api $api
     */
    public function __construct($api){
        parent::__construct($api);
        
        // Trigger apikey hook
        $api->addHook("MyApi_Hook_ApiKey", Api_Hook_IHook::HOOK_BEFORE_SERVICE_EXECUTE);
        
        // Set request method(s)
        $this->addAllowedMethod("execute", Api_Request::METHOD_POST);
    }

    /**
     * Fetch some data from the database.
     * 
     * @param array $params Parameters that are submitted
     * @param array $config Api config
     */	
	public function execute($params, $config)
	{
		// HTTP Code
		$this->code = 200;
		
        $result = array();
        
        $dbh = $config['database'];
        if ($dbh != null)
        {
            // Query variables
            $animal_id = 6;
            $animal_name = 'bruce';
            
             // Prepare the SQL statement
            $stmt = $dbh->prepare("SELECT * FROM animals WHERE animal_id = :animal_id AND animal_name = :animal_name");

            // Bind the paramaters
            $stmt->bindParam(':animal_id', $animal_id, PDO::PARAM_INT);
            $stmt->bindParam(':animal_name', $animal_name, PDO::PARAM_STR, strlen($animal_name));
            
             // Execute the prepared statement
            $stmt->execute();
            
            // Fetch the results
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
		return $result;
	}
	
}