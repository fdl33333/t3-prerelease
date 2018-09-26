#!/usr/bin/php

<?php
require_once("./assets/php/config.php");
require_once("./assets/php/fdl.php");



if ((@$fp = event_socket_create())==false) {
	exit;
}

// fputs($fp, "event json channel_state channel_answer\n\n");
fputs($fp, "events json CHANNEL_ANSWER CHANNEL_HANGUP CHANNEL_PROGRESS CHANNEL_PROGRESS_MEDIA\n\n");

$calls = [];

$tOld = gmdate("d/m/Y H:i:s");
$wild = '{"Event-Name":';

$want =  [
	"Event-Name"
,	"Channel-State"
,	"Unique-ID"
,	"Call-Direction"
,	"Caller-Caller-ID-Number"
,	"Caller-Destination-Number"
,	"Answer-State"
,	"Channel-Name"
,	"Channel-Call-State"
];

while (true) {

/////////////////////////// THE REAL STUFF

	if (!feof($fp)) {
		$buffer = fgets($fp) ; // , 256);
	   	if (strlen($buffer) > 0) {
			if (substr($buffer,0,strlen($wild)) == $wild)  {
				$buffer = substr($buffer,0,strpos($buffer,"}") + 1);
				$data = json_decode($buffer,true);
				$simple = [];
				foreach($data as $k => $v) {
					if (in_array($k, $want)) 
						$simple[$k] = $v;
				}
				print_r($simple);
				echo "\n=============================================\n";
			
			}				
	    }
	}

}

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


