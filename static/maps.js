var pGoStyle = [{
    'featureType': 'landscape.man_made',
    'elementType': 'geometry.fill',
    'stylers': [{
        'color': '#a1f199'
}]
}, {
    'featureType': 'landscape.natural.landcover',
    'elementType': 'geometry.fill',
    'stylers': [{
        'color': '#37bd69'
}]
}, {
    'featureType': 'landscape.natural.terrain',
    'elementType': 'geometry.fill',
    'stylers': [{
        'color': '#37bda2'
}]
}, {
    'featureType': 'poi.attraction',
    'elementType': 'geometry.fill',
    'stylers': [{
        'visibility': 'on'
}]
}, {
    'featureType': 'poi.business',
    'elementType': 'geometry.fill',
    'stylers': [{
        'color': '#e4dfd9'
}]
}, {
    'featureType': 'poi.business',
    'elementType': 'labels.icon',
    'stylers': [{
        'visibility': 'off'
}]
}, {
    'featureType': 'poi.park',
    'elementType': 'geometry.fill',
    'stylers': [{
        'color': '#399683'
}]
}, {
    'featureType': 'road',
    'elementType': 'geometry.fill',
    'stylers': [{
        'color': '#84b09e'
}]
},  {
    'featureType': 'road.highway',
    'elementType': 'labels.icon',
    'stylers': [{
        'visibility': 'off'
}]
}, {
    'featureType': 'water',
    'elementType': 'geometry.fill',
    'stylers': [{
        'color': '#5ddad6'
}]
}]
$(document).ready(function () {
    var follow = false;
    var rad = 200;
    var radius = 200;
    var newLoc = [];
    radius = rad;
    markers = [];
    icons = [];
    mons = [];
    stops = [];
    gyms = [];
    var num = 200;
    var stopLookup = [];
    var newLocationMarker;
    var newlocCircle;
    var hLat = 0;
    var hLng = 0;
    var locCircle;
    lookup = [];
    lookupGym = [];
    lookupMons = [];
    var monCount = 0;
    stopCounter = 0;
    var vals;
    var open = false;
    var locArea;
    
    var ws = new WebSocket("ws://127.0.0.1:4000/sock");
    ws.onopen = function () {
        ws.send("Connected?");
        console.log("You are connected.")
    }

    //close header event click

    $("#closeHeader").click(function () {

        $("#header").slideUp(2000);
        $("#map").animate({
            top: "0"
        }, 2000);

    });
    //close header end////////////


    ////litebox for radius setting////////

    var $window = $(window);
    var open = false;
    var elements = [];

    $("body").append("<div id='img-holder' align='center'></div>");
    var $imgBox = $("#img-holder");
    var $closeBtn = $("#lbclose");
    $imgBox.css('margin-left', '3rem');
    $imgBox.css('margin-right', '3rem');
    $imgBox.css('color', 'white');

    var index = 0;
    var numObjects = 0;
    
    function closelb() {
        if (open) {
            open = false;
					$("#img-holder").fadeOut("slow", function(){
						$("#img-holder").css('height', '0%');					
						$("#img-holder").css('width', 'auto');
						$("#img-holder").css('margin-top', '0');
						$("#img-holder").css('margin-bottom', '0');	
						$("#img-holder").css('display', 'inline');
					});     
        }
    }
    ////////////end litebox
    function calcCrow(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = toRad(lat2 - lat1);
        var dLon = toRad(lon2 - lon1);
        var lat1 = toRad(lat1);
        var lat2 = toRad(lat2);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    function CustomMarker(latlng, map, args, dTime) {
        this.latlng = new google.maps.LatLng(latlng.lat, latlng.lng);
        this.args = args;
        this.setMap(map);
        this.time = latlng.time;
    }

    CustomMarker.prototype = new google.maps.OverlayView();

    CustomMarker.prototype.draw = function () {

        var self = this;

        var div = this.div;

        if (!div) {
            var nDate = new Date();
            var seconds2;
            var difference = (this.time / 60) - Math.floor(this.time / 60)
            seconds2 = Math.round(60 * difference);

            var fullDate = new Date(nDate.getFullYear(), nDate.getMonth(), nDate.getDate(), nDate.getHours(), Math.floor(this.time / 60), seconds2);
            
            fullDate.setSeconds(fullDate.getSeconds() + 900);

            div = this.div = document.createElement('div');

            div.className = 'markerLbl';

            div.innerHTML = '<div align="center"><img src="egg.png" class="iconImg"/></div><span class="label-countdown" disappears-at="' + (fullDate) + '">00m00s</span>';

            if (typeof (self.args.marker_id) !== 'undefined') {
                div.dataset.marker_id = self.args.marker_id;
            }

            google.maps.event.addDomListener(div, "click", function (event) {
                google.maps.event.trigger(self, "click");
            });

            var panes = this.getPanes();
            panes.overlayImage.appendChild(div);
        }

        var point = this.getProjection().fromLatLngToDivPixel(this.latlng);

        if (point) {
            div.style.left = point.x + 'px';
            div.style.top = point.y + 'px';
        }
    };

    CustomMarker.prototype.remove = function () {
        if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        }
    };

    CustomMarker.prototype.getPosition = function () {
        return this.latlng;
    };

    // Converts numeric degrees to radians
    function toRad(Value) {
        return Value * Math.PI / 180;
    }

    function centerMap(lat, lng, zoom) {
        var loc = new google.maps.LatLng(lat, lng)

        map.panTo(loc)

        if (zoom) {
            map.setZoom(zoom)
        }
    }

    function zoomOutControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to zoom out';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';

        controlText.style.paddingLeft = '10px';
        controlText.style.paddingRight = '10px';
        controlText.setAttribute("class", "radiusMapObj");
        controlText.innerHTML = '<i class="fa fa-minus fa-lg"></i> ';

        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            map.setZoom(map.getZoom() - 1);
        });
    }

    function zoomControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');

        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to zoom';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';

        controlText.style.paddingLeft = '10px';
        controlText.style.paddingRight = '10px';
        controlText.setAttribute("class", "radiusMapObj");
        controlText.style.fontSize = '3rem';
        controlText.innerHTML = '<i class="fa fa-plus fa-lg"></i> ';

        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            map.setZoom(map.getZoom() + 1);
        });
    }

    function radiusControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');

        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to set radius';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';

        controlText.style.paddingLeft = '10px';
        controlText.style.paddingRight = '10px';
        controlText.setAttribute("class", "radiusMapObj");
        controlText.style.fontSize = '3rem';
        controlText.innerHTML = '<i class="fa fa-street-view fa-lg"></i> ';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            //radius set modal here...
            if (!open) {
                open = true;
                var iw = this.clientWidth;
                var ih = this.clientHeight;
                var ratio = iw / ih;
                var windowsize = $window.width();
                var windowsizeh = $window.height();
                ele = this;

                $imgBox.css("background-color", "rgba(0,0,0,0.85)");
                $imgBox.html('<div class="clearfix" style="margin:2rem;"><h2 style="margin-top:0px;"><div class="left2 pad" >Radius (m)</div><div class="right minwidth"> <i class="fa fa-times fa-lg closeModal" id="" ></i></div></h2><div class="left2"><input id="radius" type="number" placeholder="200"/></div><i class="fa fa-check fa-lg" id="radiusBtn" ></i></div>');
                $("#img-holder").css('height', 'auto');
                $("#img-holder").css('width', '100%');
                $("#img-holder").css('margin-top', '100px');
                $("#img-holder").css('margin-bottom', 'auto');
                
                $('#radiusBtn').click(function () {
                    setRadius();
                    console.log("Set radius: " + num)
                });
                $imgBox.dblclick(function () {

                   //close?
                });

                $(".closeModal").click(function () {
                    closelb();
                });
            } else {
                closelb();
            }
        });
    }

    var degree = 100,
        timer;

    function rotate() {

        $('.trackOn').css({
            WebkitTransform: 'rotate(' + degree + 'deg)'
        });
        $('.trackOn').css({
            '-moz-transform': 'rotate(' + degree + 'deg)'
        });
        timer = setTimeout(function () {
            ++degree;
            rotate();
        }, 5);
    }

    function trackControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to follow';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.setAttribute('class', 'trackOn');
        controlText.style.paddingLeft = '10px';
        controlText.style.paddingRight = '10px';
        controlText.style.fontSize = '3rem';

        controlText.innerHTML = '<i class="fa fa-compass fa-lg"></i>  ';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function () {
            if (!follow) {
                console.log("Following location");
                rotate();
                follow = true;
                initGeoLocation()
                $('.trackOn').css('color', 'rgb(9,178,133)');
            } else {

                $('.trackOn').css('color', 'rgb(25,25,25)');
                console.log("Not following location");
                clearTimeout(timer);
                follow = false;
            }
        });
    }

    function initGeoLocation() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                clearDupeMarkers();
                if (locCircle) {
                    locCircle.setMap(null);
                }

                if (newLocationMarker) {
                    newLocationMarker.setMap(null);
                }

                newLocationMarker = new google.maps.Marker({
                    position: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    },
                    map: map,
                    icon: 'pointer.png'
                });
                var circleCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

                locCircle = new google.maps.Circle({
                    map: map,
                    clickable: false,
                    center: circleCenter,
                    radius: num,
                    fillColor: 'blue',
                    fillOpacity: 0.1,
                    boderColor: 'black',
                    strokeWeight: 1
                });
                map.panTo({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                ws.send((position.coords.latitude).toString() + "," + (position.coords.longitude).toString() + "," + num.toString());                
            });
        }
    }

    function followGeoLocation() {
        console.log("Follow? " + follow);
        if (follow == true) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    newLoc = []
                    newLoc.push(position.coords.latitude);
                    newLoc.push(position.coords.longitude);
                    map.setZoom(17);
                    map.panTo({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });

                    ws.send((position.coords.latitude).toString() + "," + (position.coords.longitude).toString() + "," + num.toString());

                    //locCircle.setCenter(circleCenter)
                    if (locCircle) {
                        locCircle.setMap(null);
                    }

                    if (newLocationMarker) {
                        newLocationMarker.setMap(null);
                    }

                    newLocationMarker = new google.maps.Marker({
                        position: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        map: map,
                        icon: 'pointer.png'
                    });
                    var circleCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)

                    locCircle = new google.maps.Circle({
                        map: map,
                        clickable: false,
                        center: circleCenter,
                        radius: num,
                        fillColor: 'blue',
                        fillOpacity: 0.1,
                        boderColor: 'black',
                        strokeWeight: 1
                    });

                });
            }
        }
    }

    var mapProp = {
        center: new google.maps.LatLng(43.61, -79.55),
        zoom: 11,
        zoomControl: false,
        streetViewControl: false
    };
    var map = new google.maps.Map(document.getElementById("map"), mapProp);
    map.setOptions({
        styles: pGoStyle
    });
    var zoomOutControlDiv = document.createElement('div');
    var zoomOutControl = new zoomOutControl(zoomOutControlDiv, map);
    zoomOutControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomOutControlDiv);

    var zoomControlDiv = document.createElement('div');
    var zoomControl = new zoomControl(zoomControlDiv, map);
    zoomControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);

    var radiusControlDiv = document.createElement('div');
    var radiusControl = new radiusControl(radiusControlDiv, map);

    radiusControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(radiusControlDiv);

    var trackControlDiv = document.createElement('div');
    var trackControl = new trackControl(trackControlDiv, map);

    trackControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(trackControlDiv);

    google.maps.event.addListener(map, 'click', function (event) {        
        locArea = event.latLng;
        hLat = locArea.lat();
        hLng = locArea.lng();
        if (newLocationMarker) {
            newLocationMarker.setMap(null);
        }

        newLocationMarker = new google.maps.Marker({
            position: event.latLng,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: 'pointer.png'
        });
        if (newlocCircle) {
            newlocCircle.setMap(null);
        }
        if (locCircle) {
            locCircle.setMap(null);
        }

        clearDupeMarkers();
        var circleCenter = new google.maps.LatLng(locArea.lat(), locArea.lng())

        newlocCircle = new google.maps.Circle({
            map: map,
            clickable: false,
            center: circleCenter,
            radius: num,
            fillColor: 'blue',
            fillOpacity: 0.1,
            boderColor: 'black',
            strokeWeight: 1
        });
        locCircle = newlocCircle;
        centerMap(locArea.lat(), locArea.lng(), 0);        
        ws.send((hLat).toString() + "," + (hLng).toString() + "," + num.toString());
    });




    function setRadius() {
        rad = parseInt($("#radius").val(), 10);
        num = rad;       
        if (isNaN(num) || num < 100) {
            alert("Radius should be >100m.")
            num = 200;
        } else {
            closelb();
        }
    }

    $('#onBtn').click(function () {
        follow = true;
    });
    $('#offBtn').click(function () {
        follow = false;
    });    
    initGeoLocation();


    function getColorByDate(value) {
        // Changes the color from red to green over 15 mins
        var diff = (new Date().getMinutes() - value)
        if (diff > 1) {
            diff = 1
        }
        // value from 0 to 1 - Green to Red
        var hue = ((1 - diff) * 120).toString(10)
        return ['hsl(', hue, ',100%,50%)'].join('')
    }

    function clearSelection() {
        if (document.selection) {
            document.selection.empty()
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges()
        }
    }

    function addListeners(marker) {
        marker.addListener('click', function () {
            marker.infoWindow.open(map, marker)
            clearSelection()
            updateLabelDiffTime()
            marker.persist = true
        })

        google.maps.event.addListener(marker.infoWindow, 'closeclick', function () {
            marker.persist = null
        })

        marker.addListener('mouseover', function () {
            marker.infoWindow.open(map, marker)
            clearSelection()
            updateLabelDiffTime()
        })

        marker.addListener('mouseout', function () {
            if (!marker.persist) {
                marker.infoWindow.close()
            }
        })

        return marker
    }

    function retTime(tm) {
        if (tm > 3600) {
            tm = tm - 3600;
        }
        minutes = tm / 60;
        return minutes;
    }

    function monLabel(despawn, disappearTime, id, latitude, longitude) {

        var contentstring = "<div><b>Known Spawnpoint</b><span> - </span><small>Monster Unknown </small></div>    <div>      Disappears: <span class='label-countdown' disappears-at='" + disappearTime + "'>00m00s</span>    </div>    <div>      Location:" + latitude + "," + longitude + "    </div> ";
        return contentstring;
    }
    var updateLabelDiffTime = function () {
        $('.label-countdown').each(function (index, element) {
            var disappearsAt = element.getAttribute('disappears-at')
            var now = new Date()
            var newDate = new Date(disappearsAt);            
            var difference = Math.abs(newDate.getTime() - now.getTime())
            var hours = Math.floor(difference / 36e5)
            var minutes = Math.floor((difference - (hours * 36e5)) / 6e4)
            var seconds = Math.floor((difference - (hours * 36e5) - (minutes * 6e4)) / 1e3)
            var timestring = ''

            if (disappearsAt < now) {
                timestring = '(expired)'
            } else {
                timestring = ''
                if (hours > 0) {
                    timestring = ''
                }

                timestring += ('0' + minutes).slice(-2) + 'm'
                timestring += ('0' + seconds).slice(-2) + 's'
                timestring += ''
            }

            $(element).text(timestring)
        })
    }

    function setupCurrentIconMarker(latlng) {
        var a_p = "";
        var curr = new Date();
        var secd;
        var diff = (latlng.time / 60) - Math.floor(latlng.time / 60)
        secd = Math.round(60 * diff);

        var d = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate(), curr.getHours(), Math.floor(latlng.time / 60), secd);
        var dateStr;
        d.setMinutes(d.getMinutes() + 15);
        var curr_hour = d.getHours();

        if (curr_hour < 12) {
            a_p = "AM";
        } else {
            a_p = "PM";
        }
        if (curr_hour == 0) {
            curr_hour = 12;
        }
        if (curr_hour > 12) {
            curr_hour = curr_hour - 12;
        }
        var mins = d.getMinutes();
        if (d.getMinutes() < 10) {
            mins = "0" + d.getMinutes();
        }
        var secs = d.getSeconds();
        if (d.getSeconds() < 10) {
            secs = "0" + d.getSeconds();
        }
        dateStr = (curr_hour + ":" + mins + ":" + secs + " " + a_p);

        var nDate = new Date();
        var seconds2;
        var difference = (latlng.time / 60) - Math.floor(latlng.time / 60)
        seconds2 = Math.round(60 * difference);
        var fullDate = new Date(nDate.getFullYear(), nDate.getMonth(), nDate.getDate(), nDate.getHours(), Math.floor(latlng.time / 60), seconds2);        
        fullDate.setSeconds(fullDate.getSeconds() + 900);
        lat = latlng.lat.toString().substring(0, 9);
        lng = latlng.lng.toString().substring(0, 9);
        var marker = new google.maps.Marker({
            position: {
                lat: latlng.lat,
                lng: latlng.lng
            },
            map: map,
            icon: 'egg.png'
        })
        lblDiff = parseInt((new Date().getTime) - (latlng.time * 1000));

        marker.addListener('click', function () {
            this.setAnimation(null)
            this.animationDisabled = true
        })
        marker.infoWindow = new google.maps.InfoWindow({

            content: monLabel(dateStr, fullDate, '1', lat, lng),
            disableAutoPan: true
        })
        addListeners(marker)
        return marker;
    }

    function setupGymIconMarker(item) {        
        var marker = new google.maps.Marker({
            position: {
                lat: item.lat,
                lng: item.lng
            },
            map: map,
            zIndex: 2,
            icon: 'Uncontested.png'
        })

        marker.infoWindow = new google.maps.InfoWindow({
            content: ("Gym at: " + item.lat.toString().substring(0, 7) + "," + item.lng.toString().substring(0, 7)),
            disableAutoPan: true
        })

        addListeners(marker)
        return marker
    }

    function setupStopIconMarker(item) {

        var marker = new google.maps.Marker({
            position: {
                lat: item.lat,
                lng: item.lng
            },
            map: map,
            zIndex: 2,
            icon: 'Pstop.png'
        })

        marker.infoWindow = new google.maps.InfoWindow({
            content: ("Stop at: " + item.lat.toString().substring(0, 7) + "," + item.lng.toString().substring(0, 7)),
            disableAutoPan: true
        })

        addListeners(marker)
        return marker
    }

    function setupGymMarker(latlng) {
        var circleCenter = new google.maps.LatLng(latlng.lat, latlng.lng)

        var marker = new google.maps.Circle({
            map: map,
            clickable: false,
            center: circleCenter,
            radius: 25,
            fillColor: getColorByDate(latlng.time / 60),
            strokeWeight: 1
        })
        return marker;
    }

    function isLocationFree(search, lookup) {
        for (var i = 0, l = lookup.length; i < l; i++) {
            if (lookup[i][0].toString().substring(0, 7) === search[0].toString().substring(0, 7) && lookup[i][1].toString().substring(0, 7) === search[1].toString().substring(0, 7)) {
                return false;
            }
        }
        return true;
    }

    function delLookupEntry(search, lookup) {
        for (var i = 0, l = lookup.length; i < l; i++) {
            if (lookup[i][0].toString().substring(0, 7) === search[0].toString().substring(0, 7) && lookup[i][1].toString().substring(0, 7) === search[1].toString().substring(0, 7)) {
                lookup.splice(i, 1);
                i--;
                l--;                
            }
        }
    }

    function setOverlay(latlng) {

        var overlay = new CustomMarker(
            latlng,
            map, {}
        );
        return overlay;
    }

    ws.onmessage = function (evt) {

        var inData = evt.data;
        var arrData = inData.split('***')
        if (arrData[0] == '1' || arrData[0] == 1) {

            var inJSON = JSON.parse(arrData[1]);
            var stopJSON = JSON.parse(arrData[2]);
            var gymJSON = JSON.parse(arrData[3]);

            for (loc in inJSON) {
                var search = [inJSON[loc].lat, inJSON[loc].lng];
                if (isLocationFree(search, lookupMons)) {
                    lookupMons.push(search);
                    item = inJSON[loc];
                    var overlay = setOverlay(item);
                    markers.push(overlay);
                    mons.push(item);
                }
            }

            stopCounter = 0;
            for (stop in stopJSON) {
                stopCounter++;
                var search = [stopJSON[stop].lat, stopJSON[stop].lng];

                if (isLocationFree(search, lookup)) {
                    lookup.push(search);
                    var ico = setupStopIconMarker(stopJSON[stop]);
                    ico.setMap(map);
                    stops.push(ico);
                   
                }
            }
            gymCounter = 0;

            for (gym in gymJSON) {
                var search = [gymJSON[gym].lat, gymJSON[gym].lng];

                if (isLocationFree(search, lookupGym)) {
                    lookupGym.push(search);
                    var ico = setupGymIconMarker(gymJSON[gym]);
                    ico.setMap(map);
                    gyms.push(ico);
                    
                }
            }
    
        } else {

            var tempArr = [];
            tempArr.push(arrData[1]);
            var latlng = JSON.parse(tempArr);

            var search = [latlng.lat, latlng.lng];
            if (isLocationFree(search, lookupMons)) {

                if (calcCrow(hLat, hLng, latlng.lat, latlng.lng) <= ((num) / 1000)) {
                    lookupMons.push(search);
                    item = latlng;
                    var overlay = setOverlay(item);
                    markers.push(overlay);
                    mons.push(item);

                } else {
                    
                }
            }
        }
        $(".data").html("&nbsp;&nbsp;|&nbsp;&nbsp;" + stopCounter + " stops");
    }

    function showInBoundsMarkers(markers) {
        $.each(markers, function (key, value) {
            var marker = markers[key].marker
            var show = false
            if (!markers[key].hidden) {
                if (typeof marker.getBounds === 'function') {
                    if (map.getBounds().intersects(marker.getBounds())) {
                        show = true
                    }
                } else if (typeof marker.getPosition === 'function') {
                    if (map.getBounds().contains(marker.getPosition())) {
                        show = true
                    }
                }
            }
        })
    }

    function clearStaleMarkers() {
        // If older than 15mins remove	
        $.each(markers, function (index, value) {
            var curr = new Date();
            var secd;
            var diff = (mons[index].time / 60) - Math.floor(mons[index].time / 60)
            secd = Math.round(60 * diff);

            var d = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate(), curr.getHours(), Math.floor(mons[index].time / 60), secd);
            var dateStr;
            d.setSeconds(d.getSeconds() + 900);

            var search = [mons[index].lat, mons[index].lng];
            if (d.getTime() < new Date().getTime()) {
                delLookupEntry(search, lookupMons);
                try {
                    value.setMap(null);
                } catch (err) {}
                delete value;                
            }
        })


        $.each(mons, function (index, value) {

            var curr = new Date();
            var secd;
            var diff = (mons[index].time / 60) - Math.floor(mons[index].time / 60)
            secd = Math.round(60 * diff);

            var d = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate(), curr.getHours(), Math.floor(mons[index].time / 60), secd);
            var dateStr;
            d.setSeconds(d.getSeconds() + 900);

            if (d.getTime() < new Date().getTime()) {
                delete value;
            }
        })
    }

    function clearDupeMarkers() {

        lookupMons = [];
        $.each(markers, function (index, value) {
            try {
                value.setMap(null);
                delete value;
            } catch (err) {}  
        })
        $.each(mons, function (index, value) {          
            delete value;
        })
    }

    window.setInterval(clearStaleMarkers, 5000);

    window.setInterval(followGeoLocation, 10000);

    window.setInterval(updateLabelDiffTime, 1000);
});