#!/usr/bin/php

<?php
require_once("./assets/php/config.php");
require_once("./assets/php/fdl.php");

$host = 'localhost'; //host
$port = '9000'; //port
$null = NULL; //null var

/// WEBSOCK 

system('clear');

if ((@$fp = event_socket_create())==false) {
	exit;
}

// fputs($fp, "event json all\n\n");
$wild = '{"Event-Name":';

//$req = "CHANNEL_ANSWER CHANNEL_HANGUP CHANNEL_PROGRESS CHANNEL_PROGRESS_MEDIA CHANNEL_HOLD CHANNEL_UNHOLD";
/**
$req = "CHANNEL_ANSWER CHANNEL_APPLICATION CHANNEL_BRIDGE CHANNEL_CALLSTATE CHANNEL_CREATE CHANNEL_DATA CHANNEL_DESTROY CHANNEL_EXECUTE CHANNEL_EXECUTE_COMPLETE CHANNEL_GLOBAL CHANNEL_HANGUP CHANNEL_HANGUP_COMPLETE CHANNEL_HOLD CHANNEL_ORIGINATE CHANNEL_OUTGOING CHANNEL_PARK CHANNEL_PROGRESS CHANNEL_PROGRESS_MEDIA CHANNEL_STATE CHANNEL_UNBRIDGE CHANNEL_UNHOLD CHANNEL_UNPARK CHANNEL_UUID";
**/

$req = "CHANNEL_ANSWER CHANNEL_BRIDGE CHANNEL_CREATE CHANNEL_HANGUP CHANNEL_HOLD CHANNEL_ORIGINATE CHANNEL_OUTGOING  CHANNEL_PROGRESS";



fputs($fp, "events json $req\n\n");


$tOld = gmdate("d/m/Y H:i:s");

$evtNum = 0;

$opExt = ["1000"];
$recDir = "/recordings/";
$scriptExt = "9111";

$dtCalls = [];
$opCalls = [];
$inCalls = [];

$tOld = "";

define("CGREEN",	"#23ff23");
define("CGREY",		"#c0c0c0");
define("CYELLOW",	"#ffff00");
define("CRED",		"#ff0000");
define("CBLUE",		"#76c0ff");

