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
			wlId
		,	num
		,	CASE tip
				WHEN 'N' THEN 'Normali'
				WHEN 'A' THEN 'Avvocato'
				WHEN 'S' THEN 'Supplementare'
				WHEN 'X' THEN 'Staordinaria'
				WHEN 'O' THEN 'Normale da PO'
				WHEN 'P' THEN 'Avvocato da PO'
			END tip
		,	CASE duration
				WHEN 86400 THEN '*Illimit.'
				ELSE CONCAT(duration,' min.')
			END dur
		,	descr
		,	CASE tip
				WHEN 'S' THEN ''
				WHEN 'X' THEN ''
				ELSE
					CASE callsFreq 
		                WHEN 'D'    THEN CONCAT(callsQta,' x Giorno')
						WHEN 'M'	THEN CONCAT(callsQta,' x Mese')
						WHEN 'W'	THEN CONCAT(callsQta,' x Sett.')
						ELSE		'Unica'
				END				
		    END cFreq
		,	CASE attWithin
				WHEN 30 	THEN CONCAT(attNum, ' entro ',  '30 min')
				WHEN 60 	THEN CONCAT(attNum, ' entro ',  '1 ora')
				WHEN 120 	THEN CONCAT(attNum, ' entro ',  '2 ore')
				WHEN 360 	THEN CONCAT(attNum, ' entro ',  '6 ore')
				WHEN 999 	THEN CONCAT(attNum, ' entro ',  'Fine gg')
			END recup
		,	CASE tip
				WHEN 'A' THEN '-'
				WHEN 'P' THEN '-'
				ELSE IF(record=1,'SI','NO')
			END reg
		,	CASE	tip
				WHEN 'S' THEN expire
				WHEN 'X' THEN expire
				ELSE ''
			END scad
		FROM wl 
		WHERE dettId = $dettId";

 $grid->render_sql($sql, "wlId", "num,tip,dur,cFreq,recup,reg,scad,descr");        
        
?>
        
        