#!/usr/bin/php

<?php
require_once("/var/www/html/assets/php/config.php");
require_once("/var/www/html/assets/php/classes/mySqliClass.php");

$filename = CRON_LOG_DIR . date("Y-m-d").".log";


$wavFiles = [];

function filter_filename($name) {
    // remove illegal file system characters https://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
    $name = str_replace(array_merge(
        array_map('chr', range(0, 31)),
        array('<', '>', ':', '"', '/', '\\', '|', '?', '*','\'')
    ), '', $name);
    // maximise filename length to 255 bytes http://serverfault.com/a/9548/44086
    $ext = pathinfo($name, PATHINFO_EXTENSION);
    $name= mb_strcut(pathinfo($name, PATHINFO_FILENAME), 0, 255 - ($ext ? strlen($ext) + 1 : 0), mb_detect_encoding($name)) . ($ext ? '.' . $ext : '');
    return $name;
}

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
	, 	`uuid`
	,	REPLACE(CONCAT(d.lname , '-', d.fname, '-', d.matr),' ','_') folder
	,	CONCAT(REPLACE(REPLACE(r.sessDTTM,':','.'),' ','_'), '-',r.dialedNum,'-',d.matr) fname
	FROM callrec r
	JOIN dett d ON d.dettId = r.dettId
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
	
	$dirName = filter_filename($row["folder"]);
	$fileName = filter_filename($row["fname"]);
	$callId = $row["callId"];
	
	$recFile = BASE_DIR . REC_DIR . "$uuid.wav";
	if (!file_exists(BASE_DIR . MP3_DIR . $row["folder"])) 
		mkdir(BASE_DIR . MP3_DIR . $row["folder"], 0777, true);
	
	
	$mp3File = BASE_DIR . MP3_DIR . $dirName . "/" . $fileName . ".mp3";
	$wavFile = BASE_DIR . WAV_DIR . "$uuid.wav";
	
	exec( "lame --cbr -b 16k $recFile $mp3File" );
	
	$sql = "INSERT INTO rec (callid, filename)
			VALUES ($callId, '$dirName/$fileName')";
	if (!$my->doSQL($sql)) {
		cronLog("$uuid mysql error:" . $my->getLastErr());
	} else {
		rename ($recFile,$wavFile);
	}
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