while (true) {

/////////////////////////// THE REAL STUFF
	$tNow = gmdate("d/m/Y H:i:s");

	if ($tNow != $tOld) {
/***
		broadcast([
			"type" 	=>	"heartbeat"
		, 	"ts" 	=>	time(getTimeInItaly())
		,	"time"	=>	getTimeInItaly()
		,	"calls"	=>	$calls
		]);
		$tOld = $tNow;
***/		
		// bgapi uuid_broadcast 8766f8a9-7577-4ee1-a83b-12eb17883e46 /usr/share/freeswitch/sounds/t3/EN_TIME_ENDING.wav aleg		
		// bgapi uuid_kill 8766f8a9-7577-4ee1-a83b-12eb17883e46
		foreach($dtCalls as $k => $v) {
			$wt = getVal($v, "warnTime");
			if ($wt!="") {
				$wt = ($wt);
				if ($wt < time()) {
					echo "\n--- Sending timeout warning to $k\n";
					$cmd = "bgapi uuid_broadcast $k /usr/share/freeswitch/sounds/t3/EN_TIME_ENDING.wav aleg";
					$dtCalls[$k]["warnTime"]="";
					fputs($fp, "$cmd\n\n");
				}
			}
			$kt = getVal($v, "dieTime");
			if ($kt!="") {
				$kt = intval($kt);
				if ($kt < time()) {
					echo "\n--- Hanging up  $k\n";
					$cmd = "bgapi uuid_kill $k";
					$dtCalls[$k]["dieTime"]="";
					fputs($fp, "$cmd\n\n");
				}
			}
			
			
			
		}
	}


	if (!feof($fp)) {
		$buffer = fgets($fp) ; // , 256);
		if (strlen($buffer) > 0) {
			if (substr($buffer,0,strlen($wild)) == $wild)  {
				$buffer = substr($buffer,0,strpos($buffer,"}") + 1);
				$data = json_decode($buffer,true);
				if(sizeof($data)>0) {
					$evtNum++;
					$uid = getVal($data, "Unique-ID");
					$cid = getVal($data, "Channel-Call-UUID");
    				$ext = getVal($data, "Caller-Username");
        			$stt = getVal($data, "Channel-State");
        			$num = getVal($data, "Caller-Destination-Number");
					$evt = getVal($data, "Event-Name");
					$ans = getVal($data, "Answer-State");
					$oid = getVal($data, "Other-Leg-Unique-ID");
					$uia = getVal($data, "variable_UUIDLegA");
					$det = getVal($data, "variable_dettId");
					$int = getVal($data, "variable_caller");
					
 					echo "**EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";


////////////////////////////////////////////////////////
/// INCOMING
////////////////////////////////////////////////////////
					
					if($evt=="CHANNEL_CREATE" && $det=="" && $uia=="" && in_array($num, $opExt)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						$inCall = [
							"callUID"	=>	$cid
						,	"tmStart" 	=> 	time()
						,	"bnum"		=>	$ext		// CALLER
						,	"opExt"		=>	$num
						];	
						
						
						$inCalls[$cid] = $inCall;
						announce($ddd, "incomming ringing");
						// print_r ($inCalls[$cid]);
						$msg = [
							"uid"		=>	$cid
						,	"org"		=>	$ext
						,	"orgDescr"	=>	"Chiamata Entrante"
						,	"dst"		=>	$num
						,	"dstDescr"	=>	"Posto Operatore"
						,	"blink"		=>	1
						,	"bgcol"		=>	CYELLOW
						,	"hangup"	=>	false
						];
						sendCallMsg($msg);
						
					} 
					
					if ($evt=="CHANNEL_ANSWER" && array_key_exists($cid, $inCalls)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						echo "\n** Op Answers incoming\n";
						// print_r ($inCalls[$cid]);
						$msg = [
							"uid"		=>	$cid
						,	"evt"		=>	"INDETT_ANSWERED"
						,	"blink"		=>	0
						,	"bgcol"		=>	CGREEN
						,	"hangup"	=>	false
						];
						sendCallMsg($msg);
					}

					
					

					if($evt=="CHANNEL_BRIDGE" && array_key_exists($uid, $inCalls) && array_key_exists($oid, $dtCalls)) {
						$dtCall = [
							"dettUID"	=>	$uid
						,	"dettId"	=>	""
						,	"opExt"		=>	""
						,	"detExt"	=>	$int
						,	"bnum"		=>	$num
						];
						$dtCalls[$uid] = $dtCall;
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						announce($ddd, "Op transfers to dett,start timing");
						$msg =[
							"uid"		=>	$uid
						,	"org"		=>	$num
						,	"orgDescr"	=>	"Trasferita da P.O."
						,	"dst"		=>	$int
						,	"dstDescr"	=>	"Interno Detenuti"
						,	"blink"		=>	0
						,	"bgcol"		=>	CGREEN
						,	"hangup"	=>	false
						];
						sendCallMsg($msg);
					}
					

					if($evt=="CHANNEL_HANGUP" && array_key_exists($uid, $inCalls)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						announce($ddd, "Op hangs up on incoming");
						// print_r($inCalls[$uid]);
						unset($inCalls[$uid]);
						$msg = [
							"uid"		=>	$uid
						,	"bgcol"		=>	CGREY
						,	"blink"		=>	0
						,	"hangup"	=>	true
						];
						sendCallMsg($msg);
					}
					
					////////////////////////////////////////////////////////
/// NORMAL CALLS DIRECTLY BY DETT
////////////////////////////////////////////////////////

					if($evt=="CHANNEL_CREATE" && $det=="" && $uia!="" && $num==$scriptExt ) {
						/**
						det:    
						uid:832af8cf-557f-4b45-8297-b948af6ea364        
						uia:    CID:832af8cf-557f-4b45-8297-b948af6ea364        
						OID:    
						STT:CS_INIT     
						EXT:1005        
						NUM:9111
						*/
						$msg = [
							"boxId"		=>	$uia
						,	"org"		=>	"Interno $ext"
						,	"orgDescr"	=>	"Tentativo Chiamata Detenuto"
						,	"dst"		=>	""
						,	"dstDescr"	=>	""
						
						,	"bgcol"		=>	CYELLOW
						,	"blink"		=>	false
						
						,	"tmBeg"		=>	time(getTimeInItaly())
						
						];
					
					}



					
					if($evt == "CHANNEL_CREATE"  && $det!="" && $uia!="" &&  !in_array($num, $opExt )) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						$dtCall = [
							"dettUID"	=>	$uia
						,	"dettId"	=>	$det
						,	"opExt"		=>	""
						,	"detExt"	=>	$int
						,	"bnum"		=>	$num
						];

						$dtCalls[$uia] = $dtCall;
						announce($ddd, "dett direct call");
						// print_r($dtCalls[$uia]);

						
						$msg =[
							"boxId"		=>	$uia
						,	"org"		=>	"Interno : $int - W.I.P"
						,	"orgDescr"	=>	"WIP WIP WIP WIP WIP WIP"
						,	"dst"		=>	$num
						,	"dstDescr"	=>	"WIP WIP WIP WIP WIP WIP"
						,	"blink"		=>	1
						,	"bgcol"		=>	CYELLOW
						];
						sendCallMsg($msg);
						
/**
						echo "\n****************************** DATA BEG **********************************************************\n";
						print_r($data);
						echo "\n****************************** DATA END **********************************************************\n";
**/						
					}					
					
					if($evt =="CHANNEL_ANSWER" && $det!="" && $uia!="" && !in_array($num, $opExt )) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						$dtCalls[$uia]["tmStart"] = time();
						announce($ddd, "dett call Answerd");
						// print_r($dtCalls[$uia]);
						$msg =[
							"uid"		=>	$uia
						,	"evt"		=>	"ANSWER_GREEN"
						,	"blink"		=>	0
						,	"bgcol"		=>	CGREEN
						];
						sendCallMsg($msg);
						
					}

////////////////////////////////////////////////////////
/// CALLS VIA OP
////////////////////////////////////////////////////////
					

					if($evt == "CHANNEL_CREATE" && $uia!="" && $det!="" &&  in_array($num, $opExt )) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						$dtCall = [
							"dettUID"	=>	$uia
						,	"dettId"	=>	$det
						,	"opExt"		=>	$num
						,	"detExt"	=>	$int
						];
						$dtCalls[$uia] = $dtCall;
						announce($ddd, "incoming from dett");
						$msg =[
							"uid"		=>	$uia
						,	"evt"		=>	"DET_TO_OP_RING"
						,	"org"		=>	"Interno : $int - W.I.P"
						,	"orgDescr"	=>	"WIP WIP WIP WIP WIP WIP"
						,	"dst"		=>	$num
						,	"dstDescr"	=>	"Posto Operatore"
						,	"blink"		=>	1
						,	"bgcol"		=>	CYELLOW
						];
						sendCallMsg($msg);
						// print_r($dtCalls[$uia]);
					}

					// **EVT:CHANNEL_ANSWER    
					// det:1   
					// uid:0dea238e-d425-481b-a09b-348067629d05        
					// uia:4b334435-2fbe-4d6a-870e-0a6cce42e3c2        
					// CID:0dea238e-d425-481b-a09b-348067629d05        
					// OID:    
					// STT:CS_CONSUME_MEDIA    
					// EXT:    
					// NUM:1000        
					// ANS:answered

					if ($evt=="CHANNEL_ANSWER" && $uia!="" && $det!="" && in_array($num, $opExt)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						announce($ddd, "op answers dett");
						// print_r($dtCalls[$uia]);
						$msg =[
							"uid"		=>	$uia
						,	"evt"		=>	"OP_ANSWERS_DET"
						,	"blink"		=>	0
						,	"bgcol"		=>	CGREEN
						];
						sendCallMsg($msg);
					}
					
					if ($evt == "CHANNEL_HOLD" && $uia!="" && array_key_exists($uia, $dtCalls)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						announce($ddd, "Dett put on hold");
						$msg =[
							"uid"		=>	$uia
						,	"evt"		=>	"HOLD"
						,	"blink"		=>	0
						,	"bgcol"		=>	CBLUE
						];
						sendCallMsg($msg);
						// print_r($dtCalls[$uia]);
					}
						
					if ($evt == "CHANNEL_ORIGINATE" && in_array($ext, $opExt)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						$opCall = [
							"opExt"		=>	$ext
						,	"bnum"		=>	$num
						,	"opId"		=>	$cid
						,	"outId"		=>	$uid							
						,	"tmOrig"	=>	time()
						];
						$opCalls[$uid] = $opCall;
						announce($ddd, "Op dials");
						// print_r($opCalls[$uid] );
						$msg =[
							"uid"		=>	$uid
						,	"evt"		=>	"EXT_CALLING"
						,	"org"		=>	"Interno : $int - W.I.P"
						,	"orgDescr"	=>	"WIP WIP WIP WIP WIP WIP"
						,	"dst"		=>	$num
						,	"dstDescr"	=>	"Posto Operatore"
						,	"blink"		=>	1
						,	"bgcol"		=>	CYELLOW
						];
						sendCallMsg($msg);
						
					}

					
					if($evt == "CHANNEL_ANSWER" && $oid!="" && array_key_exists($uid,$opCalls)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						$opCalls[$uid]["tmAns"] = time();
						announce($ddd, "external answers");
						$msg =[
							"uid"		=>	$uid
						,	"evt"		=>	"EXT_RING"
						,	"org"		=>	"Interno : $int - W.I.P"
						,	"orgDescr"	=>	"WIP WIP WIP WIP WIP WIP"
						,	"dst"		=>	$num
						,	"dstDescr"	=>	"Posto Operatore"
						,	"blink"		=>	1
						,	"bgcol"		=>	CYELLOW
						];					
						sendCallMsg($msg);
					}

					if($evt == "CHANNEL_BRIDGE" && array_key_exists($uid,$dtCalls) && array_key_exists($oid,$opCalls)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						$dtCalls[$uid]["tmTrans"] = time();
						$dtCalls[$uid]["opCallId"] = $oid;
						
						
						// 	have to calculate how much time left he has, including time already use from:
						//	$OpCall[$oid]["tmAns"] to time() (now)
						// calculate the tariff, set timers, etc..
						$dtCalls[$uid]["warnTime"] 	=  time() + 10;
						$dtCalls[$uid]["dieTime"] 	= 	time() + 20;
						
						announce($ddd, "ext transfeed to dett");
						print_r($dtCalls[$uid]);
						print_r($opCalls[$dtCalls[$uid]["opCallId"]]);
						
						// start recording ..
						$recFileName = "$recDir$uid.wav";
						echo "\n--- Start recording to file $recFileName\n";
						$cmd = "bgapi uuid_record $uid start $recFileName";
						fputs($fp, "$cmd\n\n");

						$msg =[
							"uid"		=>	$uid
						,	"evt"		=>	"EXT_RING"
						,	"org"		=>	"Interno : $int - W.I.P"
						,	"orgDescr"	=>	"WIP WIP WIP WIP WIP WIP"
						,	"dst"		=>	$num
						,	"dstDescr"	=>	"Posto Operatore"
						,	"blink"		=>	1
						,	"bgcol"		=>	CYELLOW
						];					
						sendCallMsg($msg);
					}

				
////////////////////////////////////////////////////////
/// HANGUPS
////////////////////////////////////////////////////////
					
					if($evt == "CHANNEL_HANGUP" && array_key_exists($uid,$dtCalls)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";

						/**
						foreach($dtCalls as $k=>$v)
						// bill, etc ...
						// hangup $dtCalls[$uid]
						// hangup $opcalls[$oid]
						**/
						$dtCalls[$uid]["tmEnd"] = time();
						announce($ddd, "hangup Dett");
						// print_r($dtCalls[$uid]);
						if ($dtCalls[$uid]["opExt"]!="")	{
							announce($ddd, "WIP  - MUST DO BILLING HERE");
						}
						$msg =[
							"uid"		=>	$uid
						,	"evt"		=>	"HANGUP_DET"
						,	"blink"		=>	0
						,	"hangup"	=>	1
						,	"bgcol"		=>	CGREY
						];							
						sendCallMsg($msg);
						unset($dtCalls[$uid]);
					}

					if($evt == "CHANNEL_HANGUP" && array_key_exists($uid,$opCalls)) {
						$ddd = "EVT:$evt\tdet:$det\tuid:$uid\tuia:$uia\tCID:$cid\tOID:$oid\tSTT:$stt\tEXT:$ext\tNUM:$num\n";
						// bill, etc ...
						// hangup $dtCalls[$uid]
						// hangup $opcalls[$oid]
						announce($ddd, "hangup Op");
						print_r($opCalls[$uid]);
						unset($opCalls[$uid]);
					}
				} 
			}
			
		}
	}

}
fclose($fp);  

function sendCallMsg($msg) {
	$msg["type"]	= "calldata";
	$msg["ts"] 		= time(getTimeInItaly());
	$msg["time"]	= getTimeInItaly();
	echo "\n--------------------- MSG \n";
	print_r($msg);
	
}

function announce($ddd, $s) {
	echo "\n=================================================================================\n";
	echo "$ddd\n";
	echo strtoupper($s) . "\n";
	
}

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


/**
**/    