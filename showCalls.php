#!/usr/bin/php

<?php
require_once("./assets/php/config.php");
require_once("./assets/php/fdl.php");
require_once("./assets/php/classes/mySqliClass.php");
require_once("./assets/php/classes/T3Class.php");

$host = 'localhost'; //host
$port = '9000'; //port
$null = NULL; //null var

/// WEBSOCK 
$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);
socket_bind($socket, 0, $port);
socket_listen($socket);
$clients = array($socket);


$my = new mySqliDb(T3_SRV, T3_USR, T3_PWD, T3_DB);

$t3 = new t3();

if ((@$fp = event_socket_create())==false) {
	exit;
}

// fputs($fp, "event json channel_state channel_answer\n\n");
// fputs($fp, "events json CHANNEL_ANSWER CHANNEL_HANGUP CHANNEL_PROGRESS CHANNEL_PROGRESS_MEDIA\n\n");



while (true) {
    echo "sending .. \n";
    fputs($fp, "api show channels\n\n");
	if (!feof($fp)) {
		echo "looping ..\n";
		$buffer = "";
		while(1) {
			usleep(100);
			$part =  fgets($fp) ;
			if ($part =="") break;
			$buffer .= $part;
		}
			   	
	   	if (strlen($buffer) > 0) {
			echo "$buffer";
		}
	}
	echo "waiting..\n";
	sleep(1);
	// usleep(1000); //allow time for reponse
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

