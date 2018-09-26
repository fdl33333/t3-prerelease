<?php 

$userId = $_GET["userId"];

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
			m.menuId
		,	m.menuDescr
		,	IF(FIND_IN_SET(menuId, (
				SELECT menuEnabled
				FROM usr u
				WHERE u.userId = $userId
			))>0,1,0) ck
		FROM menu m
		ORDER BY m.sort ASC";

 $grid->render_complex_sql($sql, "menuId", "menuDescr,ck");        
        
?>
        
        