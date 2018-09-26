#!/usr/bin/php
<?php
require_once('./assets/php/ESL.php');

define("EVT_REQ", "CHANNEL_ANSWER CHANNEL_BRIDGE CHANNEL_CREATE CHANNEL_HANGUP CHANNEL_HOLD CHANNEL_ORIGINATE");

$esl = new eslConnection('127.0.0.1', '8021', 'ClueCon');
$esl->events("json", EVT_REQ);


while (true) {
	$e = $esl->recvEventTimed(20);
	if ($e) {
		echo "\ngot event\n";
		$json = json_decode($e->serialize("json"));
		print_r($json);
	}
	echo ".";
}
	

?>
