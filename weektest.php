<?php

echo "<pre>";

// convert fro STUPID AMERICAN FORMAT ...
$dayToday = (date('w') +6) % 7	;
echo "today day : $dayToday\n";
$dtFrom = date('Y-m-d', strtotime('-'.$dayToday.' days')) . " 00:00:00";
echo "dtFrom: $dtFrom\n";

echo "\n\n";
$dateToday = date('d');
echo "date today : $dateToday\n";
$dtFrom = date('Y-m-d', strtotime('-'.($dateToday-1).' days')) . " 00:00:00";
echo "dtFrom: $dtFrom\n";

echo "\n\n";

/**
$back = (date('w') +6) % 7;	
echo "back $back\n";
$limitW = date('Y-m-d', strtotime('-'.$back.' days')) + " 00:00:00";
echo "Week Begin : $limitW\n";

$back = date('d') - 1;      
echo "back $back\n";
$limitM = date('Y-m-d', strtotime('-'.$back.' days')) + " 00:00:00";
echo "Mnth Begin : $limitM\n";
**/



$limitW = date('Y-m-d', strtotime('-'.((date('w') +6) % 7).' days')) . " 00:00:00";
echo "limitW: $limitW\n";

$limitM = date('Y-m-d', strtotime('-'.(date('d') - 1).' days')) . " 00:00:00";
echo "limitW: $limitM\n";
?>

