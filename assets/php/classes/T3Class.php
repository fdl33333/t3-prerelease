<?php


class t3 {

	protected $socketErrNum 	= "";
	protected $socketErrDescr	= "";
	    
    private $my = null;

    public function doit($req) {


        $action = strtoupper(isset($req["action"]) ? $req["action"] : "");
        
        $actions = [
			"PING"				=>	"ping"
		,	"CARD_LIST"			=>	"cardList"
        ,	"CHECK_CARD"		=>	"checkCard"
		,	"CALL_REQUEST"		=>	"callRequest"

        ,	"LOGIN"				=>	"login"
        ,	"TZN_EXIST"			=>	"tznExist"
        ,	"TZN_USED"			=>	"tznUsed"
        ,	"TZN_DELETE"		=>	"tznDelete"
        ,	"GET_DEST"			=>	"getDest"
        ,	"COMPACT_UID"		=>	"compactUID"
        ,	"SAVE_CARD"			=>	"saveCard"
        ,	"FS_COMMAND"		=>	"fsCommand"
        
        ,	"GET_WEEK_NUM"		=>	"getWeekNum"
        
        ,	"DIGITS_IT"			=>	"digitsIT"
        ,	"SAY_BAL_IT"		=>	"sayBalIT"

        
        ,	"SAVE_CALL_STRUCT"	=>	"saveCallStruct"
        ,	"LOAD_CALL_STRUCT"	=>	"loadCallStruct"
        
		,	"FREE_CARD"			=>	"freeCard"
		        
        ,	"SESS_BEG"			=>	"sessBeg"
		,	"GET_DETT_CREDIT"	=>	"getDettCredit"
		
		,	"END_CALL"			=>	"endCall"
		
		,	"SPY"				=>	"spy"
		
		,	"GET_BAL_LINE"		=>	"getBalLine"
        ,	"DEL_RIC"			=>	"delRic"
        
        ,	"GET_EXT_FILES"		=>	"getExtFiles"
        
        ,	"EXT_ENABLED"		=>	"extEnabled"
        ,	"SET_UUID2"			=>	"setUUID2"
        ,	"CALL_END"			=>	"callEnd"

		,	"WL_DELETE"			=>	"wlDelete"
        
        ,	"GET_CALL_DATA"		=>	"getCallData"
        
        ,	"SAVE_WIN_POS"		=>	"saveWinPos"
        ,	"ENA_SET"			=> 	"enaSet"
        
        ,	"EXT_MOD"			=>	"extMod"
        
        ,	"GET_SPY_EXT"		=>	"getSpyExt"
        
        ,	"GET_CONST"			=>	"getConst"
        
        ,	"IS_CARD_USED"		=>	"isCardUsed"
        
        ,	"CARD_DELETE"		=>	"cardDelete"
        
        
        ,	"DISK_STATS"		=>	"diskStats"
        
        ,	"GET_CALLS"			=>	"getCalls"
        
        ,	"GET_FREE_OP"		=>	"getFreeOp"
        
        ,	"DUP_NUM_OK"		=>	"dupNumOK"
        
        ,	"CALL_STATS"		=>	"callStats"
        
        ,	"RECUP_CREATE"		=>	"recupCreate"
        ,	"RECUP_DELETE"		=>	"recupDelete"
        ];
        
        
        $poss="";
        foreach ($actions as $k => $v) {
            if ($poss!="") $poss .= ", ";
            $poss .= $k;
        }
        
        if ($action=="") 
            $rep = ["status" => STATUS_ERROR, "errMsg" => "Nessuna Action specificata", "actions" => $poss];
        else if ($action=="HELP") {
            $rep = ["status" => STATUS_OK, "actions" => $poss];                
        }
        else if (!array_key_exists($action, $actions))
            $rep = ["status" => STATUS_ERROR, "errMsg" => "Action '$action' sconosciuta", "actions" => $poss];
        else {
            $method = $actions[$action];
            $rep = $this->$method($req);
        }


        if ($rep["status"]!=STATUS_OK) {
        	genLog("**ERROR:" . $rep["errMsg"]);
		}
        return($this->prep($rep));

    }
    
    protected function recupCreate($req) {
		if (($callId = getVal($req,"callId"))=="")
			return(basicErr("callid missing"));

		$sql = "SELECT 
				SUM(talkSecs)	totTalk
			,	MAX(maxTalk)	maxTalk
			,	MAX(wlId)		wlId
			,	MAX(dialedNum)	dialedNum
			,	MAX(dettId)		dettId
			FROM (
				SELECT DISTINCT
					c.callId
				,	talkSecs
				,	w.duration * 60 maxTalk
				,	w.wlId
				,	c.dialedNum
				,	c.dettId
				FROM callrec c
				LEFT JOIN wl w ON w.num = c.dialedNum AND w.tip = c.callTip AND w.dettId = c.dettId
				WHERE c.callId = $callId
				OR c.retryCallId = $callId
			) z";

		$rows = $this->my->myGetRows($sql);
		if ($rows===-1)	return(basicErr($this->my->getLastErr()));
		if ($rows===0)	return(basicErr($this->my->getLastErr()));		
		$recup = $rows[0];			
		$recupSecs = intval($recup["maxTalk"]) - intval($recup["totTalk"]);
		
		if ($recupSecs  < MIN_RECOVER) {
			return(basicErr("Tempo disponibile insufficiente per questo recupero"));
		}

		$sql = "SELECT * 
				FROM recup 
				WHERE dettId = "  . $recup["dettId"]
				. "\nAND wlId = " . $recup["wlId"]
				. "\nAND DATE(dtCreate) = DATE(NOW())"
				. "\nAND dtUsed IS NULL";
		
		$rows = $this->my->myGetRows($sql);
		if ($rows === -1) return(basicErr($this->my->getLastErr()));
		
		if ($rows!==0) {
			return(basicErr("Esiste gia' un Recupero per questo numero per oggi"));
		}
		
		$data = [
			"dettId"  	=>	$recup["dettId"]
		,	"wlId"		=>	$recup["wlId"]
		,	"callId"	=>	$callId
		,	"recupSecs"	=>	$recupSecs 
		];
		
		if (!$this->my->doInsert("recup", $data)) {
			return(basicErr($this->my->getLastErr()));
		}
		
		return([
			"status"	=>	STATUS_OK
		]);
		
    }
    
    protected function recupDelete($req) {
		if (($recupId=getVal($req,"recupId"))=="")
			return(basicErr("recupId missing"));
			
		$sql = "DELETE FROM recup WHERE recupId = $recupId";
		if (!$this->my->doSQL($sql))
			return(basicErr($this->my->getLastErr()));
			
		return(["status" => STATUS_OK]);
		
    }
    
    protected function dupNumOK ($req) {
		if (($dettId = getVal($req,"dettId"))=="") 		return(basicErr("dettId missing"));
		if (($wlId = getVal($req,"wlId"))=="") 			return(basicErr("wlId missing"));
		if (($num = getVal($req,"num"))=="") 			return(basicErr("num missing"));
		if (($tip = getVal($req,"tip"))=="") 			return(basicErr("tip missing"));

		$have = [];
		foreach(["N","A","S","X","O","P"] as $t)
			$have[$t] = 0;
			
		$sql = "SELECT 
					tip
				,	COUNT(*) num
				FROM wl w
				WHERE w.dettId = $dettId
				AND w.wlId != $wlId
				AND CONCAT(',', w.num, ',') LIKE '%,$num,%'
				GROUP BY tip";
		
		$rows = $this->my->myGetRows($sql);
		if ($rows === -1)	return(basicErr($this->my->getLastErr()));
		if ($rows!== 0) {
			foreach($rows as $row) 
				$have[$row["tip"]] = intval($row["num"]);
		}
		if ($have[$tip]!=0) {
			return(basicErr("Esiste gia' una chiamata di questo tipo per questo numero!"));
		}
		if (in_array($tip,["N","A","O","P"])
				&& ($have["N"]!=0 || $have["A"]!=0 || $have["O"]!=0 || $have["P"]!=0)) {
			return(basicErr("Questo numero esiste gia' per un altro tipo di chiamata"));
		}
		
		return(["status" => STATUS_OK]);
		
    }
    
    protected function getFreeOp($req) {
		$ret 	= $this->getCalls($req);
		$of		= $ret["opFree"];

		if (sizeof($of)==0)	
			return(["status"	=> STATUS_OK, "freeOp" => ""]);
		else {
			return(["status"	=> STATUS_OK, "freeOp" => reset($of)]);
		}
		
    }
    
    protected function getCalls($req) {
		
		$creq = $this->fsCommand(["cmd" => "api show calls"]);
		$cret = $creq["response"];
		
		$calls = [];
		$hdr = [];
		$rn = 0;
		if(strpos($cret,"uuid")!==false)  {
			$cRows = explode("\n", $cret);
			foreach ($cRows as $cRow) {
				$cCols = explode(",", $cRow);
				if (sizeof($cCols)>2) {
					if ($hdr ==[])
						$hdr = $cCols;
					else {
						for ($i=0; $i<sizeof($cCols); $i++) 
							$call[$hdr[$i]] = $cCols[$i];
						$calls[] = $call;	
					}
				}
				
			}
		}
		
		$extUsed = [];
		foreach($calls as $call) {
			$extUsed[]	= $call["cid_num"];
			$extUsed[]	= $call["dest"];
		}
		
		$opExt = explode(",", OP_EXT);
		foreach($extUsed as $eu) {
			if (($k = array_search($eu,$opExt))!==false)
				unset($opExt[$k]);
		}

		
		return([
			"status" 	=> 	STATUS_OK
		, 	"calls" 	=> 	$calls
		,	"extUsed"	=>	$extUsed
		,	"opFree"	=>	$opExt
		]);
		
    }
    
