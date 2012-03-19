<?php 

/**
 * Create database connection
 */
class MyApi_Hook_Database extends Api_Hook_IHook
{
    public function __destruct()
    {
        $config = $this->api->getConfig();
        if (isset($config['database']))
        {
            // close the database connection
            $config['database'] = null;
        }
    }
    
    /**
     * Setup new database connection and store it into the config.
     */
    public function execute()
    {
        $config = $this->api->getConfig();
        $dsn = $this->getDSN();
        try {
            // Create the Data Source Name
            $dbh = new PDO($dsn, $config['db_user'], $config['db_pass'], array(
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES \'UTF8\'')
            );
            
            // Set the error reporting attribute
            $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Store database
            $config['database'] = $dbh;
        }
        catch (PDOException $e) {
            $config['database'] = null;
            throw new Api_Error(Api_Error::DATABASE_ERROR, $e->getMessage());
        }
        
        #$this->api->getLogger()->log($config);
        
        // Save new config
        $this->api->setConfig($config);
    }
    
    /**
     * Create the Data Source Name for the database connection.
     * 
     * @param $config
     * @return string
     */
    private function getDSN($driver = 'mysql', $host = 'localhost', $name = 'api')
    {
        // e.g. mysql:host=localhost;dbname=api
        return ($driver.':'.'host='.$host.';dbname='.$name);
    }
}
