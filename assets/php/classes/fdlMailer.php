<?php

if (!defined("SMTP_SRV"))           define("SMTP_SRV",          "smtps.aruba.it");
if (!defined("SMTP_USER"))          define("SMTP_USER",         "francesco.delagarda@shenker.com");
if (!defined("SMTP_PASSWORD"))      define("SMTP_PASSWORD",     "fr4nc35c03358c!");
if (!defined("SMTP_SECURE"))        define("SMTP_SECURE",       "ssl");                            // Enable TLS encryption, `ssl` also accepted
if (!defined("SMTP_PORT"))          define("SMTP_PORT",         "465");   
if (!defined("SMTP_FROM_NAME"))     define("SMTP_FROM_NAME",    "Shenker e-Comm (No Reply)");
if (!defined("SMTP_FROM_EMAIL"))    define("SMTP_FROM_EMAIL",   "noreply@shenker.com");

/**********
FOR "sendEmailFromTP" 

    public function sendEmailFromTP ($vars, $imgArr = null)

    vars is an array, must contain dests as follows:

        array $dstArr as follows:
        $dstArr = "$dstTip~" . $dstName . "~" . $dstEmail
        example "T~Francesco Facco~francesco@delagarda.com|C~Mairelys Blanco~mairelys@delagarda.com"
        $vars["dstArr"]     =   $dstArr;

        $vars["subject"]    =   $subject

        image Array with images to appear .. (multiple ..)
        $imgArr[] = [url => "pics/image1.jpg",short => "image1"];
        $imgArr[] = [url => "pics/image2.jpg",short => "image2"];

        $vars["tpName"] = .. template full path
        
        template substitutes ...
        $vars["sub1"] = ..
        $vars["sub2"] = ..
        example
        $vars["name"] = "Francesco Facco de Lagarda";
        $vars["tel"] = "333 1234567";
    
FOR "emailSendNew"
    
    public function emailSendNew($dstArr, $subject,  $body, $alt, $imgArr = null)
        $dstArr as above
        $imgArr as above
        
        rest is obvious ;)
 
****/

////////////////// TEST BEG //////////////////



/**
$smtpPars = [
    "smtpSrv"           =>  SMTP_SRV
,   "smtpUser"          =>  SMTP_USER
,   "smtpPassword"      =>  SMTP_PASSWORD
,   "smtpSecure"        =>  SMTP_SECURE
,   "smtpPort"          =>  SMTP_PORT
,   "smtpFromName"      =>  SMTP_FROM_NAME
,   "smtpFromEmail"     =>  SMTP_FROM_EMAIL
];


$mailer = new fdlMailer($smtpPars);

$dstArr = "T~Francesco dlg~francesco@delagarda.com|C~Francesco shk~francesco.delagarda@shenker.com";

$imgArr[] = ["url" => "../shenkerPics/quiz-small.jpg","short" => "quiz-small"] ;
$imgArr[] = ["url" => "../shenkerPics/finish.jpg","short" => "finish"] ;

// if ($mailer->emailSendNew($dstArr, "TEST EMAIL",  "Hello World!", "Hello World", $imgArr)) 
//    echo "Email sent!";
// else
//    echo $mailer->getLastErrMsg();

$vars["dstArr"]     =   $dstArr;
$vars["subject"]    =   "Prova con TP";
$vars["tpName"] = "./testtp.html";
$vars["nome"] = "Francesco";
$vars["cognome"] = "Facco de Lagarda";

if ($mailer->sendEmailFromTP ($vars, $imgArr ))
    echo "Email sent!";
else
    echo $mailer->getLastErrMsg();

**/
    
////////////////// TEST END //////////////////


class fdlMailer {
    
    
    private $lastErrMsg = "";
    private $lastStatus = -1;

    private $smtpSrv = "";
    private $smtpUser = "";
    private $smtpPassword = "";
    private $smtpSecure = "";
    private $smtpPort = "";
    private $smtpFromName  = "";
    private $smtpFromEmail = "";
    
    public function getLastErrMsg() {
        return($this->lastErrMsg);
    }

