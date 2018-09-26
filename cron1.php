#!/usr/bin/php

<?php
require_once("./assets/php/config.php");

$filename = CRON_LOG_DIR . date("Y-m-d").".log";

$txt = date("H:i:s"). " - " . "Hello World!";
file_put_contents($filename, $txt.PHP_EOL , FILE_APPEND );	

	

?>