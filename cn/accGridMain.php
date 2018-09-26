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

/**
$sql = "SELECT 
			d.dettId
		,	d.lname
		,	d.fname
		,	d.matr
		,	SUM(ROUND(z.cr,2)) totCR
		,	SUM(ROUND(z.db,2)) totDB
		,	SUM(ROUND(z.cr,2)) - SUM(ROUND(z.db,2)) bal
		FROM (
			SELECT 
				c.dettId
			,	c.sessDTTM dttm
			,	0	cr
			,	c.totCharge db
			FROM callrec c
			WHERE IFNULL(totCharge,0) > 0 
		UNION ALL
			SELECT
				r.dettId
			,	r.dttm	ddtm
			,	r.credamt cr
			,	0	db
			FROM recharge r
		) z
		JOIN dett d ON d.dettId = z.dettId
		GROUP BY dettId";
**/

$sql = "SELECT 
			d.dettId
		,	d.lname
		,	d.fname
		,	d.matr
		,	SUM(ROUND(z.cr,2)) totCR
		,	SUM(ROUND(z.db,2)) totDB
		,	SUM(ROUND(z.cr,2)) - SUM(ROUND(z.db,2)) bal
		FROM dett d 
		LEFT JOIN (
			SELECT 
				c.dettId
			,	c.sessDTTM dttm
			,	0	cr
			,	c.totCharge db
			FROM callrec c
			WHERE IFNULL(totCharge,0) > 0 
		UNION ALL
			SELECT
				r.dettId
			,	r.dttm	ddtm
			,	r.credamt cr
			,	0	db
			FROM recharge r
		) z ON z.dettId = d.dettId
		GROUP BY dettId";		
 $grid->render_sql($sql, "dettId", "lname,fname,matr,totCR,totDB,bal");        
        
?>
        
        