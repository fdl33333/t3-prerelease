<?php

error_reporting(E_ALL);
ini_set('display_errors', 'On');


    require_once("../assets/php/config.php");
    require_once("../assets/DHTMLX46/codebase/options_connector.php");
    require_once("../assets/DHTMLX46/codebase/db_mysqli.php");

    $roles = "," . (isset($_GET["roles"]) ? $_GET["roles"] : "") . ",";
    
	$res = mysqli_connect(T3_SRV, T3_USR, T3_PWD, T3_DB);
	if (!$res) {
	    echo "ERROR!!";
	    exit;        
	}

	$res->query("SET NAMES 'utf8' COLLATE 'utf8_general_ci'");  

    $sql = "SELECT ctypeId, ctypeDescr
    		FROM ctype
    		ORDER BY ctypeDescr ASC"; 
    

    $options = new SelectOptionsConnector($res, "MySQLi");
    $options->render_sql($sql,"ctypeId","ctypeId,ctypeDescr");
    
?>




