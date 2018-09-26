#!/usr/bin/php

<?php

require_once("./assets/php/config.php");

define("SHOW_EV",	true);

// define ("CALL_MON_PORT", 9999);

define("DBG_LEV",	1);

require_once("./assets/php/config.php");

define("EVT_REQ", "CHANNEL_ANSWER CHANNEL_BRIDGE CHANNEL_CREATE CHANNEL_HANGUP CHANNEL_HOLD CHANNEL_ORIGINATE");

function dbg($lev, $s) {
	if ($lev < DBG_LEV)	return;
	if (is_array($s))		print_r ($s);
	else					echo $s;
	echo "\n";
}




class CallMonSrv {
	
	public function mainLoop() {
	
		if (!($fp = $this->event_socket_create())) 	return(false);
		fputs($fp, "events text " . EVT_REQ ."\n\n");

		while(true) {
			
			
			while (!feof($fp)) {
				
				$buffer = fgets($fp) ; // , 256);
				if (strlen($buffer) > 4) {
					echo $buffer;
					
				}
			}
				
		}		
	}
	

	
	protected function eventHandle($ed){

		
		if(SHOW_EV) $this->evtDettDump($ed);		
		// DET DIRECT

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
	

	
}

system('clear');

echo "\n==========================================================================================================================\n";
echo "\n==========================================================================================================================\n";

$cm = new CallMonSrv();
if(!$cm->mainLoop())	exit;


