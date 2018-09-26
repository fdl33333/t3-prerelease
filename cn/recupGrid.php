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
			r.recupId
		,	w.num	
		,	CASE tip
				WHEN 'N' THEN 'Normali'
				WHEN 'A' THEN 'Avvocato'
				WHEN 'S' THEN 'Supplementare'
				WHEN 'X' THEN 'Staordinaria'
				WHEN 'O' THEN 'Normale da PO'
				WHEN 'P' THEN 'Avvocato da PO'
			END tip
		,	w.descr
		,	r.dtCreate
		FROM recup r
		JOIN wl w ON w.wlId = r.wlId
		WHERE r.dettId = $dettId
		AND DATE(r.dtCreate) = DATE(NOW())
		AND r.dtUsed IS NULL";

 $grid->render_sql($sql, "recupId", "num,tip,descr,dtCreate");        
        
?>
        
        