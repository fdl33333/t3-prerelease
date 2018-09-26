<?php

define("SECS_PER_DAY", 86400);

define("SCRAMBLE_NORM",	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
define("SCRAMBLE_SCRM", "vUKlf4PJx9FsuETmYtcM5zRqL0w2SAe7hp6NbBoHInD8yVZja1GkgirCdQO3XW");
function charset_base_convert ($numstring, $fromcharset, $tocharset) {
	$frombase=strlen($fromcharset);
	$tobase=strlen($tocharset);
	$chars = $fromcharset;
	$tostring = $tocharset;

	$length = strlen($numstring);
	$result = '';
	for ($i = 0; $i < $length; $i++) {
			$number[$i] = strpos($chars, $numstring{$i});
	}
	do {
		$divide = 0;
		$newlen = 0;
		for ($i = 0; $i < $length; $i++) {
			$divide = $divide * $frombase + $number[$i];
			if ($divide >= $tobase) {
				$number[$newlen++] = (int)($divide / $tobase);
				$divide = $divide % $tobase;
			} elseif ($newlen > 0) {
				$number[$newlen++] = 0;
			}
		}
		$length = $newlen;
		$result = $tostring{$divide} . $result;
	}
	while ($newlen != 0);
	return $result;
}

function getItalianMonth($mm) {
    switch(intval($mm)) {
		case  1 : 	return("Gennaio");
		case  2 : 	return("Febbraio");
		case  3 : 	return("Marzo");
		case  4 : 	return("Aprile");
		case  5 : 	return("Maggio");
		case  6 : 	return("Giugno");
		case  7 : 	return("Luglio");
		case  8 : 	return("Agosto");
		case  9 : 	return("Settembre");
		case 10 : 	return("Ottobre");
		case 11 : 	return("Novembre");
		case 12 : 	return("Dicembre");
		default	: 	return("invalid Month $mm");
	}	
}

function akScramble($akNorm) {
	$akScram = "";	
	for ($i=0; $i<strlen($akNorm); $i++) {
		$p=strpos(SCRAMBLE_NORM,$akNorm[$i]);
		$akScram .=  SCRAMBLE_SCRM[$p];
	}	
	return($akScram);
}


function akUnscramble($akScram) {
	$akNorm = "";	
	for ($i=0; $i<strlen($akScram); $i++) {
		$p=strpos(SCRAMBLE_SCRM,$akScram[$i]);
		$akNorm .=  SCRAMBLE_NORM[$p];
	}	
	return($akNorm);
	
}


function dropVTPfx($id) {
			
	$p = stripos($id, "x");
	if ($p!==false)
		$id = substr($id, $p+1);
	return($id);
	
}

function allOK() {
	return(["status"=>STATUS_OK]);
	
}

function quickQuery ($dbType, $sql, $errOnEmpty = "", $rowsName = "data" )  {
	if ($dbType != DB_TEST && $dbType != DB_REAL)
		return($this->basicErr("dbType not properly specified!"));
		
	if ($dbType == DB_TEST)
		$my = new mySqliDb(MY_SRV, MY_USR, MY_PWD, MY_DB) ;
	else
		$my = new mySqliDb(VTREAL_SRV, VTREAL_USR, VTREAL_PWD, VTREAL_DB) ;
	
	$rows = $my->myGetRows($sql);
	if ($rows === -1)
		return($this->basicErr($my->getLastErr()));
		
	if ($rows === 0) {
		if ($errOnEmpty!="")
			return($this->basicErr($errOnEmpty));
		else
			$rows = [];
	}
	
	return([
		"status"	=>	STATUS_OK
	,	$rowsName	=>	$rows
	]);
}


function proper($s) {
	return(ucfirst(strtolower($s)));
}

function getTimeInItaly ()  {
	$date = new DateTime('now');
	$date->setTimezone(new DateTimeZone("Europe/Rome"));
	return($date->format("Y-m-d H:i:s"));

}

function prepRet($s) {
    $rep = json_encode($s);
    return($rep);
}


function basicErr($s) {
    genLog("**$s");
    return(["status"=>STATUS_ERROR, "errMsg" => $s]);
}

 // fix week day
 
 function fixWD ($dd) {
    return ((intval(date('w', $dd)) +6) % 7);
 }
 

$SK_CYPHER =array("J7","49","MY","6F","PQ","6U","8A","M9","N3","35");


function genLog( $s)   {
	// return;
	
	
    $dt = gmdate('Y-m-d');
    $fname = LOGDIR . "/" . LOGPFX . "$dt.log";
    $ip = getVal($_SERVER, "REMOTE_ADDR", "No REMOTE_ADDR");
    $data = sprintf("%s\t%s\t%s\n", gmdate('Y-m-d H:i:s'), $ip,  $s);
    file_put_contents($fname, $data, FILE_APPEND);
}

function kmFromRome($lat, $lng) {
    /**
    * Coordinates of Rome in decimal degrees
    Latitude: 41.8919300    
    Longitude: 12.5113300
    */
    return(distance($lat, $lng, 41.89193, 12.51133));
    
}

function jEnc ($data) {
    $jstr = json_encode($data);        
    $key  = MAGICKEY;
    $encrypted = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $jstr, MCRYPT_MODE_CBC, md5(md5($key))));
    return($encrypted);
}

