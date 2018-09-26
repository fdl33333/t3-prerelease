<html>
<head>
<style>

table {
	width:100%;
}



table, tr, td, th {
	border:solid 1px #ccc;
}

th {
	text-align: left;
}

</style>

</head>

<body>



<?php

// DebugBreak();

error_reporting( E_ALL );

require_once("./assets/php/fdl.php");
require_once("./assets/php/config.php");
require_once("./assets/php/classes/mySqliClass.php");

$tots =[];
$hdr=[];

$repId = $_GET["repId"];

$my = new mySqliDb(T3_SRV, T3_USR, T3_PWD, T3_DB);

$sql = "SELECT * FROM rep WHERE repId = $repId";
$rows = $my->myGetRows($sql);
if ($rows=== -1) {
	echo "<h1>Q1:" . $my->getLastErr() . "</h1>";
	exit;
}

if ($rows=== 0) {
	echo "<h1>Report $repId NOT found</h1>";
	exit;
}

$sql 	= $rows[0]["sql"];
$repDescr = $rows[0]["repDescr"];


$rows = $my->myGetRows($sql);
if ($rows=== -1) {
	echo "<h1>Q2:" . $my->getLastErr() . "</h1>";
	exit;
}

if ($rows=== 0) {
	echo "<h1>No data found for this report</h1>";
	exit;
}
?>
<h1><?php echo $repDescr; ?></h1>

<table>
<?php 
$hd =false;
foreach($rows as $row) {
	if (!$hd) {
		echo "<tr>";
		foreach($row as $k => $v) {
			if (substr($k,0,4) == "__T_") 	$k=substr($k,4);
			echo "<th>$k</th>";
		}
		echo "</tr>";
		$hd = true;
	}
	echo "<tr>";
	foreach($row as $k => $v) {
		if (substr($k,0,4) == "__T_") {
			$k=substr($k,4);
			if(!array_key_exists ( $k, $tots ))
				$tots[$k]=0;
				
			$tots[$k] = floatval($tots[$k]) + floatval($v);
		} else {
			if(!array_key_exists ( $k, $tots ))
				$tots[$k]="";
		}
		
		echo "<td>$v</td>";
	}
	echo "</tr>";
}

if (sizeof($tots)!=0) {
	echo "<tr>";
	foreach($tots as $tot) {
		echo "<td><strong>$tot</strong></td>";	
	}
	echo "</tr>";
	
}

?>
</table>

</body>
</html>
