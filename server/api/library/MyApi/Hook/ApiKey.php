<?php

class MyApi_Hook_ApiKey extends Api_Hook_IHook
{
    public function execute()
    {
        $params = $this->api->getRequest()->getParams();
        $config = $this->api->getConfig();
        
        //$this->api->getLogger()->log($config['api_key']);
        
        if (!isset($params['key']) || $params['key'] != $config['api_key'])
        {
            throw new Api_Error('Not allowed', 'You are not allowed to use this Api');
        }
    }
}
