<html>
<head>
<style>
.icon {
	float:left;
	width:100px;
	height:40px;
	padding-top:5px;
	text-align:center;
	border:solid 1px grey;
	font-family:sans-serif;
	font-size:7pt;
}
</style>
</head>
<body>
<?php

$dir    = './';
$files = scandir($dir);
echo "<pre>";
foreach ($files as $file) {
	if ($file!="." && $file!=".." && strpos($file,".php")===false) {
		echo "<div class=\"icon\">";
		echo "<img src=\"$file\" alt=\"$file\">";
		echo "<br>$file";
		echo "</div>";
	}
}

?>

</body>
</html>


