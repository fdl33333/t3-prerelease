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

$stsWatch = ["CS_CONSUME_MEDIA","CS_EXCHANGE_MEDIA", "CS_HANGUP" ];
// fputs($fp, "event json channel_state channel_answer\n\n");
fputs($fp, "events json CHANNEL_ANSWER CHANNEL_HANGUP CHANNEL_PROGRESS CHANNEL_PROGRESS_MEDIA\n\n");
$wild = '{"Event-Name":';

$calls = [];

$tOld = gmdate("d/m/Y H:i:s");

while (true) {

	$changed = $clients;
	socket_select($changed, $null, $null, 0, 10);

	if (in_array($socket, $changed)) {		// NEW CONNECION
		$socket_new = socket_accept($socket); 
		$clients[] = $socket_new; 
		$header = socket_read($socket_new, 1024); 
		perform_handshaking($header, $socket_new, $host, $port);
		socket_getpeername($socket_new, $ip); 		broadcast(["type" => "system", "message"=>$ip." Connected"]);
		echo "$ip connected\n";
		$found_socket = array_search($socket, $changed);
		unset($changed[$found_socket]);
	}
	
	foreach ($changed as $changed_socket) {	
		
		while(socket_recv($changed_socket, $buf, 1024, 0) >= 1) {
			$txtIn = unmask($buf); 
			echo "received : $txtIn\n";
			$msgIn = json_decode($txtIn, true); 
			// handle message somehow .. todo!
			switch($msgIn["msg"]) {
				case "HANGUP" :
					fputs($fp, "api uuid_kill " . $msgIn["uid"] . "\n\n");
					break;

				case "SPY" : 
					$ret = $t3->spy($msgIn);
					echo json_encode($ret) ."\n";
				
				
//					fputs($fp, "api originate {sip_secure_media=true}user/" . $msgIn["ext"] . " &eavesdrop(" . $msgIn["uid"] . ")\n\n");
					break;
				
				default :
					echo "** Unknown message type " . $msgIn["msg"] . "\n";
				    break;
			}
			
			break 2; 
		}
		
		$buf = @socket_read($changed_socket, 1024, PHP_NORMAL_READ);
		if ($buf === false) { 
			$found_socket = array_search($changed_socket, $clients);
			socket_getpeername($changed_socket, $ip);
			unset($clients[$found_socket]);
			broadcast(["type" => "system", "message"=>$ip." disconnected"]);
			echo "$ip disconnected\n";
		}
	}

	$tNow = gmdate("d/m/Y H:i:s");
	if ($tNow != $tOld) {
		broadcast([
			"type" 	=>	"heartbeat"
		, 	"ts" 	=>	time(getTimeInItaly())
		,	"time"	=>	getTimeInItaly()
		]);
		$tOld = $tNow;
	}


/////////////////////////// THE REAL STUFF

	if (!feof($fp)) {
		$buffer = fgets($fp) ; // , 256);
	   	if (strlen($buffer) > 0) {
			if (substr($buffer,0,strlen($wild)) == $wild)  {
				$buffer = substr($buffer,0,strpos($buffer,"}") + 1);
				$data = json_decode($buffer,true);

				// print_r($data);
				if (($t3Id = getVal($data,"variable_t3Id"))!="") {
					$event = getVal($data,"Event-Name");
					echo "t3id\t$t3Id\n";
					echo "evebt\t$event\n\n";
					$sql = "SELECT 
								r.t3Id
							,	c.serial card
							,	r.ext		
							,	CONCAT(d.lname,', ',d.fname) dett
							,	r.dialedNum num
							,	CASE r.callTip
									WHEN 'N' THEN 'Norm'
									WHEN 'A' THEN 'Avv'
									WHEN 'S'	THEN 'Supp'
									WHEN 'X' THEN 'Stra'
								END tip
							,	r.secsGrace grace
							,	w.descr   dest
							FROM callrec r
							LEFT JOIN dett d 	ON d.dettId = r.dettId
							LEFT JOIN card c 	ON c.cardId = r.cardId
							LEFT JOIN wl   w 	ON w.wlId = r.wlId
							WHERE r.t3Id = '$t3Id'";
					$rows=$my->myGetRows($sql);
					if ($rows===-1)	{
						echo "\n********************\nERROR:" . $my->getLastErr() . "\n********************\n";
					} elseif($rows===0)	{				
						echo "\n********************\nt3Id:$t3Id NOT FOUND in DB\n********************\n";
					} else {
						$msg = $rows[0];
						$msg["evt"] = $event;
						$msg["type"] = "calldata";
						/**
						broadcast($msg);
						echo "\n============================================\n";
						print_r($msg);
						**/
					}
					
				}
			}				
	    }
	}

}
socket_close($socket);
fclose($fp);  


function dumpNumber($data) {
	return;
	foreach($data as $k=>$v) {
		if(strpos($v,"0692928424")!==false  || strpos($v,"1005")!==false )
			echo "\t$k -> $v\n";
	}
}
function broadcast($msg) {
	$msgMasked = mask(json_encode($msg));
	global $clients;
	foreach($clients as $changed_socket) {
		@socket_write($changed_socket,$msgMasked,strlen($msgMasked));
	}
	return true;
}

function unmask($text) {
	$length = ord($text[1]) & 127;
	if($length == 126) {
		$masks = substr($text, 4, 4);
		$data = substr($text, 8);
	}
	elseif($length == 127) {
		$masks = substr($text, 10, 4);
		$data = substr($text, 14);
	}
	else {
		$masks = substr($text, 2, 4);
		$data = substr($text, 6);
	}
	$text = "";
	for ($i = 0; $i < strlen($data); ++$i) {
		$text .= $data[$i] ^ $masks[$i%4];
	}
	return $text;
}

function mask($text) {
	$b1 = 0x80 | (0x1 & 0x0f);
	$length = strlen($text);
	
	if($length <= 125)
		$header = pack('CC', $b1, $length);
	elseif($length > 125 && $length < 65536)
		$header = pack('CCn', $b1, 126, $length);
	elseif($length >= 65536)
		$header = pack('CCNN', $b1, 127, $length);
	return $header.$text;
}

function perform_handshaking($receved_header,$client_conn, $host, $port) {
	$headers = array();
	$lines = preg_split("/\r\n/", $receved_header);
	foreach($lines as $line)
	{
		$line = chop($line);
		if(preg_match('/\A(\S+): (.*)\z/', $line, $matches))
		{
			$headers[$matches[1]] = $matches[2];
		}
	}
	$secKey = $headers['Sec-WebSocket-Key'];
	$secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
	//hand shaking header
	$upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
	"Upgrade: websocket\r\n" .
	"Connection: Upgrade\r\n" .
	"WebSocket-Origin: $host\r\n" .
	"WebSocket-Location: ws://$host:$port/demo/shout.php\r\n".
	"Sec-WebSocket-Accept:$secAccept\r\n\r\n";
	socket_write($client_conn,$upgrade,strlen($upgrade));
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


