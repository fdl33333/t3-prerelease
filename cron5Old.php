#!/usr/bin/php

<?php
require_once("/var/www/html/assets/php/config.php");
require_once("/var/www/html/assets/php/classes/mySqliClass.php");

$filename = CRON_LOG_DIR . date("Y-m-d").".log";


$wavFiles = [];

foreach(glob(BASE_DIR . REC_DIR . "*.wav") as $wavFile) {
	$wavFiles[] = pathinfo($wavFile,PATHINFO_FILENAME);
}

$count = sizeof($wavFiles);
echo "\n\ncount:$count\n\n";
if ($count==0) {
	cronLog ("No wav files found for conversion");
	exit;
}
	
	

$uuids =  "'" . implode("','",$wavFiles) . "'";
echo $uuids;
echo "\n";

$my = new mySqliDb(T3_SRV, T3_USR, T3_PWD, T3_DB);

$sql = "SELECT 
		callId
	, 	uuid 
	FROM callrec r
	WHERE r.status = 0
	AND r.uuid IN ($uuids)";

$rows = $my->myGetRows($sql);
if ($rows===-1) {
	cronLog($my->getLastErr());
	cronLog("==============================================================================");
	exit;
}

if ($rows===0)	{
	cronLog ("No records found in db");
	exit;
}

foreach($rows as $row) {
	$uuid = $row["uuid"];
	echo "processing $uuid...\n";
	
	$recFile = BASE_DIR . REC_DIR . "$uuid.wav";
	$mp3File = BASE_DIR . MP3_DIR . "$uuid.mp3";
	$wavFile = BASE_DIR . WAV_DIR . "$uuid.wav";
	exec( "lame --cbr -b 16k $recFile $mp3File" );
	rename ($recFile,$wavFile);
	cronLog("$uuid converted and moved");
}	

cronLog("==============================================================================");
echo "\n..Finished!";
	
function cronLog ($s) {
	global $filename;
	$txt = date("H:i:s"). " - " . $s;
	file_put_contents($filename, $txt.PHP_EOL , FILE_APPEND );	
}
	

?>