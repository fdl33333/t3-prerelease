<?php 

error_reporting(E_ALL);
ini_set('display_errors', 'On');

require_once("../assets/php/config.php");
require_once("../assets/DHTMLX46/codebase/grid_connector.php");
require_once("../assets/DHTMLX46/codebase/db_mysqli.php");


$res = mysqli_connect(T3_SRV, T3_USR, T3_PWD, T3_DB);
if (!$res) {
    echo "ERROR!!";
    exit;        
}

$res->query("SET NAMES 'utf8' COLLATE 'utf8_general_ci'");    

$grid = new GridConnector($res,"MySQLi"); 

$sql = "SELECT 
			c.cardId
		,	c.serial
		,	c.pinOrig
		,	c.pin
		,	c.dtCreate
		,	IF(c.enabled=1,'SI','NO') enabled
		,	IFNULL(CONCAT(d.lname,' ',d.fname),'') dettName
		,	c.notes	
		FROM card c
		LEFT JOIN dett d ON d.card = c.serial";

 $grid->render_sql($sql, "cardId", "serial,enabled,pinOrig,pin,dtCreate,dettName,notes");        
        
?>
        
        