<?php 

include("Api.php");
include("Parser/Json.php");
include("Parser/Xml.php");
include("Vo/ResponseVO.php");

$api = new Api();
$api->setType(Api::TYPE_XML);
$api->handle();