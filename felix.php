<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
<meta name="viewport" content="width=device-width">
<title>Penguins tracking ...</title>
<link 
rel="stylesheet" 
href="http://cdn.leafletjs.com/leaflet-0.7/leaflet.css"/>
<style>
body {
	padding: 0;
	margin: 0;
}
html, body, #map {
	height: 100%;
	width: 100%;
}
</style>

<script type="text/javascript">
var address = '';
//<![CDATA[
function load() {
	// position we will use later
	var lat = 40.73;
	var lon = -74.00;

	// initialize map
	map = L.map('map').setView([lat, lon], 9);

	// set map tiles source
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: 'Author &copy; <a href="https://www.tekroconsulting.it/">Tekro Consulting Srls</a>',
		maxZoom: 18,
	}).addTo(map);

	// Change this depending on the name of your PHP file
	downloadUrl("phpsqlajax_genxml.php", function(data) {
		var xml = data.responseXML;
		var markers = xml.documentElement.getElementsByTagName("marker");
		for (var i = 0; i < markers.length; i++) {
			var altitude = markers[i].getAttribute("alt");
			var bateria = markers[i].getAttribute("bat");
			var speed = markers[i].getAttribute("spd");
			var data = markers[i].getAttribute("data");
			var durata = markers[i].getAttribute("timp");	
			var distance = markers[i].getAttribute("dst");		  
			var type = markers[i].getAttribute("type");
			var json = simpleReverseGeocoding(parseFloat(markers[i].getAttribute("lng")), parseFloat(markers[i].getAttribute("lat")));
			alert(JSON.stringify(json));
	// add marker to the map
			marker = L.marker([parseFloat(markers[i].getAttribute("lat")), parseFloat(markers[i].getAttribute("lng"))]).addTo(map);
			map.panTo(new L.LatLng(parseFloat(markers[i].getAttribute("lat")), parseFloat(markers[i].getAttribute("lng"))));
			
			var html = "<b>Ultimele date primite:</b><br /><b>Adresa: </b>" + address + "<br /><br /><b>Data: </b>" + data + "<br /><b>Durata: </b>" + secondsToHms(durata) + " <br /><b>Distanta parcursa: </b>" + Math.round((distance/1000)*100)/100 + " Km<br /><b>Viteza: </b>" + Math.round(speed*360)/100 + " Km/h<br /><b>Altitudine: </b>" + altitude + " metri<br /><b>Bateria: </b>" + Math.round((bateria*100)*100)/100 + "%</div>";
	// add popup to the marker

			marker.bindPopup(html).openPopup();

		}
	});
}

function simpleReverseGeocoding(lon, lat) {
fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat).then(function(response) {
	return response.json();
}).then(function(json) {
	return = json.display_name;
})
}

function secondsToHms(d) {
d = Number(d);
var h = Math.floor(d / 3600);
var m = Math.floor(d % 3600 / 60);
var s = Math.floor(d % 3600 % 60);

var hDisplay = h > 0 ? h + (h == 1 ? " ora, " : " ore, ") : "";
var mDisplay = m > 0 ? m + (m == 1 ? " minut, " : " minute, ") : "";
var sDisplay = s > 0 ? s + (s == 1 ? " secunda" : " secunde") : "";
return hDisplay + mDisplay + sDisplay; 
}

function downloadUrl(url, callback) {
var request = window.ActiveXObject ?
new ActiveXObject('Microsoft.XMLHTTP') :
new XMLHttpRequest;

request.onreadystatechange = function() {
if (request.readyState == 4) {
request.onreadystatechange = doNothing;
callback(request, request.status);
}
};

request.open('GET', url, true);
request.send(null);
}

function doNothing() {}

//]]>
</script>
</head>

<body onload="load()">
<div id="map"></div>
<script
src="http://cdn.leafletjs.com/leaflet-0.7/leaflet.js">
</script>

</body>
</html>
