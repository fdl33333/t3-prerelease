<?php

error_reporting(E_ALL);
ini_set('display_errors', 'On');



// DebugBreak("1@192.168.0.101");


header( 'Expires: Sat, 26 Jul 1997 05:00:00 GMT' );
header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s',time()+60*60*8 ) . ' GMT' );
header( 'Cache-Control: no-store, no-cache, must-revalidate' );
header( 'Cache-Control: post-check=0, pre-check=0', false );
header( 'Pragma: no-cache' );

header('Content-type: application/json; charset=utf-8;');
// header('Access-Control-Allow-Headers: Content-Type');
//header('Access-Control-Allow-Headers: *');
// header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");



header('Access-Control-Allow-Origin: *');

header("Access-Control-Allow-Methods", "POST, GET");
header("Access-Control-Max-Age", "3600");

  
include_once('../config.php');
include_once('../fdl.php');
include_once('../classes/T3Class.php');
include_once('../classes/mySqliClass.php');

define("LOGPFX"			,	"T3_");

if (defined('STDIN')) {
    
    $instance = new vt();
    genLog("REQUEST FROM COMMAND LINE:" . json_encode($argv));
    echo $instance->doCommandLine($argv);
    unset($instance); 
    
} else { 

    $method = $_SERVER['REQUEST_METHOD'];
        
    switch ($method) {
        case "GET" :    $req = $_GET;   break;
        case "POST" :   $req = $_POST;  break;

        default :
            $rep = [
                "status"    => 9
            ,   "errMsg"    => "Bad request method: $method"
            ];
            echo json_encode($rep);
            exit;
        break;
    }

    if ($req == null) {
        $json = file_get_contents('php://input');   
        $req = json_decode($json, true); //questa seconda riga per trasformarlo in oggetto JSON

        if ($req== null) {
            
            parse_str ( $json, $req );
            
            if ($req == null) {
                
                $hd = getallheaders();
                // genLog(json_encode($hd ));
                
                $rep = [
                    "status"    => 9
                ,   "errMsg"    => "No request found!"
                ,   "headers"   => $hd
                ];
                echo json_encode($rep);
                
                exit;
            }
        }
    }

    $instance = new t3($req);
    // DebugBreak("1@82.49.188.40"); 
	$rrr = $instance->doit($req);
    echo $rrr;
    

    unset($instance); 
}