function jDec ($encrypted) {
    $key  = MAGICKEY;
    $decrypted = rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5($key), base64_decode($encrypted), MCRYPT_MODE_CBC, md5(md5($key))), "\0");
    $data = json_decode($decrypted, true);
    return($data);
}

function distance($lat1, $lng1, $lat2, $lng2, $unit = "K") {

    $theta = $lng1 - $lng2;
    $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist = acos($dist);
    $dist = rad2deg($dist);
    $miles = $dist * 60 * 1.1515;
    $unit = strtoupper($unit);

    if ($unit == "K") {
        return ($miles * 1.609344);
    } else if ($unit == "N") {
        return ($miles * 0.8684);
    } else {
        return $miles;
    }
}

function getVal($main, $sub, $default="") {
    return( isset($main[$sub])  ?   $main[$sub] : $default);
}

function b62enc($s) {
    $b = new base62();
    $ret = @($b->encode($s));
    return($ret);
}

function b62dec($s) {
    $b = new base62();
    $ret = @($b->decode($s));
    return($ret);
}
   

class base62 { 
    static $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    static $base = 62;

    public function encode($var) {
        $stack = array();
        while (bccomp($var, 0) != 0) {
            $remainder = bcmod($var, self::$base);
            $var = bcdiv( bcsub($var, $remainder), self::$base );

            array_push($stack, self::$characters[$remainder]);
        }
        return implode('', array_reverse($stack));
    }

    public function decode($var)  {
        $length = strlen($var);
        $result = 0;
        for($i=0; $i < $length; $i++) {
            $result = bcadd($result, bcmul(self::get_digit($var[$i]), bcpow(self::$base, ($length-($i+1)))));
        }
        return $result;
    }

    private function get_digit($var)  {
        if(ereg('[0-9]', $var))  {
            return (int)(ord($var) - ord('0'));
        }   else if(ereg('[A-Z]', $var)) {
            return (int)(ord($var) - ord('A') + 10);
        }   else if(ereg('[a-z]', $var)) {
            return (int)(ord($var) - ord('a') + 36);
        }  else {
            return $var;
        }
    }
    
}

    
function getCurrentUrlPath($strip = true) {
    // filter function
    static $filter;
    if ($filter == null) {
        $filter = function($input) use($strip) {
            $input = str_ireplace(array(
                "\0", '%00', "\x0a", '%0a', "\x1a", '%1a'), '', urldecode($input));
            if ($strip) {
                $input = strip_tags($input);
            }
            // or any encoding you use instead of utf-8
            $input = htmlspecialchars($input, ENT_QUOTES, 'utf-8'); 
            return trim($input);
        };
    }

   $cp = 'http'. (($_SERVER['SERVER_PORT'] == '443') ? 's' : '')
        .'://'. $_SERVER['SERVER_NAME'] . ':' . $_SERVER['SERVER_PORT'] .  $filter($_SERVER['REQUEST_URI']);
        
        
    for($p=strlen($cp)-1; $p>0; $p--) {
        if (substr($cp,$p,1)=="/") break;
    }
    
    return(substr($cp,0,$p+1));
}


function ifIsSet($r, $default = "") {
    if (isset($r))      return($r);
    return($default);
}

function getKeyVal ($arr, $key, $default) {
    if(array_key_exists($key, $arr)) 
        return($arr[$key]);                
    return($default);
}


function doCURLRequest ($url, $api_request_parameters, $method_name = "POST", $debug = false, $headers = false) {

    
    if ($debug) {
        echo "\n=== REQUEST =====================================================\n";
        print_r ($api_request_parameters);
    }
                    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    $HTTPQuery =  http_build_query($api_request_parameters);
        
    if ($method_name == "GET") {
        $url .= '?' . $HTTPQuery;
    } else {        
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $HTTPQuery);
    }
    if ($headers!== false)
    	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    else
    	curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json'));
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, TRUE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $api_response = curl_exec($ch);
    $error_no = curl_errno($ch);
    $api_response_info = curl_getinfo($ch);
    if (curl_error($ch)!="") {
        $json = array("success" =>0, "error" => array("message" => curl_error($ch)));
        curl_close($ch);
        return($json);
    }
    if ( false && $debug) {
        echo    $api_response. "\n";        
        print_r ($api_response_info);        
        
    }

    
    curl_close($ch);
    $api_response_header = trim(substr($api_response, 0, $api_response_info['header_size']));
    $api_response_body = substr($api_response, $api_response_info['header_size']);
    $json = json_decode($api_response_body, true);
    if($json==null)
        parse_str($api_response_body, $json);
    
    if ($debug) {
        echo "\n=== RESPONSE =============================================\n";
        print_r($json);
    }
    
    if (!isset($json["success"]))
        $json["success"]=1;
        
    return($json);
}


