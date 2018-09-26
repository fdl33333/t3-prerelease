<?php 

error_reporting(E_ALL);
ini_set('display_errors', 'On');

require_once("../assets/php/config.php");
require_once("../assets/DHTMLX46/codebase/grid_connector.php");
require_once("../assets/DHTMLX46/codebase/db_mysqli.php");



if (!isset($_GET["limit"]))	
	$limit = 90;
else 
	$limit = $_GET["limit"];


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
		, 	d.fname
		,	IFNULL(z.ll,'') ll
		,	IFNULL(z.ld,'') ld
		,	IFNULL(z.dd,'') dd
		,	IFNULL(z.ww,'') ww
		,	IFNULL(z.mm,'') mm
		FROM dett d
		LEFT JOIN (
			SELECT 
				r.dettId
			,	MAX(r.sessDTTM) ll
			,	DATEDIFF(NOW(),MAX(r.sessDTTM)) ld
			,	SUM(IF (DATEDIFF(DATE(NOW()), DATE(r.sessDTTM))=0,1,0)) dd
			,	SUM(IF (DATEDIFF(DATE(NOW()), DATE(r.sessDTTM))<=7,1,0)) ww
			,	SUM(IF (DATEDIFF(DATE(NOW()), DATE(r.sessDTTM))<=30,1,0)) mm
			FROM callrec r
			WHERE r.`status` = 0
			GROUP BY r.dettId
		) z ON z.dettId = d.dettId";

if  ($limit == "XX")		
	$sql .= "\nWHERE ld IS NULL";
else 
	$sql .= "\nWHERE ld >= $limit"
;
		
 $grid->render_complex_sql($sql, "dettId", "lname,fname,ll,ld,dd,ww,mm");        
        
?>
        
        