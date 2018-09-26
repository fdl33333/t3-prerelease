<?php 

error_reporting(E_ALL);
ini_set('display_errors', 'On');

require_once("../assets/php/config.php");
require_once("../assets/DHTMLX46/codebase/grid_connector.php");
require_once("../assets/DHTMLX46/codebase/db_mysqli.php");


$dettId = $_GET["dettId"];


$res = mysqli_connect(T3_SRV, T3_USR, T3_PWD, T3_DB);
if (!$res) {
    echo "ERROR!!";
    exit;        
}

$res->query("SET NAMES 'utf8' COLLATE 'utf8_general_ci'");    

$grid = new GridConnector($res,"MySQLi"); 

$sql = "SELECT 
			c.callId
		,	CONCAT(d.lname,' ',d.fname) dettname
		,	c.sessDTTM
		,	c.dialedNum
		,	s.statDescr
		,	p.descr
		,	c.callTip
		,	c.totSecs
		,	CAST(ROUND(c.totCharge,2) AS DECIMAL(6,2)) totCharge
		FROM callrec c
		LEFT JOIN dett d ON d.dettId = c.dettId
		LEFT JOIN pfx p ON p.pfxId = c.pfxId
		LEFT JOIN statcodes s ON s.code = c.`status`
		ORDER BY sessDTTM desc";

 $grid->render_sql($sql, "callId", "dettname,sessDTTM,dialedNum,statDescr,descr,callTip,totSecs,totCharge");        
        
?>
        
        