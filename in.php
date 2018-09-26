#!/usr/bin/php

<?php
require_once("./assets/php/config.php");
require_once("./assets/php/fdl.php");

$host = 'localhost'; //host
$port = '9000'; //port
$null = NULL; //null var


$opExt="1000";

$keysWanted =[
		"Event-Name"
	,   "Channel-Call-State"
	,	"Caller-Callee-ID-Number"
	,   "Call-Direction"
	,   "variable_call_uuid"
	,   "Caller-Username"
];


if ((@$fp = event_socket_create())==false) {
	exit;
}

// fputs($fp, "event json channel_state channel_answer\n\n");
fputs($fp, "events json CHANNEL_ANSWER CHANNEL_HANGUP CHANNEL_PROGRESS CHANNEL_PROGRESS_MEDIA\n\n");

$calls = [];

$tOld = gmdate("d/m/Y H:i:s");
$wild = '{"Event-Name":';

while (true) {


// INCOMING CALLS

	if (!feof($fp)) {
		$buffer = fgets($fp) ; // , 256);
	
	   	if (strlen($buffer) > 0) {
	
			if (substr($buffer,0,strlen($wild)) == $wild)  {
				$buffer = substr($buffer,0,strpos($buffer,"}") + 1);
				$data = json_decode($buffer,true);

				echo "\n================================\n";
								
				if (getVal($data,"Caller-Callee-ID-Number")== $opExt) {
/***
					foreach($keysWanted as $k) {
						$val = getVal($data,$k);
						if ($val!="")
							echo "$k|$val\n";
					}
***/
					$evtName	= getVal($data, "Event-Name");
					$chState	= getVal($data, "Channel-Call-State");
					$dir		= getVal($data,	"Call-Direction");
					$callee		= getVal($data, "Caller-Callee-ID-Number");
					$uid		= getVal($data, "variable_call_uuid");
					$caller		= getVal($data, "Caller-Username");
					$dettId		= getVal($data, "variable_dettId");
					if ($evtName == "CHANNEL_PROGRESS"
						&& $chState == "DOWN") {
							echo "EXT:\t$callee\nEVT:\tRinging\nCaller:\t$caller\nUUID:\t$uid\ndettId:\t$dettId\n";
						}
					
					if ($evtName == "CHANNEL_ANSWER") {
						// && $chState == "EARLY") {
							echo "EXT:\t$callee\nEVT:\tAnswered\nCaller:\t$caller\nUUID:\t$uid\ndettId:\t$dettId\n";
						}

					if ($evtName == "CHANNEL_HANGUP") {
							echo "EXT:\t$callee\nEVT:\tHungup\nCaller:\t$caller\nUUID:\t$uid\ndettId:\t$dettId\n";
						}
				}
			}				
	    }
	}

}
socket_close($socket);
fclose($fp);  


function event_socket_create() {
	$fp = @fsockopen(FS_HOST, FS_PORT, $errNo, $errDescr);
	if (!$fp) {	
		echo "ERROR: $errNo - $errDescr";
		return(false);
	}

	socket_set_blocking($fp,false);

	if ($fp) {
		while (!feof($fp)) {
			$buffer = fgets($fp, 1024);
			usleep(100); //allow time for reponse
			if (trim($buffer) == "Content-Type: auth/request") {
				echo "sending AUTH " . FS_PWD . "\n";
				fputs($fp, "AUTH " . FS_PWD . "\n\n");
				break;
			}
		}
		return $fp;
	}	else {
		return false;
	}           
}

function event_socket_request($fp, $cmd) {
	
	if ($fp) {    
	    fputs($fp, $cmd."\n\n");    
	    usleep(100); //allow time for reponse
	     
	    $response = "";
	    $i = 0;
	    $contentlength = 0;
	    while (!feof($fp)) {
	       $buffer = fgets($fp, 4096);
	       if ($contentlength > 0) {
	          $response .= $buffer;
	       }
	        
	       if ($contentlength == 0) { //if contentlenght is already don't process again
	           if (strlen(trim($buffer)) > 0) { //run only if buffer has content
	               $temparray = explode(":", trim($buffer));
	               if ($temparray[0] == "Content-Length") {
	                  $contentlength = trim($temparray[1]);
	               }
	           }
	       }
	        
	       usleep(100); //allow time for reponse
	        
	       //optional because of script timeout //don't let while loop become endless
	       if ($i > 10000) { break; } 
	        
	       if ($contentlength > 0) { //is contentlength set
	           //stop reading if all content has been read.
	           if (strlen($response) >= $contentlength) {  
	              break;
	           }
	       }
	       $i++;
	    }
	     
	    return($response);
	}
	else {
	  echo "no handle";
	}
}


