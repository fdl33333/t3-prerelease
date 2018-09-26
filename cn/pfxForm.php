<?php
    
	error_reporting(E_ALL);
	ini_set('display_errors', 'On');

	require_once("../assets/php/config.php");
	require_once("../assets/DHTMLX46/codebase/form_connector.php");
	require_once("../assets/DHTMLX46/codebase/db_mysqli.php");    
    
	$res = mysqli_connect(T3_SRV, T3_USR, T3_PWD, T3_DB);
	if (!$res) {
	    echo "ERROR!!";
	    exit;        
	}
    
    $form = new FormConnector($res,"MySQLi"); 



    $form->render_table("pfx","pfxId","pfx,descr,tznCode");
    
?>

