<?php
/***
define ("MY_SRV",   "localhost");
define ("MY_UID",   "root");
define ("MY_PWD",   "passw0rd");
define ("MY_PORT",  3306);
define ("MY_DB",    "sakila");
***/
/***

echo "<pre>";

$my = new mySqliDb();

$my->setAutoCommit(false) ;
echo "\n=============\nDELETING\n=============\n";
if (!$my->doDelete("actor", ""))
    echo "\n*****" . $my->getLastErr() . "\n" . $my->getLastSql();

echo "\n=============\nSELECTING\n=============\n";

$rows = $my->doSelect("actor", "*", "last_name LIKE '%F%'");
if ($rows) {
    foreach($rows as $r) 
        echo $r["first_name"]." ".$r["last_name"]."\n";
} else
    echo $my->getLastErr();
    
echo "\n=============\nROLLBACK\n=============\n";
echo "\n=============\nSELECTING\n=============\n";
$rows = $my->doSelect("actor", "*", "last_name LIKE '%F%'");
if ($rows) {
    foreach($rows as $r) 
        echo $r["first_name"]." ".$r["last_name"]."\n";
} else
    echo $my->getLastErr() . "\n" . $my->getLastSql();
**/
 
/*** 
 // UPDATEUPDATE
$data = ["first_name" => "Filippo", "last_name" => "Facco de Lagarda"];
$cond = "actor_id = 202";
$my->doUpdate("actor", $data, $cond);

// INSERT
$res = $my->doInsert("actor", $data);
if (!$res) 
    echo "ERROR INSERTING:". $my->getLastErr() . "\n";
**/
/**    
$rows = $my->getSQL("SELECT * FROM actor WHERE last_name LIKE 'Facco%'");
if ($rows) {
    foreach($rows as $r) 
        echo $r["first_name"]." ".$r["last_name"]."\n";
} else
    echo $my->getLastErr();
**/
    

class mySqliDb {

    private $isOpen = false;
    
    protected $conn = null;
    
    protected $mySrv;
    protected $myPort;
    protected $myUid;
    protected $myPwd;
    protected $myDb;
    protected $lastTable;
    protected $lastData;
    protected $lastCond;
    protected $lastOp;
    protected $lastSql;
    protected $lastErr = "";
    protected $lastInsertId;
    protected $affectedRows = 0;
    
    public function getConn() {
        return($this->conn);        
    }
    
    public function isOpen() {
        return($this->isOpen);
    }
    
    public function setAutoCommit($tf) {
        $this->conn->autocommit($tf);
    }
    
    public function commit() {
        $this->conn->commit();
    }
    
    public function rollback() {
        $this->conn->rollback();
    }
    
    public function getLastInsertId() {
        return($this->conn->insert_id);
    }
    
    public function doSelect($table, $what, $condition = "", $order = "") {
        $lastOp = "SELECT";
        $lastTable = $table;
        $lastData = null;
        $lastCond = $condition;
        
        $sql = "SELECT $what\nFROM $table";
        if($condition!="")  $sql.= "\nWHERE $condition";
        if($order!="")      $sql.= "\nORDER BY $order";
        
        return($this->getSQL($sql));
    }
    
    public function doDelete($table, $condition) {
        $lastOp = "DELETE";
        $lastTable = $table;
        $lastData = null;
        $lastCond = $condition;
        $sql = "DELETE FROM $table";
        if ($condition!="") $sql.= "\nWHERE $condition";
        return($this->doSQL($sql));
    }
    
    public function doUpdate($table, $data, $condition)  {
        $lastOp = "UPDATE";
        $lastTable = $table;
        $lastData = $data;
        $lastCond = $condition;
        
        if (!($this->myCheckConn()))  
            return(false);

        $sql = "UPDATE $table ";    
        
        $temp = "";
        foreach ($data as $k=>$v) {
            if($temp!="") $temp.="\n,\t";
            $temp.=$k . " = '" . $this->conn->real_escape_string($v) . "'";        
        }
        $sql .= "\nSET $temp\n";
        if ($condition!="")
            $sql .= "WHERE $condition";
        
        return($this->doSQL($sql));
        
    }
 
