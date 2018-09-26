#!/usr/bin/php

<?php

define("FS_PWD"			,	"ClueCon");
define("FS_HOST"		,	"127.0.0.1");
define("FS_PORT"		,	"8021");

class ESL {
	
	public function fsCommand($cmd) {

		dbg(1,"Sending command: " . $cmd);
		
		if ((@$fp = $this->event_socket_create())==false) {
			dbg(9,"Unable to create socket: [" . $this->socketErrNum . "] " . $this->socketErrDescr);
			return(false);
		}

		// $cmd = "api help";
		$response = $this->event_socket_request($fp, $cmd);
		fclose($fp);  
		
		return($response);
		
	}    
    
    ////////////////////////////// FS SOCKETS
    
	protected function event_socket_create() {
		
		$fp = @fsockopen(FS_HOST, FS_PORT, $errNo, $errDescr);
		if (!$fp) {	
			$this->socketErrNum = $errNo;
			$this->socketErrDescr = $errDescr;
			return(false);
		}

		socket_set_blocking($fp,false);

		if ($fp) {
			while (!feof($fp)) {
				$buffer = fgets($fp, 1024);
				usleep(100); //allow time for reponse
				if (trim($buffer) == "Content-Type: auth/request") {
					fputs($fp, "auth " . FS_PWD . "\n\n");
					break;
				}
			}
			return $fp;
		}	else {
			return false;
		}           
	}
 
	protected function event_socket_request($fp, $cmd) {
		
		$allstuff = "";
	    
	    if ($fp) {    
	        fputs($fp, $cmd."\n\n");    
	        usleep(100); //allow time for reponse
	         
	        $response = "";
	        $i = 0;
	        $contentlength = 0;
	        while (!feof($fp)) {
	           $buffer = fgets($fp, 4096);
	           $allstuff .= $buffer;
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
	        //return($allstuff);
	    }
	    else {
	      echo "no handle";
	    }
	}
	
	////////////////////////////// CALL MON SOCKETS
	
}

function dbg($lev, $msg)	{
	echo "$msg\n";
}

$cmd = "bgapi originate user/1000 &bridge(sofia/gateway/messagenet/0656569224)";

system('clear');
$esl = new ESL();
echo($esl->fsCommand("$cmd"));