    protected function diskStats($req) {
		$ds = new DiskStatus('/');
/**
		try {
			
			$freeSpace = $ds->freeSpace();
			$totalSpace = $ds->totalSpace();
		} catch (Exception $e) {
			return(basicErr($e->getMessage()));
		}
**/
		$df = shell_exec("df -h");
		$df = explode("\n",$df);
		$dd = [];
		foreach($df as $d) {
			if (substr($d,0,5)=="/dev/") {
				$temp = explode(" ",$d);
				$temp = array_merge(array_filter($temp));
				$dd[] = [
					"name"	=>	$temp[0]
				,	"tot"	=>	$temp[1]
				,	"used"	=>	$temp[2]
				,	"avail"	=>	$temp[3]
				,	"pct"	=>	str_replace("%", "",$temp[4])
				];
			}
		}

		
		$str   = @file_get_contents('/proc/uptime');
		$num   = floatval($str);
		$secs  = fmod($num, 60); $num = (int)($num / 60);
		$mins  = $num % 60;      $num = (int)($num / 60);
		$hours = $num % 24;      $num = (int)($num / 24);
		$days  = $num;
		
		// Load
		$stat1 = file('/proc/stat'); 
		sleep(1); 
		$stat2 = file('/proc/stat'); 
		$info1 = explode(" ", preg_replace("!cpu +!", "", $stat1[0])); 
		$info2 = explode(" ", preg_replace("!cpu +!", "", $stat2[0])); 
		$dif = array(); 
		$dif['user'] = $info2[0] - $info1[0]; 
		$dif['nice'] = $info2[1] - $info1[1]; 
		$dif['sys'] = $info2[2] - $info1[2]; 
		$dif['idle'] = $info2[3] - $info1[3]; 
		$total = array_sum($dif); 
		$cpu = array(); 
		foreach($dif as $x=>$y) $cpu[$x] = round($y / $total * 100, 1);
		$load = 100 - $cpu['idle'];

		
		/// RAM
		
		$free = shell_exec('free');
		$free = (string)trim($free);
		$free_arr = explode("\n", $free);
		$mem = explode(" ", $free_arr[1]);
		$mem = array_filter($mem);
		$mem = array_merge($mem);
		$memTot =  intval($mem[1]) * 1024;
		$memUsed = intval($mem[2]) * 1024;
		$memFree = intval($mem[3]) * 1024;
		$memPCT  = $memUsed / $memTot * 100;
		
		
		
		return ([
			"status"	=> 	STATUS_OK
		,	"vals" => [
		/**
				"totalU"	=> 	$ds->totalSpace()
			,	"freeU"		=>	$ds->freeSpace()	
			,	"usedU"		=> 	$ds->addUnits($ds->totalSpace(true) - $ds->freeSpace(true))
			,	"usedPCT"	=>	round(($ds->totalSpace(true) - $ds->freeSpace(true)) / $ds->totalSpace(true) * 100,2)
			**/
				"dd"		=>	$dd
			,	"upTime"	=>	"$days giorni $hours ore $mins minuti"
			,	"load"		=>	$load
			,	"memTot"	=>	$ds->addUnits($memTot)
			,	"memUsed"	=>	$ds->addUnits($memUsed)
			,	"memFree"	=>	$ds->addUnits($memFree)
			,	"memPCT"	=>	$memPCT
			]
		]);
		
		
    }
    
    
    protected function callStats($req) {
		
		
		$creq = $this->fsCommand(["cmd" => "api show calls"]);
		$cret = $creq["response"];

		$uidActive = "'zzzz'";		
		$calls = [];
		$rn = 0;
		if(strpos($cret,"uuid")!==false)  {
			$cRows = explode("\n", $cret);
			foreach($cRows as $cRow) {
				$cCols = explode(",", $cRow);
				if(sizeof($cCols) > 2 ) {
					if ($rn > 0 ) {
						$uidActive .= ",'" . $cCols[0] . "'";
						$calls[] = [
							"uuid"	=>	$cCols[0]
						,	"beg"	=>	$cCols[2]
						,	"anum"	=>	$cCols[7]
						,	"bnum"	=>	$cCols[15]
						];
					}
					$rn++;
				}
			}
		}



		$sql = "SELECT 
			r.uuid
		,	r.sessDTTM
		,	r.ext
		,	c.serial
		,	CONCAT(d.lname,', ', d.fname) `name`
		,	r.dialedNum
		,	CONCAT('[', r.callTip,  '] ',r.descr) descr
		,	CASE 
				WHEN r.cause IS NULL THEN '*Attiva'
				ELSE CONCAT(' ',IF(r.`status` =0, TIME_FORMAT(SEC_TO_TIME(r.totSecs),'%H:%i:%s'), r.cause))  
			END stat
		FROM callrec r
		LEFT JOIN card c ON c.cardId = r.cardId
		LEFT JOIN dett d ON d.dettId = r.dettId
		LEFT JOIN wl   w ON w.wlId  = r.wlId
		WHERE r.cause IS NOT NULL
			OR  r.uuid IN ($uidActive)
		ORDER BY LEFT(stat,1) DESC, sessDTTM DESC
		LIMIT 10";

		$rows = $this->my->myGetRows($sql);
		if ($rows=== -1) 
			return(basicErr($this->my->getLastErr() . "sql: $sql"));

		return(["status" => STATUS_OK, "calls" => $rows]);
    }
    
    
    protected function getSpyExt($req) {
		
		$rows = $this->my->myGetRows("SELECT constVal FROM const WHERE constName = 'SPY_EXT'");
		if ($rows===-1)				return(basicErr("Error getting spyExt:" . $this->my->getLastErr()));
		if ($rows===0)				return(basicErr("NO spy extensions configured"));
		
		$tmpArr = explode(",", $rows[0]["constVal"]);
		if (sizeof($tmpArr)==0)		return(basicErr("NO spy extensions configured"));
		
		$spyExt = [];
		foreach($tmpArr as $ext) 
			$spyExt[$ext] = [
				"used"	=>	0
			];
		
		$ret = $this->fsCommand(["cmd" => "api show registrations"]);
		
		if (substr(trim($ret["response"]),0,8) != "reg_user")	{
			return(basicErr("Error getting registrations:" . $ret["response"]));
		}

		$lines = explode("\n", $ret["response"]);
		for ($i=2; $i<sizeof($lines)-3; $i++) {
			$extRegged = trim(explode(",", $lines[$i])[0]);
			if (array_key_exists($extRegged, $spyExt))
				$spyExt[$extRegged]["used"] = 1;
		}

		$useExt = "";			
		foreach($spyExt as $k => $v) {
			if ($spyExt[$k]["used"]== "0")
				$useExt = $k;
		}
		if ($useExt == "")
			return(basicErr("NO free spy extensions"));
		
		
		return([
			"status"	=>	STATUS_OK
		,	"spyExt"	=>	$useExt
		]);
			
		
		
    }
    
    protected function isCardUsed($req) {
		if(($card = getVal($req,"card"))=="")
			return(basicErr("'card' Missing"));
		
		$rows = $this->my->myGetRows("SELECT CONCAT(lname, ', ', fname) usedBy FROM dett WHERE card = '$card'");
		if ($rows===-1)	return(basicErr($this->my->getLastErr()));
		$usedBy = "";
		if ($rows!==0)	
			$usedBy = $rows[0]["usedBy"];
			
		return([
			"status"	=>	STATUS_OK
		,	"usedBy"	=>	$usedBy
		]);
    }
    
    protected function cardDelete($req) {
		if(($card = getVal($req,"card"))=="")
			return(basicErr("'card' Missing"));
		
		$ret =  $this->isCardUsed(["card" => $card]);
		if ($ret["status"] != STATUS_OK)
			return($ret);
		if ($ret["usedBy"]!="")
			return(basicErr("Impossibile eliminare Tessera\nUsata da " . $ret["usedBy"]));
		
		if (!$this->my->doSQL("DELETE FROM card WHERE serial = '$card'"))
			return(basicErr("Deleting card $card : " . $this->my->getLastErr()));
		return (["status" => STATUS_OK]);	
    }
    
    protected function extMod($req) {
		if (($ext = trim(getVal($req,"ext")))=="")	
			return(basicErr("No extension specified!"));
			
		$act = trim(strtoupper(getVal($req,"act")));
		
		if ($act!="A" && $act!="D")
			return(basicErr("act invalid or missing. must be 'A' or 'D'"));

		$pwd= getVal($req,"pwd", '$${default_password}');
			
// DebugBreak("1@192.168.0.101");

		switch ($act) {
			
			case "A" :
				$xml = EXT_TEMPLATE;
				$xml = str_replace("%%ext%%",$ext,$xml);
				$xml = str_replace("%%pwd%%",$pwd,$xml);
				$file = fopen(EXT_DIR . $ext . ".xml", "w") or die("Unable to open file!");
				if (!$file) return(basicErr("unable to open file"));
				fwrite($file, $xml);
				fclose($file);
				$ret = ($this->fsCommand(["cmd" => "api reloadxml"]));

				return(["status" => STATUS_OK,"fsreturn" => $ret]);
			break;
				
			
			case "D" :
				$fname = EXT_DIR . $ext . ".xml";
				if (file_exists($fname)) {
					$ret = unlink ($fname);
					if (!$ret)	return(basicErr("Delete failed"));
					else {
						$fsret = ($this->fsCommand(["cmd" => "api reloadxml"]));
						if(!$this->my->doSQL("DELETE FROM ext WHERE extNum = '$ext'"))
							return(basicErr("Deleting Ext:" + $this->my->getLastErr()));
						return(["status" => STATUS_OK,"fsreturn" => $fsret]);
					}
				} else {
					return(["status" => STATUS_OK,"msg" => "no such file"]);
				}
				
			break;
			
			
		}
		
    }
	