    public function esc($s)  {
        return($this->conn->real_escape_string($s));
    }

    public function doInsert($table, $data) {

// DebugBreak("1@192.168.0.101");        

        $lastOp = "INSERT";
        $lastTable = $table;
        $lastData = $data;
        $lastCond = "";

        if (!($this->myCheckConn()))  
            return(false);

        $sql = "INSERT INTO $table ";    
        $temp = "";
        foreach ($data as $k=>$v) {
            if($temp!="") $temp.=", ";
            $temp.=$k;        
        }
        $sql .= "\n($temp)\n";

        $temp = "";
        foreach ($data as $k=>$v) {
            if($temp!="") $temp.=", ";
            $vesc = $this->conn->real_escape_string($v);
            $temp.="'$vesc'";        
        }
        $sql .= "VALUES\n($temp)";
        return($this->doSQL($sql));
    }

    public function  myGetRows($sql) {

        if (!($this->myCheckConn()))  
            return(-1);
        
        $rows=$this->getSQL($sql);
        
        if ($rows===false) return(-1);
        if ($rows==null)   return(0);
            
        return($rows);
              
    }      
    
    public function myGetRes($sql) {

        $this->lastSql = $sql;
        
        $this->lastErr = "";
        
        if (!($this->myCheckConn()))  
            return(false);
        
        if (!($res=$this->conn->query($sql))) {
            $this->lastErr = $this->conn->error; 
            return(false);
        } 

        return($res);        
    }
                 
    public function getSQL($sql) {

        $this->lastSql = $sql;
        
        $this->lastErr = "";
        
        if (!($this->myCheckConn()))  
            return(false);
        
        $this->conn->query("SET NAMES 'utf8' COLLATE 'utf8_general_ci'");	
        if (!($res=$this->conn->query($sql))) {
            $this->lastErr = $this->conn->error; 
            return(false);
        } 
        
        $rows = [];
        while($row = $res->fetch_assoc())
            $rows[] = $row;

        return($rows);
        
        $res->close();
        // $this->conn->close();
        
    }
 
    public function doSQL($sql) {

        $this->lastSql = $sql;
        
        $this->lastErr = "";
        
        if (!($this->myCheckConn()))  
            return(false);
        
        if (!($res=$this->conn->query($sql))) {
            $this->lastErr = $this->conn->error; 
            return(false);
        } 
		$this->affectedRows = $this->conn->affected_rows;
        return(true);        
    }
    
    protected function myCheckConn() {    
        
        $this->lastErr = "";
        
        if ($this->conn==null) {
            $this->conn = @new mysqli($this->mySrv, $this->myUid, $this->myPwd, $this->myDb, $this->myPort );
            
            if (mysqli_connect_error()) {
                $this->lastErr =  mysqli_connect_error();
                $this->conn = null;
                $this->isOpen = false;
                return(false);
            }   
            $this->conn->query("SET NAMES 'utf8' COLLATE 'utf8_general_ci'");	
            $this->isOpen = true;
            return(true);
        } else {
            $this->isOpen = true;
            return(true);
        }
    }       

    public function getLastErr() {
        return($this->lastErr);
    } 

    public function getAffectedRows() {
		return($this->affectedRows);
    }
    
    public function getLastSql() {
        return($this->lastSql);
    } 
    
    function __construct($mySrv , $myUid ="" , $myPwd ="" , $myDb ="" , $myPort = 3306) {

        if ($myUid=="" && $myPwd=="" && $myDb=="") {
			$myPars = explode("|", $mySrv);
	        $this->mySrv  = $myPars[0];
	        $this->myUid  = $myPars[1];
	        $this->myPwd  = $myPars[2];
	        $this->myDb   = $myPars[3];
	        if (sizeof($myPars)>4)
	        	$this->myPort = intval($myPars[4]);
	        else
				$this->myPort = 3306;
        } else {
	        $this->mySrv  = $mySrv;
	        $this->myPort = $myPort;
	        $this->myUid  = $myUid;
	        $this->myPwd  = $myPwd;
	        $this->myDb   = $myDb;
		}
        
        $this->myCheckConn();
    }
    
    function __destruct() {
        
        if($this->conn != null) {
            $this->conn->close();
        }
    }

}


?>