    public function __construct($smtpPars = null) {



        if ($smtpPars!=null) {
	        $this->smtpSrv          = getVal($smtpPars, "smtpSrv");
	        $this->smtpUser         = getVal($smtpPars, "smtpUser");
	        $this->smtpPassword     = getVal($smtpPars, "smtpPassword");
	        $this->smtpSecure       = getVal($smtpPars, "smtpSecure", "none");
	        $this->smtpPort         = getVal($smtpPars, "smtpPort", 25); 
	        $this->smtpFromEmail    = getVal($smtpPars, "smtpFromEmail");
	        $this->smtpFromName     = getVal($smtpPars, "smtpFromName", $this->smtpFromEmail);
		} else {
			$this->smtpSrv          = SMTP_SRV;
			$this->smtpUser         = SMTP_USER;
			$this->smtpPassword     = SMTP_PASSWORD;
			$this->smtpSecure       = SMTP_SECURE;
			$this->smtpPort         = SMTP_PORT;
			$this->smtpFromName     = SMTP_FROM_NAME;
			$this->smtpFromEmail    = SMTP_FROM_EMAIL;
		}
    }    

    
    public function sendEmailFromTP ($vars, $imgArr = null, $attachArr=null) {

        
        $body = "";
   
        $fp = fopen($vars["tpName"], "r");
        if (!$fp) {
            $lastErrMsg = "FAILED to load template: ".$vars["tpName"];
            return(false);
        } else {
            while($s = fgets($fp))
                $body .= "$s\n";
            fclose($fp);
        }        
        
        foreach($vars as $k => $v)    {
 // DebugBreak("1@192.168.100.3");
            $body = str_replace("%%".$k."%%", $v, $body);    
		}

        return($this->emailSendNew(
            $vars["dstArr"]
        ,   $vars["subject"]
        ,   $body
        ,   $body
        ,   $imgArr
        ,	$attachArr
        ));
        
    }
    
    public function emailSendNew($dstArr, $subject,  $body, $alt=null, $imgArr = null, $attachArr=null) {
  
        // try {
  			if ($alt==null)	$alt="";
  			if ($alt=="")	$alt=$body;			
    
            $mail = new PHPMailer;
            
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ];    
        
            $mail->SMTPDebug = 0;                               // Enable verbose debug output

            $mail->isSMTP();                                        // Set mailer to use SMTP
            $mail->Host = $this->smtpSrv;                                 // Specify main and backup SMTP servers
            $mail->SMTPAuth = true;                                 // Enable SMTP authentication
            if ($this->smtpUser != "")        $mail->Username = $this->smtpUser;                            // SMTP username
            if ($this->smtpPassword != "")    $mail->Password = $this->smtpPassword; //SMTP password
            if ($this->smtpSecure != "")      $mail->SMTPSecure = $this->smtpSecure;  // Enable TLS encryption, `ssl` also accepted
            $mail->Port = $this->smtpPort;                                // TCP port to connect to
            $mail->charSet = "UTF-8";
            $mail->setFrom($this->smtpFromEmail, $this->smtpFromName);
            $mail->addReplyTo($this->smtpFromEmail, $this->smtpFromName);
            
            // DebugBreak("1@dev.delagarda.com");

            if ($attachArr!=null) {
				foreach($attachArr as $att) {
					// $mail->addAttachment($att, basename($att), $encoding, $type);
					$mail->addAttachment($att, basename($att));
				}
			}            
            	
            
            
            $dsts = explode ("|", $dstArr);
            foreach($dsts as $dst) {
                $dstParts = explode("~", $dst);
                if (sizeof($dstParts) > 2) {
                    switch(strtoupper($dst[0])) {
                        case "T" :  $mail->addAddress($dstParts[2], $dstParts[1]);                       
                        case "C" :  $mail->addCC($dstParts[2], $dstParts[1]);                       
                        case "B" :  $mail->addBCC($dstParts[2], $dstParts[1]);                       
                    }
                }
            }
            

            $mail->isHTML(true);                                  // Set email format to HTML

    //        $mail->AddEmbeddedImage(LOGO_FULLNAME, 'logoShenker');

            if ($imgArr!=null) {
                foreach ($imgArr as $img) {
                    $mail->AddEmbeddedImage($img["url"], $img["short"]);
                }
                
            }
            
            $mail->Subject = $subject;

            $mail->Body    = $body;
            $mail->AltBody = $alt;

            // @$mail->Send();
            // return(true);

    /***    
    } catch (phpmailerException $e) {
        
          $lastErrMsg = $e->errorMessage(); //Pretty error messages from PHPMailer
          return(false);
        
        } catch (Exception $e) {
        
          $lastErrMsg = $e->getMessage(); //Boring error messages from anything else!
          return(false);
        
        }        
        
    **/
        try {
            if(!@$mail->send()) {
                $this->lastErrMsg = '***SMPT ERROR : [' . $this->tsShort . '] ' . $mail->ErrorInfo."\n\t\t". __FILE__ . ":" . __FUNCTION__ . ":" . __LINE_;
                return(false);
            } else {
                return(true);
            }        
        } catch (Exception $e) {
            $this->lastErrMsg = '***SMPT ERROR : [' . $this->tsShort . '] ' . $e->message."\n\t\t". __FILE__ . ":" . __FUNCTION__ . ":" . __LINE__;
            return(false);
        }

        
        if(!$mail->send()) {
            $this->lastErrMsg = '***SMPT ERROR : [' . $this->tsShort . '] ' . $mail->ErrorInfo."\n\t\t". __FILE__ . ":" . __FUNCTION__ . ":" . __LINE__;
            return(false);
        } else {
            return(true);
        }        
        
        
    }
}        

?>