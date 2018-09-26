#!/usr/bin/php

<?php
require_once("./assets/php/config.php");
require_once("./assets/php/fdl.php");

/**
/// WEBSOCK 
//$ret = event_socket_request($this->fp, "bgapi originate user/1000 &park()\n\n");
//$ret = event_socket_request($this->fp, "api show calls\n\n");
$uuid = event_socket_request($this->fp, "api create_uuid\n\n");
$uuid = str_replace("\n","",$uuid);
$ret = event_socket_request($this->fp, "bgapi originate [origination_uuid=$uuid]user/1000 &park()\n\n");
echo "\n$uuid\n";
**/





class fdlESL {
	
	protected $fp;

	
	public function originateTwoBis($dest1, $uuid2) {
		$this->doReq("bgapi originate $dest1 &bridge $uuid2");
	}
	
	public function originateTwo($dest1, $dest2) {
		$this->doReq("bgapi originate $dest1 &bridge($dest2)");
	}
	
	public function originate($dest) {
		$uuid = $this->getUUID();
		$this->doReq("bgapi originate [origination_uuid=$uuid]$dest &park()\n\n");
		return($uuid);		
	}

	public function bridge($uuid_a, $uuid_b) {
		$this->doReq("bgapi uuid_bridge $uuid_a $uuid_b\n\n");
	}

	public function getUUID() {
		$uuid = $this->doReq("api create_uuid\n\n");
		$uuid = str_replace("\n","",$uuid);
		return($uuid);
	}
	
	public function doReq($cmd) {
		echo "executing cmd: $cmd\n";
		
		if ($this->fp) {    
		    fputs($this->fp, $cmd."\n\n");    
		    usleep(100); //allow time for reponse
		     
		    $response = "";
		    $i = 0;
		    $contentlength = 0;
		    while (!feof($this->fp)) {
		       $buffer = fgets($this->fp, 4096);
		       
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

    function __construct() {
		$this->fp = @fsockopen(FS_HOST, FS_PORT, $errNo, $errDescr);
		if (!$this->fp) {	
			echo "ERROR: $errNo - $errDescr";
			$this->fp=false;
		}

		socket_set_blocking($this->fp,false);

		if ($this->fp) {
			while (!feof($this->fp)) {
				$buffer = fgets($this->fp, 1024);
				usleep(100); //allow time for reponse
				if (trim($buffer) == "Content-Type: auth/request") {
					// echo "sending AUTH " . FS_PWD . "\n";
					fputs($this->fp, "AUTH " . FS_PWD . "\n\n");
					break;
				}
			}
		} else
			$this->fp=false;
    }

    function __destruct() {
        fclose($this->fp);  
    }
	
	
}







$esl = new fdlESL();
$uuid_a = $esl->originate("user/1006");
$esl->originateTwoBis("sofia/gateway/messagenet/0656569224", $uuid_a);
/**
$uuid_a = $esl->originate("sofia/gateway/messagenet/0656569224");

usleep(5000000);
$esl->bridge($uuid_a, $uuid_b);
**/