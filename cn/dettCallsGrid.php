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
		,	c.sessDTTM
		,	c.dialedNum
		,	CASE c.callTip
				WHEN 'N' THEN 'Norm'
				WHEN 'A' THEN 'Avv'
				WHEN 'S' THEN 'Supp'
				WHEN 'X' THEN 'Stra'
				WHEN 'O' THEN 'PO/NOrm'
				WHEN 'P' THEN 'PO/Avv'
				WHEN 'Q' THEN 'Via PO'
				WHEN 'I' THEN 'Entrante'
				WHEN 'T' THEN 'Istituto '
			END tip
		,	IF(c.retryCallId IS NULL,'','R') ric
		,	c.talkSecs
		,	c.totCharge
		,	c.descr
		,	s.statDescr
		FROM callrec c
		LEFT JOIN wl w ON w.wlId = c.wlId
		JOIN statcodes s ON s.code = c.status
		WHERE c.dettId = $dettId";

 $grid->render_sql($sql, "callId", "sessDTTM,dialedNum,tip,ric,talkSecs,totCharge,descr,statDescr");        
        
?>
        
        