	protected function getConst($req) {
		if(($const=getVal($req,"constName"))=="")
			return(basicErr("Missing const"));
		$rows = $this->my->myGetRows("SELECT constVal FROM const WHERE constName = '$const'");
		if ($rows===-1)	return(basicErr("Error getting const:" . $this->my->getLastErr()));
		if ($rows===0)	return(basicErr("Const '$const' not found"));
		return([
			"status"	=> 	STATUS_OK
		,	"val"		=>	$rows[0]["constVal"]
		]);
	}
	    
    protected function enaSet($req) {
// DebugBreak("1@192.168.0.101");

		if (($userId = getVal($req,"uid"))=="")		return(basicErr("userId missing"));
		$ena = getVal($req, "ena");
		$sql = "UPDATE usr SET menuEnabled = '$ena' WHERE userId=$userId";
		if (!$this->my->doSQL($sql))
			return(basicErr($this->my->getLastErr()));
		
		return(["status" => STATUS_OK]);
		
    }
    
    protected function saveWinPos($req) {
// DebugBreak("1@192.168.0.101");

		if (($userId = getVal($req,"userId"))=="")
			return(basicErr("userId missing"));
		
		if (($data = getVal($req,"data"))=="")
			return(["status" => STATUS_OK]);
		
		$sql = "UPDATE usr SET winpos='$data' WHERE userId = $userId";
		if (!$this->my->doSQL($sql))
			return(basicErr("saving window pos:" . $this->my->getLastErr()));
		
		return(["status" => STATUS_OK]);
		
    }
    
    protected function getCallData($req) {
    	

    	
    	if (($callId=getVal($req,"callId"))=="")
    		return(basicErr("No callId"));

		$sql = "SELECT
					CONCAT(d.lname, ', ', d.fname) name
				,	d.matr 
				,	r.sessDTTM
				,	r.ext
				,	c.serial cardser
				,	r.dialedNum
				,	r.descr wldescr
				,	CASE r.callTip
						WHEN 'N' THEN 'Normale'
						WHEN 'A' THEN 'Avvocati'
						WHEN 'S' THEN 'Supplementare'
						WHEN 'X' THEN 'Straordinaria'
						WHEN 'O' THEN 'Normale da PO'
						WHEN 'P' THEN 'Avvocati da PO'
					END callTip
				,	IF(r.retryCallId IS NULL,'No','Si') recup
				,	p.descr
				,	z.tznDescr
				,	t.trunkDescr
				,	CASE t.trunkType
						WHEN 'A' THEN 'Analogica'
						WHEN 'D' THEN 'Digitale'
					END trunkType
				,	r.totSecs
				,	r.secsGrace
				,	r.talkSecs
				,	z.minCharge
				,	r.totCharge
				,	s.statDescr
				,	IF(r.record=1,x.filename,'') recFile
				FROM callrec r
				JOIN dett d 	ON d.dettId = r.dettId
				LEFT JOIN trunk t 	ON t.trunkId = r.trunkId
				LEFT JOIN pfx p 		ON p.pfxId = r.pfxId
				LEFT JOIN tzn z 		ON z.tznCode = p.tznCode
				LEFT JOIN card c 	ON c.cardId = r.cardId
				LEFT JOIN statcodes s ON s.code = r.status
				LEFT JOIN wl w ON w.wlId = r.wlId
				LEFT JOIN rec x ON x.callId = r.callId
				WHERE r.callId = $callId";

		$rows = $this->my->myGetRows($sql);
		if ($rows===-1)	return(basicErr($this->my->getLastErr()));
		if ($rows===0)	return(basicErr("Call not found"));
		return ([
			"status"	=>	STATUS_OK
		,	"data"		=>	$rows[0]
		,	"wavDir"	=>	WAV_DIR
		,	"mp3Dir"	=>	MP3_DIR
		]);							
	}	
    
    protected function wlDelete($req) {
		if (($wlId = getVal($req,"wlId"))=="")
			return(basicErr("wlId missing"));
			
		if (!$this->my->doSQL("DELETE FROM wl WHERE wlId = $wlId"))
			return(basicErr($this->my->getLastErr()));
		
		return(["status"=>STATUS_OK]);
		
    }
    
    protected function callEnd($req) {
		if(($callId = getVal($req,"callId",0))==0)		return(basicErr("callId missing"));

		$totSecs	= intval(getVal($req,"totSecs",0));
		$talkSecs	= intval(getVal($req,"talkSecs",0));
		$dialDTTM	= getVal($req,"dialDTTM");
		$ansDTTM	= getVal($req,"ansDTTM");
		$endDTTM	= getVal($req,"endDTTM");
		$endDTTM	= getVal($req,"endDTTM");
        $cause		= getVal($req,"cause");
// DebugBreak("1@192.168.0.101");        
		
		$rows = $this->my->getSQL("SELECT * FROM callrec WHERE callId=$callId");
		if ($rows===-1)	return(basicErr($this->my->getLastErr()));
		if ($rows===0)	return(basicErr("call with callId $callId NOT found!"));
		$call = $rows[0];

		$rate 		= floatVal($call["rate"]);
		$drpCharge	= floatVal($call["drpCharge"]);
		$minCharge 	= floatval($call["minCharge"]);
		
		if ($talkSecs <= 0) {
			$totCharge = 0;
			$status = ERR_NO_ANSWER;
		} else {			
			$totCharge = ($talkSecs * floatval($call["rate"]) / 60) + $drpCharge;
			if ($totCharge < $minCharge)	
				$totCharge = $minCharge;
			$totCharge = round($totCharge, 2);			
			$status = ALL_OK;
		}
		
		$sql = "UPDATE callrec
				SET totSecs=$totSecs
				,	talkSecs=$talkSecs
				,	totCharge=$totCharge
		  		,	status=$status
		  		,	cause='$cause'
		  		,	dialDTTM='$dialDTTM'";
		
		if ($ansDTTM!="")	$sql .= "\n,	ansDTTM='$ansDTTM'";
		if ($endDTTM!="")	$sql .= "\n,	endDTTM='$endDTTM'";
		
		$sql .= "\nWHERE callId=$callId";

// DebugBreak("1@192.168.0.101");
		
		if(!$this->my->doSQL($sql)) 
			return(basicErr("Updating call: " . $this->my->getLastErr()));
		
		if (intval($call["recupId"])!=0 && $status == ALL_OK) {
			$sql = "UPDATE recup SET dtUsed = NOW() WHERE recupId = " . $call["recupId"];
			$this->my->doSQL($sql);
		}

		return([
			"status"	=> STATUS_OK
		,	"totCharge"	=>	$totCharge
		]);
	}
    
    protected function setUUID2 ($req) {
		if(($callId=getVal($req,"callId"))=="")		return(basicErr("callId Missing"));
		if(($uuid2=getVal($req,"uuid2"))=="")	return(basicErr("uuid2 Missing"));
		
		$sql = "UPDATE callrec SET uuid2='$uuid2' WHERE callId=$callId";
		if (!$this->my->doSQL($sql)) 
			return(basicErr($this->my->getLastErr()));
		
		return(["status" => STATUS_OK]);
		
    }
    
    protected function getExtFiles ($req) {
        
    	$ext=[];
        $d = dir(EXT_DIR);
		while (($entry = $d->read()) !== false) {
		    
		    $ext[] = explode(".", $entry)[0];
		}
		
		return([
			"status"	=>	STATUS_OK
		,	"extfiles"	=>	$ext
		]);
	
	}
    
    protected function login($req) {
		if (($uid = getVal($req,"uid"))=="")	return(basicErr("Manca Login"));
		if (($pwd = getVal($req,"pwd"))=="")	return(basicErr("Manca Password"));
		$sql = "SELECT * FROM usr WHERE uid='$uid'";
		$rows = $this->my->myGetRows($sql);
		if ($rows===-1)							return(basicErr($this->my->getLastErr()));
		if ($rows===0)							return(basicErr("Utente $uid NON trovato!"));
		$user = $rows[0];
		if ($pwd != $user["pwd"])			return(basicErr("Password Errata!"));
		
		$sql = "SELECT constVal FROM const WHERE constName='DURATIONS'";
		$rows = $this->my->myGetRows($sql);
		if ($rows===-1)							return(basicErr($this->my->getLastErr()));
		if ($rows===0)							return(basicErr("Nessuna Durata impostata"));
		$dur = $rows[0];
		
		$sql = "SELECT GROUP_CONCAT(menuCode) mEna FROM menu WHERE menuId IN (" . $user["menuEnabled"] . ")";
		$rows = $this->my->myGetRows($sql);
		if ($rows===-1)							return(basicErr($this->my->getLastErr()));
		$mEna = $rows[0]["mEna"];
		
		return([
			"status"	=>	STATUS_OK
		,	"userId"	=>	$user["userId"]
		,	"fname"		=>	$user["fname"]
		,	"lname"		=>	$user["lname"]
		,	"flags"		=>	$user["flags"]
		,	"wavDir"	=>	WAV_DIR
		,	"mp3Dir"	=>	MP3_DIR
		,	"durations"	=>	$dur["constVal"]
		,	"winpos"	=>	$user["winpos"]
		,	"mEna"		=>	"," . $mEna . ","
		]);
		
    }
    
