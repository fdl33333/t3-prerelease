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
			kkk
		,	dttm
		,	IF(tip='C', CAST(ROUND(cr,2) AS DECIMAL(6,2)),'') cr
		,	IF(tip='D', CAST(ROUND(db,2) AS DECIMAL(6,2)),'') db
		,	descr
		FROM (
			SELECT 
				CONCAT('C',callId) kkk
			,	sessDTTM dttm
			,	0	cr
			,	ROUND(totCharge,2) db
			,	CONCAT(calltip,'-',dialedNum) descr
			,	'D' tip
			FROM callrec c
			WHERE c.dettId = $dettId
			AND IFNULL(totCharge,0) > 0 
		UNION ALL
			SELECT
				CONCAT('R',rechargeId) kkk
			,	dttm
			,	ROUND(credamt,2) cr
			,	0 db
			,	descr
			,	'C' tip
			FROM recharge r
			WHERE r.dettId = $dettId
		) z"; 

 $grid->render_sql($sql, "kkk", "dttm,cr,db,descr");        
        
?>
        
        