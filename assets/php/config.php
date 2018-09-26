<?php

define("STATUS_OK"      ,   0);
define("STATUS_ERROR"   ,   9);

define("T3_SRV"     	,   'localhost');
define("T3_USR"     	,   'root');
define("T3_PWD"     	,   'passw0rd');
define("T3_DB"      	,   'telispe3');
define("T3_PORT"    	,   3306);



define("TOLD_SRV"     	,   'localhost');
define("TOLD_USR"     	,   'root');
define("TOLD_PWD"     	,   'passw0rd');
define("TOLD_DB"      	,   'telispeold');
define("TOLD_PORT"    	,   3306);

define("LOGDIR"			, 	"../logs");


define("HOLD_MUSIC"		,	"/usr/share/freeswitch/sounds/music/8000/danza-espanola-op-37-h-142-xii-arabesca.wav");
define("WARN_MSG"		,	"/usr/share/freeswitch/sounds/t3/IT_TIME_ENDING.wav");

define("FS_PWD"			,	"ClueCon");
define("FS_HOST"		,	"127.0.0.1");
define("FS_PORT"		,	"8021");


define("CODE_N"			,	"71");
define("CODE_A"			,	"72");



/***
define("ALL_OK"				, 0);
define("ERR_CARD_MISSING"	, 9101);
define("ERR_CARD_UNKNOWN"	, 9102);
define("ERR_CARD_ORPHAN"	, 9103);
define("ERR_NUM_NOT_WL"		, 9201);
define("ERR_NUM_EXPIRED"	, 9202);
define("ERR_ZONE_NOT_FOUND"	, 9203);
define("ERR_NO_TRUNK"		, 9301);
define("ERR_NO_CREDIT"		, 9401);
define("ERR_NO_TIME_GLOB"	, 9402);
define("ERR_NO_TIME_NUMBER"	, 9403);
define("ERR_NO_ANSWER"		, 9501);
**/

define("EXT_DIR",	"/etc/freeswitch/directory/default/");


/**
define("SMTP_SRV",          "");
define("SMTP_USER",         "");
define("SMTP_PASSWORD",     "");
define("SMTP_SECURE",       "tls");                          
define("SMTP_PORT",         587);   
define("SMTP_FROM_NAME",    "");
define("SMTP_FROM_EMAIL",   "");
define("SMTP_AUTH",         true);
**/

define("CRON_LOG_DIR", "/var/www/html/cronlogs/");
define("BASE_DIR",	"/var/www/html/");
define("REC_DIR",	"rec/");
define("MP3_DIR",	REC_DIR . "mp3/");
define("WAV_DIR",	REC_DIR . "wav/");


define("EXT_TEMPLATE", '<include>
	<user id="%%ext%%">
		<params>
			<param name="password" value="%%pwd%%"/>
			<param name="vm-password" value="%%ext%%"/>
		</params>
		<variables>
			<variable name="toll_allow" value="domestic,international,local"/>
			<variable name="accountcode" value="%%ext%%"/>
			<variable name="user_context" value="default"/>
			<variable name="effective_caller_id_name" value="Interno %%ext%%"/>
			<variable name="effective_caller_id_number" value="%%ext%%"/>
			<variable name="outbound_caller_id_name" value="$${outbound_caller_name}"/>
			<variable name="outbound_caller_id_number" value="$${outbound_caller_id}"/>
			<variable name="callgroup" value="techsupport"/>
		</variables>
	</user>
</include>');


?>