    protected function ping($req) {
        return ([
            "status"    =>      STATUS_OK
        ,   "pong"     	=>      getTimeInItaly()
        ]);
    }

	protected function cardList($req) {
		$rows = $this->my->myGetRows("SELECT * FROM card");
		if ($rows===-1)	return(basicErr("mysql Error: " . $this->my->getLastErr()));
		
		return([
			"status"		=>	STATUS_OK
		,	"cards"			=>	$rows
		]);
	}

	protected function checkCardOld($req) {

		//DebugBreak("1@192.168.0.101");
		if (($pin = getVal($req,"pin"))=="")			return(basicErr("No pin supplied!"));

		if (($realpin = getVal($req,"realpin"))=="")	return(basicErr("No realpin supplied!"));		
		
		$sql = "SELECT 
					c.cardId
				,	c.serial
				,	IFNULL(d.dettId,0) dettId
				,	IFNULL(CONCAT(d.lname, ' ',d.fname),'') dettName
				,	langCode
				,	enabled
				,	d.pin realpin
				FROM card c
				LEFT JOIN dett d ON d.card = c.serial
				WHERE c.pin = '$pin'";				
		$rows = $this->my->myGetRows($sql);

		$errData =[
			"pin"	=>	$pin
		];
		if ($rows===-1)	{
			$errData["error"] = substr($this->my->getLastErr(),255); 
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => $this->my->getLastErr()]);
			
		}
		
		if ($rows===0)	{
			$errData["error"] = "Tessera Non presente in Db";
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "CARD_INVALID", "errMsg" => "Tessera non presente in Db"]);
		}

		
		if ($rows[0]["enabled"] == "0") {
			$errData["serial"] = $rows[0]["serial"];
			$errData["error"] = "Tessera Non Abilitata";
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "CARD_INVALID", "errMsg" => "Tessera non Abilitata"]);
		}
	
		
		if ($rows[0]["dettId"] == "0") {
			$errData["serial"] = $rows[0]["serial"];
			$errData["error"] = "Tessera Non associata";
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "CARD_INVALID", "errMsg" => "Tessera non associata a nessuno"]);
		}
		
		if ($rows[0]["realpin"] != $realpin) {
			$errData["serial"] = $rows[0]["serial"];
			$errData["error"] = "Errore pin";
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "CARD_INVALID", "errMsg" => "Errore pin"]);
		}
