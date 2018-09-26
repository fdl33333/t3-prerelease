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
			d.dettId
		,	d.lname
		,	d.fname
		,	d.matr
		,	d.card
		,	l.langDescr
		,	c.ctypeDescr
		,	((SELECT ROUND(IFNULL(SUM(credamt),0),2) FROM recharge r WHERE r.dettId = d.dettId)
			- (SELECT ROUND(IFNULL(SUM(totCharge),0),2) FROM callrec c WHERE c.dettId = d.dettId)) saldo
		,	lastMod
		FROM dett d
		LEFT JOIN ctype c ON c.ctypeId = d.ctypeId
		LEFT JOIN lang  l ON l.langCode = d.langCode";

 $grid->render_complex_sql($sql, "dettId", "lname,fname,saldo,matr,card,langDescr,ctypeDescr,lastMod");        
        
?>
        
        