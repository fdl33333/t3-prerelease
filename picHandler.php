<?php

define("PIC_DIR", 		"./pics/");
define("MAX_THUMB_H", 		200);
define("MAX_THUMB_W", 		200);


const IMAGE_HANDLERS = [
	IMAGETYPE_JPEG => [
		'load' => 'imagecreatefromjpeg',
		'save' => 'imagejpeg',
		'quality' => 100
	],
	IMAGETYPE_PNG => [
		'load' => 'imagecreatefrompng',
		'save' => 'imagepng',
		'quality' => 0
	],
	IMAGETYPE_GIF => [
		'load' => 'imagecreatefromgif',
		'save' => 'imagegif'
	]
];



switch($_REQUEST["action"]) {
	case "loadImage": 		getPic($_REQUEST);		break;
	case "uploadImage": 	setPic($_REQUEST);		break;
}

function getPic($pars) {
	// DebugBreak("1@192.168.0.101");

    // if (($id =  $pars["itemValue"])=="")	return;
    if (($id =  $pars["itemValue"])=="") 
    	$fname =  PIC_DIR . "nophoto.jpg";
    else
    	$fname =  PIC_DIR . $id . "_t.jpg";
    if (file_exists($fname)) {
		header("Content-Type: image/jpg");
    	print_r(file_get_contents($fname));		
	}
}

function setPic($pars) {
 
 	$fnOrig = $_FILES["file"]["name"];
	$ext = strtolower(explode(".",$fnOrig)[1]);
	$uid = uniqid();
	$fnNew = PIC_DIR . $uid . "." . $ext; 	
	$thumb = PIC_DIR . $uid . "_t." . $ext; 	

	
	move_uploaded_file($_FILES["file"]["tmp_name"], $fnNew);

	$type = exif_imagetype($fnNew);

	if (!$type || !IMAGE_HANDLERS[$type]) 
		return;

	// load the image with the correct loader
	$image = call_user_func(IMAGE_HANDLERS[$type]['load'], $fnNew);

	if (!$image) {
		return;	        
	}

	$width = imagesx($image);
	$height = imagesy($image);

	    // get width to height ratio
	$ratio = $width / $height;

	if ($width > $height) {
		$thumbW = MAX_THUMB_W;
		$thumbH	= floor($height / $width * MAX_THUMB_W);
	} else {
		$thumbH = MAX_THUMB_H;
		$thumbW = floor($width / $height * MAX_THUMB_H);
	}
	// create duplicate image based on calculated target size
	$thumbnail = imagecreatetruecolor(MAX_THUMB_W, MAX_THUMB_H);
	
	
	// set transparency options for GIFs and PNGs
	if ($type == IMAGETYPE_GIF || $type == IMAGETYPE_PNG) {
	    imagecolortransparent(
	        $thumbnail,
	        imagecolorallocate($thumbnail, 0, 0, 0)
	    );
	    if ($type == IMAGETYPE_PNG) {
	        imagealphablending($thumbnail, false);
	        imagesavealpha($thumbnail, true);
	    }
	} else {
		// thumbnail background white, change at will
		$bg= imagecolorallocate($thumbnail, 255, 255, 255);
		imagefill($thumbnail, 0, 0, $bg);
	}

	$dx = floor((200 -$thumbW)/2);
	$dy = floor((200 -$thumbH)/2);
	
	
	imagecopyresampled(
	    $thumbnail,
	    $image,
	    $dx, $dy, 0, 0,
	    $thumbW, $thumbH,
	    $width, $height
	);
	
	// save the duplicate version of the image to disk
	$ret = call_user_func(
	    IMAGE_HANDLERS[$type]['save'],
	    $thumbnail,
	    $thumb,
	    IMAGE_HANDLERS[$type]['quality']
	);
	if ($ret==1) {
		header("Content-Type: text/html; charset=utf-8");
		print_r("{state: true, itemId: '".$pars["itemId"]."', itemValue: '".$uid."'}");    	
	}
	
}


?>