/**		
		$sql = "SELECT COUNT(*) tot
				FROM callrec r
				WHERE r.`status` IS NULL
				AND TIME_TO_SEC(TIMEDIFF(NOW(),r.sessDTTM)) < 3600
				AND r.cardId = " . $rows[0]["cardId"];
**/		
		$rcs = $this->my->myGetRows($sql);
		
		
		$ret = $this->getDettCredit(["dettId" => $rows[0]["dettId"]]);
		if ($ret["status"] != 0) {
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "getting Credit:" .$this->my->getLastErr()]);
		}
		
		$credit = floatval($ret["credit"]);		
		
		return([
			"status"	=> 	STATUS_OK
		,	"cardId"	=>	$rows[0]["cardId"]
		,	"serial"	=>	$rows[0]["serial"]
		,	"dettId"	=>	$rows[0]["dettId"]
		,	"dettName"	=>	$rows[0]["dettName"]
		,	"langCode"	=>	$rows[0]["langCode"]
		,	"credit"	=>	$credit
		]);
		
	}
	
	protected function checkCard($req) {
//DebugBreak("1@192.168.0.101");
		if (($pin = getVal($req,"pin"))=="")			return(basicErr("No pin supplied!"));
		
		$sql = "SELECT 
					c.cardId
				,	c.serial
				,	IFNULL(d.dettId,0) dettId
				,	IFNULL(CONCAT(d.lname, ' ',d.fname),'') dettName
				,	langCode
				,	enabled
				,	d.pin realpin
				FROM card c
				LEFT JOIN dett d ON d.card = c.serial
				WHERE c.pin = '$pin'";				
		$rows = $this->my->myGetRows($sql);

		$errData =[
			"pin"	=>	$pin
		];
		if ($rows===-1)	{
			$errData["error"] = substr($this->my->getLastErr(),255); 
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => $this->my->getLastErr()]);
			
		}
		
		if ($rows===0)	{
			$errData["error"] = "Tessera Non presente in Db";
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "CARD_INVALID", "errMsg" => "Tessera non presente in Db"]);
		}

		
		if ($rows[0]["enabled"] == "0") {
			$errData["serial"] = $rows[0]["serial"];
			$errData["error"] = "Tessera Non Abilitata";
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "CARD_INVALID", "errMsg" => "Tessera non Abilitata"]);
		}
	
		
		if ($rows[0]["dettId"] == "0") {
			$errData["serial"] = $rows[0]["serial"];
			$errData["error"] = "Tessera NOn associata";
			$this->my->doInsert("cardErr", $errData);
			return(["status" => 9, "playfile" => "CARD_INVALID", "errMsg" => "Tessera non associata a nessuno"]);
		}

		$ret = $this->getDettCredit(["dettId" => $rows[0]["dettId"]]);
		if ($ret["status"] != 0) {
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "getting Credit:" .$this->my->getLastErr()]);
		}
		
		$credit = floatval($ret["credit"]);		
		
		
		return([
			"status"	=> 	STATUS_OK
		,	"cardId"	=>	$rows[0]["cardId"]
		,	"serial"	=>	$rows[0]["serial"]
		,	"dettId"	=>	$rows[0]["dettId"]
		,	"dettName"	=>	$rows[0]["dettName"]
		,	"langCode"	=>	$rows[0]["langCode"]
		,	"realpin"	=>	$rows[0]["realpin"]
		,	"credit"	=>	$credit
		,	"creditOk"	=>	$credit > 0 ? 1 : 0
		]);
		
	}	

	protected function extEnabled($req) {
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// IS EXTENSION enabled at this time
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DebugBreak("1@192.168.0.101");

		if (($ext = getVal($req,"ext"))=="")
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "ext missing"]);
		
		$sql = "SELECT *
				FROM ext e
				LEFT JOIN sect s ON s.sectId = e.sectId
				WHERE e.extNum = '$ext'";
				
		$rows = $this->my->myGetRows($sql);
		if ($rows===-1)		return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => $this->my->getLastErr()]);
		if ($rows===0)		return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "ext NOT found"]);
		
		if ($rows[0]["enabled"]=="0") {
			return(["status" => 9, "playfile" => "EXT_DISABLED", "errMsg" => "ext disabled"]);
		}
		
		$hhmmNow = substr(getTimeInItaly(), 11,5);
		// 0----+----1----+----2
		// YYYY-MM-DD HH:NN:SS
		$extEnabled = false;
		
		for ($p=1;$p<4;$p++) {
			 $per = $rows[0]["p" . $p];
			 if ($per!="") {
				 $perBeg = substr($per,0,5);
				 $perEnd = substr($per,6,5);
				 if ($hhmmNow >= $perBeg &&  $hhmmNow <= $perEnd)
				 	return(["status" => STATUS_OK, "section" =>$rows[0]["sectId"], "per" => $per  ]);
			 }
		}
		
		return(["status" => 9, "playfile" => "EXT_DISABLED", "errMsg" => "ext disabled by section"]);
		
	}
	
	protected function callRequest($req) {

// DebugBreak("1@192.168.0.101");

 	
		$timeNow =  getTimeInItaly();

		if (($uuid		= getVal($req,"uuid"))=="")			return(basicErr("uuid missing"));
		if (($ext		= getVal($req,"ext"))=="")			return(basicErr("ext missing"));
		if (($cardId	= getVal($req,"cardId"))=="")		return(basicErr("cardId missing"));
		if (($dettId	= getVal($req,"dettId"))=="")		return(basicErr("dettId missing"));
		if (($dialedNum	= getVal($req,"dialedNum"))=="")	return(basicErr("dialedNum missing"));

		
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// LOOK FOR INMATE
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		
		$sql = "SELECT * FROM dett WHERE dettId = $dettId";
		$rows = $this->my->myGetRows($sql);
		if ($rows===-1) 		return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Looking for dett $dettId:" .$this->my->getLastErr()]);
		if ($rows===0)			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Looking for dett $dettId - NOT found in db"]);

		$dett = $rows[0];	
		unset($req["action"]);
		$call = $req;
		$call["sessDTTM"]	=  $timeNow;


		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// LOOK FOR NUMBER IN WHITELIST
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
		$sql = "SELECT * FROM wl WHERE dettId = $dettId AND CONCAT(',', num,',') like '%,$dialedNum,%'  ORDER BY tip DESC ";
		$rows = $this->my->myGetRows($sql);
		if ($rows==-1) {
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Looking for number:" .$this->my->getLastErr()]);
		}		

		
		if ($rows===0)	{
			$call["status"] = ERR_NUM_NOT_WL;
			if (!$this->my->doInsert("callrec", $call)) {
				return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Inserting Call:" . $this->my->getLastErr()]);
			}
			return(["status" => 9, "playfile" => "INVALID_NUM", "errMsg" => "number $dialedNum not in whitelist for dett $dettId"]);
		}

		foreach($rows as $wl) {
			$ret = $this->wlCheck($req,$dett, $wl) ;
			if ($ret["status"]==0) {
				$call = $ret["call"];
				if (!$this->my->doInsert("callrec", $call)) {
					return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Inserting Call:" . $this->my->getLastErr()]);
				}
				$call["callId"] = $this->my->getLastInsertId();				
				
				if ($dett["recAlways"]==1)
					$call["record"]		= 1;
				
				return([
					"status" 	=>	STATUS_OK
				,	"recDir"	=>	BASE_DIR . REC_DIR
				,	"call"		=>	$call 
				]);			
			}
		}
		if ($ret["status"]==5) {
			$call = $ret["call"];
			if (!$this->my->doInsert("callrec", $call)) {
				return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Inserting Call:" . $this->my->getLastErr()]);
			}
			$call["callId"] = $this->my->getLastInsertId();				
			return(["status" => 9, "playfile" => $ret["playfile"], "errMsg" => $ret["errMsg"]]);
		}

		if ($ret["status"]==9) {
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => $ret["errMsg"]]);
		}

	}

	protected function wlCheck($req, $dett, $wl) {

// DebugBreak("1@192.168.0.101");

		$timeNow =  getTimeInItaly();

		if (($uuid		= getVal($req,"uuid"))=="")			return(basicErr("uuid missing"));
		if (($ext		= getVal($req,"ext"))=="")			return(basicErr("ext missing"));
		if (($cardId	= getVal($req,"cardId"))=="")		return(basicErr("cardId missing"));
		if (($dettId	= getVal($req,"dettId"))=="")		return(basicErr("dettId missing"));
		if (($dialedNum	= getVal($req,"dialedNum"))=="")	return(basicErr("dialedNum missing"));
		
		
		unset($req["action"]);
		$call = $req;
		$call["sessDTTM"]	=  $timeNow;

		$call["wlId"] 		= $wl["wlId"];
		$call["callTip"] 	= $wl["tip"];
		$call["descr"] 		= $wl["descr"];
		$call["callsQta"] 	= $wl["callsQta"];
		if ($call["callTip"]=='X')
			$call["callsFreq"] 	= 'X';
		else
			$call["callsFreq"] 	= $wl["callsFreq"];
		$call["expire"] 	= $wl["expire"];
		$call["duration"] 	= $wl["duration"];
		$call["record"]		= $wl["record"];
		$maxDur =  intval($wl["duration"]);
		$maxRetr = intval($wl["attNum"]);

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// WHAT TYPE CALL IS IT?
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		$tip = $wl["tip"];
		
		switch($tip) {
			case "N" 	: 
			case "O" 	: 
				$call["globQta"]	= 	$dett["limNrmNum"];
				$call["globFreq"]	=	$dett["limNrmFreq"];
				break;
				
			case "A"	:
			case "P"	:
				$call["globQta"]	= 	$dett["limAvvNum"];
				$call["globFreq"]	=	$dett["limAvvFreq"];
				break;
			
			case "S" 	:
				$call["globQta"]	= 	$dett["limSupNum"];
				$call["globFreq"]	=	$dett["limSupFreq"];
				break;
			
			case "X"	:
	 			$call["globQta"]	= 	999;
				$call["globFreq"]	=	'D';
				break;
  			
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// HAS THIS WL ELEMENT EXPIRED ?
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		
		if ($tip!='N' && $tip!='A' && substr($timeNow,0,10) > $call["expire"] ) {          
			$call["status"] = ERR_NUM_EXPIRED;

			return(["status" => 5, "call" => $call,  "playfile" => "INVALID_NUM", "errMsg" => "Numero $dialedNum scaduto il " . $call["expire"]]);
			
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// MANUAL RECOVER ??
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		$recoverTime = 0;
		$recupId = 0;
		
		$wlId = $wl["wlId"];
		$sql = "SELECT recupId, recupSecs, callId
				FROM recup
				WHERE dettId = $dettId
				AND wlId = $wlId
				AND dtUsed IS NULL
				AND DATE(dtCreate) = DATE(NOW())";
		
		$rows = $this->my->myGetRows($sql);
		if ($rows!==0 && $rows!==-1) {
			$call["recupId"] 		= $rows[0]["recupId"];
			$recoverTime 			= intVal($rows[0]["recupSecs"]);
			$call["retryCallId"] 	= $rows[0]["callId"];
		}
		
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// IS HE RECOVERING A CALL ??
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		if ($recoverTime == 0) {
			$attNum = intval($wl["attNum"]);
			$attWithin = intval($wl["attWithin"]);
			if ($attNum > 0) {
				if ($attWithin==999) {
					$after = substr($timeNow,0,10) . " 00:00:00";
				} else {
					$time = strtotime($timeNow) - ($attWithin * 60); //  - ($maxDur * 60);
					$after = date("Y-m-d H:i.s", $time);
				}
				$sql = "SELECT 
							SUM(c.talkSecs) talkedSecs
						,	COUNT(*) attempts
						,	MAX(IF(IFNULL(c.retryCallId,0)=0,c.callId,0)) recId
						FROM callrec c
						WHERE c.dettId = $dettId
						AND sessDTTM >= '$after'
						AND c.callTip = '$tip'
						AND c.dialedNum = '$dialedNum'
						AND status=0
						GROUP BY c.dettId 
						HAVING MIN(IFNULL(c.retryCallId,0)) = 0";
						
				$rows = $this->my->myGetRows($sql);
				if ($rows==-1) 
					return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Looking for old:" . $this->my->getLastErr()]);

				if ($rows!==0) {
					$timeLeft = ($maxDur * 60)  - intval($rows[0]["talkedSecs"]);
					
					if ($timeLeft >= intval(MIN_RECOVER) 
					&& intval($rows[0]["attempts"]) < ($maxRetr + 1) ) {
						$recoverTime = $timeLeft;
						$call["retryCallId"] = $rows[0]["recId"];
					}
				}			
				
			}
		}		

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// IS HE OVER NUMBER LIMIT FOR THIS CALL (OR CALL TYPE) IN FREQ
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		if ($recoverTime == 0) {
			if ($tip=="X") {
        		$wlId = $wl["wlId"];
				$sql = "SELECT 
							sessDTTM
						FROM callrec c
						WHERE c.dettId = $dettId
						AND wlId = $wlId
						AND status = 0";
			
				$rows = $this->my->myGetRows($sql);
				if ($rows===-1)
					return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Looking for usage:" .$this->my->getLastErr()]);

				if ($rows!==0) {
					$call["status"] = ERR_LIMIT_NUMBER;
					return(["status" => 5, "call" => $call,  "playfile" => "LIMIT_NUMBER", "errMsg" => "Reached limit to calls to this number"]);
				}	        

			
			} else {
			
				$limitD = date('Y-m-d', time()) . " 00:00:00";
				$limitW = date('Y-m-d', strtotime('-'.((date('w') +6) % 7).' days')) . " 00:00:00";
				$limitM = date('Y-m-d', strtotime('-'.(date('d') - 1).' days')) . " 00:00:00";
				
				switch($call["callsFreq"]) {
					case "D"	:	$limitC = $limitD;	break;
					case "W"	:	$limitC = $limitW;	break;
					case "M"	:	$limitC = $limitM;	break;
				}

				switch($call["globFreq"]) {
					case "D"	:	$limitG = $limitD;	break;
					case "W"	:	$limitG = $limitW;	break;
					case "M"	:	$limitG = $limitM;	break;
				}

				$limitMax = ($limitC < $limitG) ? $limitC : $limitG;				
				
				$sql = "SELECT 
							c.dialedNum
						,	c.callTip
						,	SUM(IF(c.dialedNum =  '$dialedNum' AND sessDTTM >= '$limitC', 1, 0)) numTot
						,	SUM(IF(c.dialedNum != '$dialedNum' AND sessDTTM >= '$limitG', 1, 0)) tipTot
						FROM callrec c
						WHERE c.dettId = $dettId
						AND (c.dialedNum = '$dialedNum' OR c.callTip = '$tip')
						AND (IFNULL(c.retryCallId,0) = 0)
						AND (c.`status` = 0)";
				
				$rows = $this->my->myGetRows($sql);
				if ($rows===-1)
					return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Looking for usage:" .$this->my->getLastErr()]);
		        
		        $numTot = 0;
		        $tipTot = 0;
		        if ($rows!==0) {
					$numTot = intval($rows[0]["numTot"]);
					$tipTot = intval($rows[0]["tipTot"]);
		        }
		        
				
				if ($numTot >= intval($call["callsQta"])) {
					$call["status"] = ERR_LIMIT_NUMBER;
					return(["status" => 5, "call" => $call,  "playfile" => "LIMIT_NUMBER", "errMsg" => "Reached limit to calls to this number"]);
				}
				

				if ($numTot >= intval($call["callsQta"])) {
					$call["status"] = ERR_LIMIT_TYPE;
					return(["status" => 5, "call" => $call, "playfile" => "LIMIT_TYPE", "errMsg" => "Reached limit to calls of this type"]);
				}		
			}
		}
	
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// WHERE IS HE CALLING?
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		$sql = "SELECT *
				FROM pfx p
				JOIN tzn t ON t.tznCode = p.tznCode
				WHERE TRIM('$dialedNum') LIKE CONCAT(TRIM(p.pfx),'%')
				ORDER BY LENGTH(TRIM(p.pfx)) DESC
				LIMIT 1";
		
		$rows = $this->my->myGetRows($sql);
		
		if ($rows===-1) {
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "Looking for number:" .$this->my->getLastErr()]);
		}		
		
		if ($rows===0) {
			$call["status"] = ERR_ZONE_NOT_FOUND;
			return(["status" => 5, "call" => $call, "playfile" => "INVALID_DEST", "errMsg" => "Looking for number:" .$this->my->getLastErr()]);
		}

		$destDett = $rows[0];

		$call["minCharge"] 	= 	$destDett["minCharge"];
		$call["pfxId"] 		= 	$destDett["pfxId"];
		$call["tznId"] 		= 	$destDett["tznId"];
		$secsGrace =  intval($destDett["secsGrace"]);
		$call["secsGrace"] 	= 	$secsGrace;
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// WHAT'S THE RATE?
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		

		$dtNow 	= strtotime($timeNow);
		$dtNBeg = strtotime(substr($timeNow,0,10) . " " . $destDett["nrmBeg"]);
		$dtNEnd = strtotime(substr($timeNow,0,10) . " " . $destDett["nrmEnd"]);
		
		if($dtNow  >= $dtNBeg && $dtNow <= $dtNEnd) {
			$rateType = "N";
			$rate = floatval($destDett["nrmPPM"]);
		} else {
			$rateType = "L";
			$rate = floatval($destDett["lowPPM"]);		
		}
		
		$drpCharge = floatVal($destDett["drpCharge"]);
		$call["rateType"] 	=  $rateType;
		$call["rate"] 		=  $rate;
		$call["drpCharge"]		=  $drpCharge;
		$call["drpCharge"]		=  $drpCharge;
		
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// WHAT'S HIS CREDIT?
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DebugBreak("1@192.168.0.101");		
		
		$ret = $this->getDettCredit(["dettId" => $dettId]);
		if ($ret["status"] != 0) {
			return(["status" => 9, "playfile" => "SYSTEM_ERROR", "errMsg" => "getting Credit:" .$this->my->getLastErr()]);
		}
		
		$credit = floatval($ret["credit"]);
		
		$call["creditInit"] = $credit;
		
		if ($credit <= floatval($destDett["minCredit"])) {
			$call["status"] = ERR_NO_CREDIT;
			return(["status" => 5, "call" => $call, "credit" => $credit,  "playfile" => "NO_CREDIT", "errMsg" => "credit less than minCredit"]);
		}	
		
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// BASED ON CREDIT AVAILABLE, HOW LONG COULD HE TALK TO THIS PFX, OTHER LIMITATIONS BESIDES ...
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DebugBreak("1@192.168.0.101");
		$secAvail = (($credit - $drpCharge) / $rate ) * 60;
		if($secAvail<=0) {
			$call["status"] = ERR_NO_CREDIT;
			return(["status" => 5, "call" => $call,  "playfile" => "NO_CREDIT", "errMsg" => "credit less than minCredit"]);
		}
		
		$call["secsAvail"] 	=  round($secAvail,0);

		$ret = $this->getTrunk($call);
		if ($ret["status"] != STATUS_OK) {
			$call["status"] 	=  ERR_NO_TRUNK;
			return(["status" => 5, "call" => $call, "playfile" => "SYSTEM_ERROR", "errMsg" => "getting trunk:" .$ret["errMsg"]]);
		}
		$trunk = $ret["trunk"];
		$call["trunkId"] 	= 	$trunk["trunkId"];
		$call["trunkType"]  =	$trunk["trunkType"];
		$call["trunkStr"]  	=	$trunk["trunkStr"];
        
        if ($call["trunkType"]=="D") 
        	$call["secsGrace"] = 0;
		
		$secsMax = ((intval($call["duration"]) * 60) < intval($call["secsAvail"])) ? intval($call["duration"]) * 60: intval($call["secsAvail"]);
		if ($recoverTime!=0) 
			$secsMax  = ($secsMax  < $recoverTime ) ? $secsMax  : $recoverTime;


		$call["secsMax"] = $secsMax;

// DebugBreak("1@192.168.0.101");		
		return([
			"status" 	=>	STATUS_OK
		,	"recDir"	=>	BASE_DIR . REC_DIR
		,	"call"		=>	$call
		]);			
		
	}
	
	protected function getTimeAvail($req) {
		if(($dettId 	= getVal($req, "dettId"))=="")				return(basicErr("dettId missing"));
		if(($callTip 	= getVal($req, "callTip"))=="")				return(basicErr("callTip missing"));
		if(($callsQta 	= getVal($req, "callsQta"))=="")			return(basicErr("callsQta missing"));
		if(($callsFreq 	= getVal($req, "callsFreq"))=="")			return(basicErr("callsFreq missing"));
		if(($globQta 	= getVal($req, "globQta"))=="")				return(basicErr("globQta missing"));
		if(($globFreq 	= getVal($req, "globFreq"))=="")			return(basicErr("globFreq missing"));

		// how many calls has he made to this number, or of this type in the last month and week...
		
		
		
	}
	
	protected function getTrunk($call) {
		$rows = $this->my->myGetRows("SELECT * FROM trunk WHERE ACTIVE = 1 LIMIT 1");
		if ($rows === -1)	return(basicErr($this->my->getLastErr()));
		if ($rows === 0)	return(basicErr("No trunk found!"));
		return([
			"status"	=> STATUS_OK
		,	"trunk"		=>	$rows[0]
		]);
		
	}
	
	protected function getDettCredit($req) {
		if (($dettId = getVal($req,"dettId"))=="")
			return(basicErr("dettId missing"));
		$sql = "SELECT 
					ROUND(SUM(ric),2) ric
				,	ROUND(SUM(tel),2) tel
				,	ROUND(SUM(amt),2) bal
				FROM  (
					SELECT 
						SUM(ROUND(0,2)) ric
					,	-SUM(ROUND(c.totCharge,2)) tel
					,	-SUM(ROUND(c.totCharge,2)) amt
					FROM callrec c
					WHERE c.dettId = $dettId
				UNION ALL
					SELECT
						SUM(ROUND(r.credamt,2)) ric
					,	SUM(ROUND(0,2))	tel
					,	SUM(ROUND(r.credamt,2)) amt
					FROM recharge r
					WHERE r.dettId = $dettId
				) z";

		$rows = $this->my->myGetRows($sql);
		if ($rows === -1) 	return(basicErr($this->my->getLastErr()));
		if ($rows ===  0)	$credit = 0;
		$credit = $rows[0]["bal"];
		return(["status" => STATUS_OK, "credit" => $credit, "ric" => $rows[0]["ric"], "tel" => $rows[0]["tel"]]);
	}
	
	protected function getBalLine($req) {
		if (($dettId = getVal($req,"dettId"))=="")
			return(basicErr("dettId missing"));
		
		$sql = "SELECT 
				d.dettId
			,	d.lname
			,	d.fname
			,	d.matr
			,	SUM(ROUND(z.cr,2)) totCR
			,	SUM(ROUND(z.db,2)) totDB
			,	SUM(ROUND(z.cr,2)) - SUM(ROUND(z.db,2)) bal
			FROM dett d 
			LEFT JOIN (
				SELECT 
					c.dettId
				,	c.sessDTTM dttm
				,	0	cr
				,	c.totCharge db
				FROM callrec c
				WHERE IFNULL(totCharge,0) > 0 
			UNION ALL
				SELECT
					r.dettId
				,	r.dttm	ddtm
				,	r.credamt cr
				,	0	db
				FROM recharge r
			) z ON z.dettId = d.dettId
			WHERE d.dettId = $dettId";

		$rows = $this->my->myGetRows($sql);
		if ($rows === -1) 	return(basicErr($this->my->getLastErr()));
		if ($rows ===  0)	return(basicErr("No data found"));
		return(["status" => STATUS_OK, "data" => $rows[0]]);
		
	}
	
	protected function delRic($req) {
		if (($rechargeId=getVal($req,"rechargeId"))=="")
			return(basicErr("rechargeId Missing"));
		if (($dettId = getVal($req,"dettId"))=="")
			return(basicErr("dettId missing"));
			
		if (!$this->my->doSQL($sql = "DELETE FROM recharge WHERE rechargeId = $rechargeId"))
			return(basicErr($this->my->getLastErr()));
			
		return($this->getBalLine($req));
			
	}
	
	protected function tznExist($req) {
		if (($tznCode = getVal($req,"tznCode"))=="")	return(basicErr("Manca codice zona"));
		$rows = $this->my->myGetRows("SELECT * FROM tzn WHERE tznCode = '$tznCode'");
		if ($rows===-1)	return(basicErr($this->my->getLastErr()));
		if ($rows===0)	$tznId = 0;
		else			$tznId = $rows[0]["tznId"];
		
		return([
			"status"	=>	STATUS_OK
		,	"tznId"		=>	$rows[0]["tznId"]
		,	"tznDescr"	=>	$rows[0]["tznDescr"]
		]);
		
	}

	protected function tznUsed($req) {
		if (($tznId = getVal($req,"tznId"))=="")	return(basicErr("tznId missing!"));
		
		$rows = $this->my->myGetRows("SELECT COUNT(*) useCount
								FROM tzn t
								JOIN pfx p ON p.tznCode = t.tznCode
								WHERE t.tznId = $tznId");
		if ($rows === -1)		return(basicErr($this->my->getLastErr()));
		if ($rows === 0)		return(basicErr("Query failed!"));
		
		return([
			"status"	=> STATUS_OK
		,	"useCount"	=>	$rows[0]["useCount"]
		]);
		
	}

	protected function tznDelete($req) {
		if (($tznId = getVal($req,"tznId"))=="")	return(basicErr("tznId missing!"));
		$sql = "DELETE FROM tzn WHERE tznId = $tznId";		
		if (!$this->my->doSQL($sql))	return(basicErr($this->my->getLastErr()));
		
		return([
			"status"	=> STATUS_OK
		]);
		
	}
	
	protected function getDest($req) {
		if (($num=getVal($req,"num"))=="")    return(basicErr("Manca numero!"));
		$sql = "SELECT *
				FROM pfx p
				LEFT JOIN tzn t ON t.tznCode = p.tznCode
				WHERE TRIM('$num') LIKE CONCAT(TRIM(p.pfx),'%')
				ORDER BY LENGTH(TRIM(p.pfx)) DESC
				LIMIT 1";
		$rows = $this->my->myGetRows($sql);
		if ($rows===-1)	return(basicErr($this->my->getLastErr()));
		if ($rows===0)	return(basicErr("Numero NON identificato"));
		return([
			"status"	=>	STATUS_OK
		,	"data"		=>	$rows[0]
		]);
	}
    
    protected function compactUID($req) {
		if (($uid_card=getVal($req,"uid"))=="")
			return(basicErr("uid Missing!"));
			
	//////////////////////////////////////////////////////////////////////////////////////
		$tip = "";
		
		if (strlen($uid_card) == 14) {

			$tip = "14";
			

			$uid_hex = $uid_card;     // questo arriva dallo script chiamante (prerequisito: deve essere a 7 byte = 14 char)

			// isolo i 7 byte
			$b1 = substr($uid_hex,0,2);
			$b2 = substr($uid_hex,2,2);
			$b3 = substr($uid_hex,4,2);
			$b4 = substr($uid_hex,6,2);
			$b5 = substr($uid_hex,8,2);
			$b6 = substr($uid_hex,10,2);
			$b7 = substr($uid_hex,12,2);
			// -------------------

			// converto in decimale
			$b1_dec = hexdec($b1);
			$b2_dec = hexdec($b2);
			$b3_dec = hexdec($b3);
			$b4_dec = hexdec($b4);
			$b5_dec = hexdec($b5);
			$b6_dec = hexdec($b6);
			$b7_dec = hexdec($b7);
			// -------------------------
			// ok

			/* ora eseguo lo xor   */
			$new_b1 = $b1_dec ^ $b5_dec;
			$new_b2 = $b2_dec ^ $b6_dec;
			$new_b3 = $b3_dec ^ $b7_dec;
			$new_b4 = $b4_dec;
			/* ora eseguo lo xor   */

			// ritrasformo in xex
			$b1 = dechex($new_b1);
			$b2 = dechex($new_b2);
			$b3 = dechex($new_b3);
			$b4 = dechex($new_b4);

			// ------------------
			/* mettiamo 0 iniziali, se mancano */
			if (strlen($b1) == 1){
			 $b1 = "0".$b1;
			}
			if (strlen($b2) == 1){
			 $b2 = "0".$b2;
			}
			if (strlen($b3) == 1){
			 $b3 = "0".$b3;
			}
			if (strlen($b4) == 1){
			 $b4 = "0".$b4;
			}

			/* qui metto insieme la nuova parola a 4 byte  */
			$uid_hex_compact = $b4.$b1.$b2.$b3;


		} else { // altrimenti la scrivo pari pari nel campo UID_COMPACT
        	$tip = "7";
			$uid_hex_compact = $uid_card;

		}
		
		return([
			"status"	=>	STATUS_OK
		,	"tip"		=>	$tip
		,	"compact"	=>  $uid_hex_compact
		]);
		
	
	//////////////////////////////////////////////////////////////////////////////////////	
    }
    
    protected function saveCard($req) {
		if (($cardId 	= getVal($req,"cardId"))=="")		return(basicErr("Manca cardId"));
		if (($pinOrig 	= getVal($req,"pinOrig"))=="")		return(basicErr("Manca Pin Originale"));
		if (($pin		= getVal($req,"pin"))=="")			return(basicErr("Manca Pin Compatto"));
		if (($serial 	= getVal($req,"serial"))=="")		return(basicErr("Manca Seriale"));
		if (($enabled 	= getVal($req,"enabled"))=="")		return(basicErr("Manca enabled"));

		$cardId = intval($cardId);

		unset($req["action"]);
		unset($req["cardId"]);

		if ($cardId == 0)	{
			$sql = "SELECT * FROM card WHERE pin = '$pin' OR serial = '$serial'";
			$rows = $this->my->myGetRows($sql);
			if ($rows===-1)	return(basicErr($this->my->getLastErr()));
		
			if ($rows===0) {
				$req["dtCreate"] = getTimeInItaly();
				$ret = $this->my->doInsert("card", $req);
				if (!$ret) 
					return(basicErr($this->my->getLastErr()));
				
				return([
					"status"	=>	STATUS_OK
				,	"dtCreate"	=>	getTimeInItaly()
				,	"cardId"	=>	$this->my->getLastInsertId()
				]);
			} else {
				return(basicErr("Impossibile Salvare: Una altra Tessera con questo PIN o SERIALE esiste gia'"));
			}
		} else {		//update
			$sql = "SELECT * FROM card WHERE pin = '$pin' OR serial = '$serial'";
			$rows = $this->my->myGetRows($sql);
			if ($rows===-1)	return(basicErr($this->my->getLastErr()));
			$found = false;
			foreach($rows as $row) {
				if ($row["cardId"]!=$cardId)
					return(basicErr("Impossibile Salvare: Una altra Tessera con questo PIN o SERIALE esiste gia'"));
				else  {
					$found=true;
					$dtCrate = $row["dtCreate"];
				}
			}
			if (!$found) 
				return(basicErr("Impossibile aggiornate: tessera NON trovata"));
			
			$ret = $this->my->doUpdate("card", $req, "cardId=$cardId");
			if (!$ret) 
				return(basicErr($this->my->getLastErr()));
			
			return([
				"status"	=>	STATUS_OK
			,	"dtCreate"	=>	$dtCrate
			,	"cardId"	=>	$cardId
			]);
			
						
		}						
		
    }

	protected function fsCommand($req) {

		
		if (($cmd = getVal($req,"cmd", ""))=="")
			return(basicErr("No 'cmd'!"));
	
		
		if ((@$fp = $this->event_socket_create())==false)
			return(basicErr("Unable to create socket: [" . $this->socketErrNum . "] " . $this->socketErrDescr));

		// $cmd = "api help";
		$response = $this->event_socket_request($fp, $cmd);
		fclose($fp);  
		
		return([
			"status"	=>	STATUS_OK
		,	"response"	=>	$response
		,	"cmd"		=>	$cmd
		]);
		
	}    
    
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
    
    protected function getWeekNum($req) {
		if (($date = getVal($req,"date"))=="")
			return(basicErr("Date missing!"));
    
    	return([
    		"status"	=>	STATUS_OK
    	,	"weekno"	=>	$this->getWeekNumFunc($date)
    	]);
    }

	protected function digitsIT($req) {
		if (($number = getVal($req,"n"))=="")
			return(basicErr("Manca 'n'"));
			
		$say = "";
		
		if (intval($number)==0) {
			$say = "zero";
		} else {
			
			$m = floor($number / 1000000);
			switch($m) {
				case "0"	: $say .= "";			break;
				case "1"	: $say .= "un milione";	break;
				default		: $say .= $this->say3IT($m) . " " . "milioni" ;
			}
			$say.=" ";
			
			$number = $number % 1000000;
			$t = floor($number / 1000);
			switch($t) {
				case "0"	: $say .= "";		break;
				case "1"	: $say .= "mille";	break;
				default		: $say .= $this->say3IT($t) . " " . "mila" ;
			}
			
			$number = $number % 1000;

	// DebugBreak("1@192.168.0.101");		

			if (($number==0 &&  $say=="") || $number!=0 )
				$say = trim($say . " " . $this->say3IT($number % 1000));
				
		}		
		
		
		return([
			"status"	=> STATUS_OK
		,	"say"		=> explode(" ",$say)
		]);
		
	}

	protected function sayBalIT($req) {
		if (($amt = getVal($req,"amt"))=="")
			return(basicErr("no amount specified"));

		$sayBal = [];
		
		$sayBal[] = "credito_residuo"; 
		
		if(floatVal($amt)==0) {
			$sayBal[] = "zero";
			$sayBal[] = "euro";
		} else {
			if (strpos($amt,".")===false)
				$amt .= ".00";
			$parts = explode(".", $amt);

			$ret = $this->digitsIT(["n" => $parts[0]]);
			foreach($ret["say"] as $s)
				$sayBal[] = $s;

			$sayBal[] = "euro";
			if (sizeof($parts)==1) {
				$sayBal[] = "zero";
				$sayBal[] = "cent";
			} else {
				$ret = $this->digitsIT(["n" => $parts[1]]);
				foreach($ret["say"] as $s)
					$sayBal[] = $s;

				$sayBal[] = "centesimi";
			}
		}
		
		return(["status" => STATUS_OK, "say" => $sayBal]);
		
					
	}
    
    protected function say3IT($number) {
		$number = intval($number);
		
		if ($number==0)		return ("zero");
		
		$say = "";
		
		$h = floor($number / 100);
		switch ($h) {
			case "0":	
				$say = $this->say2IT($h % 100);							
				break;
			
			case "1":	
				$say = "cento" . " " . $this->say2IT($number % 100);			
				break;
			
			default	:	
				$say = $this->say2IT($h) 
					. " " . "cento" 
					. " " . $this->say2IT($number % 100); break;
		}
		
		
		return(trim($say . " " . $this->say2IT($number)));
		
		
		
	}    	
    	
	protected function say2IT($n) {
		$say = "";

		switch($n) {
			case 0	:	$say = "";  			break; 	
			case 1	:	$say = "uno";  			break; 
			case 2	:	$say = "due";  			break; 
			case 3	:	$say = "tre";  			break; 
			case 4	:	$say = "quattro";  		break;
			case 5	:	$say = "cinque";  		break; 
			case 6	:	$say = "sei";  			break; 
			case 7	:	$say = "sette";  		break; 
			case 8	:	$say = "otto";  		break; 
			case 9	:	$say = "nove";  		break; 
			
			case 10	:	$say = "dieci";  		break; 
			case 11 :	$say = "undici";  		break;
			case 12 :	$say = "dodici";  		break;
			case 13 :	$say = "tredici";  		break;
			case 14 :	$say = "quattordici"; 	break;
			case 15 :	$say = "quindici";  	break;
			case 16 :	$say = "sedici";  		break;
			case 17 :	$say = "diciasette";  	break;
			case 18 :	$say = "diciotto";  	break;
			case 19 :	$say = "dicianove";  	break;
			
			default :
				if ($n >= 20 && $n <=29)	$say = "venti" 		. " " . $this->say2IT($n % 10);
				if ($n >= 30 && $n <=39)	$say = "trenta" 	. " " . $this->say2IT($n % 10);
				if ($n >= 40 && $n <=49)	$say = "quaranta" 	. " " . $this->say2IT($n % 10);
				if ($n >= 50 && $n <=59)	$say = "cinquanta" 	. " " . $this->say2IT($n % 10);
				if ($n >= 60 && $n <=69)	$say = "sessanta" 	. " " . $this->say2IT($n % 10);
				if ($n >= 70 && $n <=79)	$say = "settanta" 	. " " . $this->say2IT($n % 10);
				if ($n >= 80 && $n <=89)	$say = "ottanta" 	. " " . $this->say2IT($n % 10);
				if ($n >= 90 && $n <=99)	$say = "novanta" 	. " " . $this->say2IT($n % 10);
				break;						
		}
		
		$v= array('a','e','i','o','u');
		// drop double vowel
// DebugBreak("1@192.168.0.101");
		$p = explode(" ",$say);
		if (sizeof($p) <2)	return($say);
		$a = $p[0];
		$b = $p[1];
		$aLen = strlen($a);
		$endA = substr($a, $aLen - 1, 1);
		$begB = substr($b,0,1);
		if(in_array($endA,$v) && in_array($begB,$v))
			return(substr($a,0,$aLen-1) . " " . $b);
		else
			return($a . " " . $b);
		
	}
    
    protected function loadCallStruct($req) {

		if (($dettId = getVal($req,"dettId"))=="")
			return(basicErr("dettId missing!"));

		$sql = "SELECT * FROM wl WHERE dettId = $dettId";
		$rows = $this->my->myGetRows($sql);
		if($rows===-1)	return(basicErr($this->my->getLastErr()));		
		if($rows===0)	$rows = [];
		return([
			"status"		=> 	STATUS_OK
		,	"callStruct"	=>	$rows
		,	
		]);
    }
    
    protected function saveCallStruct($req) {
		// DebugBreak("1@192.168.0.101");		

		if (($dettId = getVal($req,"dettId"))=="")
			return(basicErr("dettId missing!"));

		$callStructJSON = getVal($req,"callStruct");
		if ($callStructJSON!="") {
			$callStruct = json_decode($callStructJSON, true);
		}
		$sql = "DELETE FROM wl WHERE dettId = $dettId";
		if (!$this->my->doSQL($sql))
			return(basicErr($this->my->getLastErr()));

		foreach($callStruct as $cs) {
			$cs["dettId"] = $dettId;
			if (!$this->my->doInsert("wl", $cs))
				return(basicErr($this->my->getLastErr()));
		}		
		
		
		return([
			"status"	=>	STATUS_OK
		]);		
    }

	function freeCard($req) {
		if (($serial = getVal($req,"serial"))=="")
			return(basicErr("Serial missing"));
			
		$sql = "UPDATE dett SET card=NULL WHERE card = '$serial'";
		if (!$this->my->doSQL($sql)) {
			return(basicErr($this->my->getLastErr()));
		}
		return(["status" => STATUS_OK]);
		
	}

	function endCall($req) {
		
		if (($uid = getVal($req,"uid"))=="")
			return(basicErr("uid missing"));
			
		return($this->fsCommand(["cmd" => "api uuid_kill $uid"]));
		
	}
    
    function spy ($req) {
		if(($ext = getVal($req,"ext"))=="") return(basicErr("ext missing"));
		if(($uid = getVal($req,"uid"))=="") return(basicErr("uid missing"));
		
		return($this->fsCommand(["cmd" => "api originate {sip_secure_media=true}user/$ext 'queue_dtmf:w0@500,eavesdrop:$uid inline"]));
		
		// return($this->fsCommand(["cmd" => "api originate user/$ext &eavesdrop($uid)"]));
		
    }
    
    ///////////////////// CALL HANDLING
    
    protected function sessBeg($req) {
		if (($uuid 		= getVal($req, "uuid"))=="") 	return(basicErr("uuid Missing!"));
		if (($ext 		= getVal($req, "ext"))=="")  	return(basicErr("ext Missing!"));
		if (($digits 	= getVal($req, "digits"))=="")  return(basicErr("digits Missing!"));
		
		
		
		
		
		
    }
    
    
	///////////////////// NON websvc functions    
    
    protected function getWeekNumFunc($date) {
    	
		$beg = strtotime("1980-01-07");
		$end = strtotime($date);

		$diff = floor(ceil(abs($end - $beg) / 86400)/7);
    	return($diff);
    }
    
    
    
    protected function prep($s)  {
        return(json_encode(utfEncodeArray($s)));        
    }
 
    ////////////////// CLASS CONSTRUCTOR / DESTRUCTOR //////////////////////////    
    function __construct() {
    	
    	$this->my = new mySqliDb(T3_SRV, T3_USR, T3_PWD, T3_DB);
    
    	$sql = "SELECT code, name FROM statcodes";
    	$rows = $this->my->myGetRows($sql);
    	if ($rows!==0 && $rows!==-1) {
			foreach ($rows as $row) {
				define($row["name"], $row["code"]);
			}
    	}
    
    	$sql = "SELECT constName, constVal FROM const";
    	$rows = $this->my->myGetRows($sql);
    	if ($rows!==0 && $rows!==-1) {
			foreach ($rows as $row) {
				define($row["constName"], $row["constVal"]);
			}
    	}
    }
    
    function __destruct() {
    	unset($this->my);
    }    
}