function makeInsertSQL($table, $data, $replace = false) {
    if ($table!="") {
        if ($replace)   $sql = "REPLACE INTO $table ";    
        else            $sql = "INSERT INTO $table ";    
        $temp = "";
        foreach ($data as $k=>$v) {
            if($temp!="") $temp.=", ";
            $temp.=$k;        
        }
        $sql .= "\n($temp)\n";
    } 
    
    $temp = "";
    foreach ($data as $k=>$v) {
        if($temp!="") $temp.=", ";
        $v = fixForMy($v);
        $temp.="'$v'";        
    }
    if ($table!="")          $sql .= "VALUES\n";
    else                        $sql .= "\n, ";
    
    $sql .= "($temp)";
    return($sql);
}
    
function fixForMy($s) {
    $s = str_replace("\\", "\\\\", $s);
    $s = str_replace("'", "\\'", $s);
    return($s);
}
    
function doQ($conn, $sql, $exOnly = false) {
    
    
    if ($conn==null) {
        $conn = new mysqli(MY_SRV, MY_USR, MY_PWD, MY_DB);
        if (mysqli_connect_errno()) {
            logError( "*Connection failed: " . mysqli_connect_error() . "\nSRV:".MY_SRV." USR:".MY_USR." PWD:".MY_PWD." DB:".MY_DB);
            $json = array("status" => STATUS_ERROR, "msg" => "Technical Error (1)", "code" => 90 ); 
            return(json_encode($json));
            exit();
        }   
        $passedConn = false;
    } else
        $passedConn = true;
        

    
    if (!($res = $conn->query($sql))) {
        logError ("ERROR ".$conn->error)."\nSQL:\n". $sql;
        if (!$passedConn) $conn->close();
        return(false);
    }
    
    if((substr(strtoupper(trim($sql)),0,7)!="SELECT ") || $exOnly) {
        if (!$passedConn) $conn->close();
        return(true);
    }
        
    
    $ret = array();
    
    while($row = $res->fetch_assoc())
        $ret[] = $row;
    
    $res->close();

    if (!$passedConn) $conn->close();
    
    return($ret); 
}


function prep($s) {
    return(json_encode(utfEncodeArray($s)));        
}




function skEncrypt($c, $t) {
    global $SK_CYPHER;
    
    $t = zPad($t, 12);
    $c = zPad($c, 8);
    $j = $t.$c;
    $v="";
    // odd up
    for($i=0; $i<20; $i+=2) 
        $v.=substr($j, $i, 1);
    // even down
    for($i=19; $i>0; $i-=2)
        $v.=substr($j, $i, 1);
    // cyper
    $cyp="";
    for ($i=0; $i<20 ; $i++)
        $cyp .= $SK_CYPHER[intval(substr($v,$i,1))];

    return($cyp);    
   
}

function skDecrypt($y, &$c, &$t) {
    global $SK_CYPHER;

    $c = 0;
    $t = 0;
    // decyphered
    $v = "";
    for ($i=0; $i<40; $i+=2) {
        $b = substr($y, $i, 2);
        $p = array_search($b, $SK_CYPHER);
        $v.= $p;
    }
    // descramble
    $d = "";
    for ($i=0; $i<10; $i++) {
        $o = $i;
        $e = (20 - $i)  -1;
        $d .= substr($v, $o, 1) . substr($v, $e, 1);
    }
    $c  = intval(substr($d, 12, 8));
    $t  = intval(substr($d,  0, 12));

    return(true);    
}

function zPad($n,$q) {
    return (substr("00000000000000000000" . $n, -$q));    
}    

function utfEncodeArray($in) {
    return( dropMSMess($in));
}

function dropMSMess($in) {
    $out = array();
    foreach ($in as $k => $v) {
        if (is_array($v))        
            $out[$k] = dropMSMess($v);
        else {
            // $v =  htmlentities ($v);
            /**
            $v = utf8_encode ($v);
            **/
            $v = str_replace("&ldquo;", "\"", $v);
            $v = str_replace("&rdquo;", "\"", $v);
            $v = str_replace("&lsquo;", "'",  $v);
            $v = str_replace("&rsquo;", "'",  $v); 
            $v = str_replace("&mdash;", "-",  $v); 

            $out[$k] = $v; // htmlentities ($v); //utf8_encode($v);
        }
    }
    return($out);
}


function ping() {
    $rep = array(
        "status"    => STATUS_OK
    ,   "result"    => "PONG"
    );
    return($rep);
}

function dateTime() {
    $rep = array (
        "status"    => STATUS_OK
    ,   "result"    => gmdate("Y-m-d H:i:s")
    );
    return($rep);
}


/*********************

    
    if ($res = $mysqli->query("SELECT first_name FROM actorrr WHERE actor_id = 1")) {
        if ($row = $res->fetch_assoc()) {
            echo $row["first_name"] . "\n";
        } else {
            echo "No rows found!\n";
        }
        $res->close();
    } else {
        echo "Error in query:" . $mysqli->error . "\n";
    }
************************/
/**MODIFICA**/

function getCurl($fullReq){
    $c = curl_init();
    curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($c, CURLOPT_URL, $fullReq);
    $contents = curl_exec($c);
    curl_close($c);
    if ($contents)  return(json_decode($contents,true));
    else            return FALSE;
}    


?>