/**
 * Disk Status Class
 *
 * http://pmav.eu/stuff/php-disk-status/
 *
 * v1.0 - 17/Oct/2008
 * v1.1 - 22/Ago/2009 (Exceptions added.)
 */

class DiskStatus {

	const RAW_OUTPUT = true;

	private $diskPath;


	function __construct($diskPath) {
		$this->diskPath = $diskPath;
	}


	public function totalSpace($rawOutput = false) {
		$diskTotalSpace = @disk_total_space($this->diskPath);

		if ($diskTotalSpace === FALSE) {
			throw new Exception('totalSpace(): Invalid disk path.');
		}

		return $rawOutput ? $diskTotalSpace : $this->addUnits($diskTotalSpace);
	}


	public function freeSpace($rawOutput = false) {
		$diskFreeSpace = @disk_free_space($this->diskPath);

		if ($diskFreeSpace === FALSE) {
			throw new Exception('freeSpace(): Invalid disk path.');
		}

		return $rawOutput ? $diskFreeSpace : $this->addUnits($diskFreeSpace);
	}


	public function usedSpace($precision = 1) {
		try {
			return round((100 - ($this->freeSpace(self::RAW_OUTPUT) / $this->totalSpace(self::RAW_OUTPUT)) * 100), $precision);
			} catch (Exception $e) {
			throw $e;
		}
	}


	public function getDiskPath() {
		return $this->diskPath;
	}


	public function addUnits($bytes) {
		$units = array( 'B', 'KB', 'MB', 'GB', 'TB' );

		for($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++ ) {
			$bytes /= 1024;
		}

		return round($bytes, 1).' '.$units[$i];
	}

}



?>
    
