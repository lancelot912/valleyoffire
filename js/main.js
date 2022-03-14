$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
});

// Javascript by //
var imagery = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow', {
    id: 'mapbox.satellite',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
});
var light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow', {
    id: 'mapbox.light',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
});
var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGFuY2VsYXphcnRlIiwiYSI6ImNrcDIyZHN4bzAzZTEydm8yc24zeHNodTcifQ.ydwAELOsAYya_MiJNar3ow', {
    id: 'mapbox.outdoors',
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
});



var mapOptions = {
    zoomControl: false,
    center: [36.456,  -114.533],
    zoom: 13,
    minZoom: 3,
    maxZoom: 18,
    layers: [outdoors]
};

var map = L.map('mapid', mapOptions);

var zoomHome = L.Control.zoomHome({
    position: 'topleft'
});
zoomHome.addTo(map);

var baseMaps = {
    "Color": outdoors,
    "Light": light,
    "Satellite": imagery
}


// sql queries to get layers

var sqlQuery1 = "SELECT t.the_geom, t.class, t.route_no, t.name, t.meters, t.miles, t.trlname,t.trllabel, t.trlsurface, t.trlclass, u.first_name, u.last_name, u.trail_id, u.user_date, u.review FROM lancelot912.gnp_trailss AS t LEFT OUTER JOIN lancelot912.user_review AS u ON t.route_no = u.trail_id";
//var sqlQuery1 = "SELECT * FROM lancelot912.gnp_trailss"; // trails 
var sqlQuery2 = "SELECT * FROM lancelot912.gnp_roads"; // roads
var sqlQuery3 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Campground'";
var sqlQuery4 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Entrance Station'";
var sqlQuery5 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Gift Shop'";
var sqlQuery6 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Entrance Station'";
var sqlQuery7 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Mobile Service'";
var sqlQuery8 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Parking'";
var sqlQuery9 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Petroglyphics'";
var sqlQuery10 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Picnic Area'";
var sqlQuery11 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Restrooms'";
var sqlQuery12 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Showers'";
var sqlQuery13 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Trailhead'";
var sqlQuery14 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Viewpoint'";
var sqlQuery15 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Visitor Center'";
var sqlQuery16 = "SELECT * FROM lancelot912.gnp_poi WHERE poitype = 'Water Station'";
//sql for dropdown list
var sqlQueryddl = "SELECT route_no, trllabel FROM lancelot912.gnp_trailss"; // trails 
//icons 



var iconTemp = L.Icon.extend({
    options: {
        iconSize: [25, 25],
    }
});

var iconTemp2 = L.Icon.extend({
    options: {
        iconSize: [20, 20],
    }
});

var cabinIcon = new iconTemp({
    iconUrl: 'images/cabin.svg'
});
var campIcon = new iconTemp({
    iconUrl: 'images/campground.svg'
});
var entranceIcon = new iconTemp({
    iconUrl: 'images/entrance.svg'
});
var giftIcon = new iconTemp({
    iconUrl: 'images/giftshop.svg'
});
var mobileIcon = new iconTemp({
    iconUrl: 'images/mobile.svg'
});
var parkingIcon = new iconTemp({
    iconUrl: 'images/parking.svg'
});
var petroglyphsIcon = new iconTemp({
    iconUrl: 'images/petroglyph.svg'
});
var picnicIcon = new iconTemp({
    iconUrl: 'images/picnic.svg'
});
var restroomIcon = new iconTemp({
    iconUrl: 'images/restroom.svg'
});
var showersIcon = new iconTemp({
    iconUrl: 'images/showers.svg'
});
var trailIcon = new iconTemp({
    iconUrl: 'images/trailhead.svg'
});
var viewptIcon = new iconTemp({
    iconUrl: 'images/viewpoint.svg'
});
var visitorIcon = new iconTemp({
    iconUrl: 'images/visitor.svg'
});
var waterIcon = new iconTemp2({
    iconUrl: 'images/water.svg'
});



//for each point of interest 

var onEachFeature = function (feature, layer) {
    if (feature.properties) {
        var popUpContent = makePopUpContent(feature.properties);
        layer.bindPopup(popUpContent);

        layer.on('mouseover', function (e) {
            this.openPopup();
        });
        layer.on('mouseout', function (e) {
            this.closePopup();
        });
    };

}
// function to make our popup-content
var makePopUpContent = function (props) {
    return '<div class="popup-content">' +
        '<p><strong>Name:</strong> ' + props.poilabel + '</p>' +
        '</div>'
}

// urls to get layer from carto
var callsite = "https://lancelot912.carto.com/api/v2/sql?format=GeoJSON&q=";
var url3 = callsite + sqlQuery3;
var url4 = callsite + sqlQuery4;
var url5 = callsite + sqlQuery5;
var url6 = callsite + sqlQuery6;
var url7 = callsite + sqlQuery7;
var url8 = callsite + sqlQuery8;
var url9 = callsite + sqlQuery9;
var url10 = callsite + sqlQuery10;
var url11 = callsite + sqlQuery11;
var url12 = callsite + sqlQuery12;
var url13 = callsite + sqlQuery13;
var url14 = callsite + sqlQuery14;
var url15 = callsite + sqlQuery15;
var url16 = callsite + sqlQuery16;

// Point of interest layers for map
var campgrounds = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: campIcon
        });
    }
});
var entranceStation = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: entranceIcon
        });
    }
});

var giftShop = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: giftIcon
        });
    }
});
var mobileservice = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: mobileIcon
        });
    }
});
var parking = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: parkingIcon
        });
    }
});
var petroglyphs = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: petroglyphsIcon
        });
    }
});
var picnicArea = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: picnicIcon
        });
    }
});
var showers = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: showersIcon
        });
    }
});
var restroom = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: restroomIcon
        });
    }
});
var trailheads = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: trailIcon
        });
    }
});
var viewpoint = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: viewptIcon
        });
    }
});
var visitorCenter = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: visitorIcon,
        });
    }
});
var waterStation = L.geoJson(null, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: waterIcon,
        });
    }
});

$.getJSON(url3, function (data) {
    campgrounds.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url4, function (data) {
    entranceStation.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url5, function (data) {
    giftShop.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url6, function (data) {
    mobileservice.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url7, function (data) {
    parking.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url8, function (data) {
    picnicArea.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url9, function (data) {
    petroglyphs.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url10, function (data) {
    restroom.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url11, function (data) {
    showers.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url12, function (data) {
    trailheads.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url13, function (data) {
    viewpoint.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url14, function (data) {
    visitorCenter.addData(data);
}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});
$.getJSON(url15, function (data) {
    waterStation.addData(data);

}).fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
});



// Get trails selection as GeoJSON and Add to Map
var trails = $.getJSON("https://lancelot912.carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery1, function (data) {
    trails = L.geoJson(data, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup('<p><b>' + feature.properties.trllabel + '</b><br/><em>' + 'Surface Type: ' + feature.properties.trlsurface + '<br/><em>' + 'Trail Level: ' + feature.properties.trlclass + '<br/><em>' + 'Miles: ' + feature.properties.miles + '<br/><em>' + 'Reviews: ' + feature.properties.user_date + ': ' + feature.properties.review + '</p>');
            layer.on({
                mouseover: function (e) {
                    layer.setStyle({
                        weight: 3,
                        color: "#00FFFF",
                        opacity: 1
                    });
                    if (!L.Browser.ie && !L.Browser.opera) {
                        layer.bringToFront();
                    }
                },
                mouseout: function (e) {
                    trails.resetStyle(e.target);
                },

            });
        },
        style: styleTrails,
    }).addTo(map);
});


function styleTrails(feature) {
    type = feature.properties.trlsurface;
    var colorToUse;
    if (type === "Sand/Soil") colorToUse = 'green';
    else if (type === "Sand") colorToUse = 'gold';
    else if (type === "Soil") colorToUse = 'brown';
    else if (type === "Rock/Sand/Soil") colorToUse = 'gray';
    else colorToUse = "Crushed Stones";


    return {
        "color": colorToUse,
        "fillColor": colorToUse,
        "weight": 3,
        "dashArray": "5 5"
    };
}

function styleFilterTrails(feature) {
    return {
        "color": 'red',
        "fillColor": 'red',
        "weight": 2,
        "dashArray": "5 5"
    };
}

var roads = $.getJSON("https://lancelot912.carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery2, function (data) {
    roads = L.geoJson(data, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup('<p><b>' + feature.properties.rdlabel + '</b><br /><em>' + 'Surface Type: ' + feature.properties.rdsurface + '</p>');
            layer.on({
                mouseover: function (e) {
                    layer.setStyle({
                        weight: 3,
                        color: "#00FFFF",
                        opacity: 1
                    });
                    if (!L.Browser.ie && !L.Browser.opera) {
                        layer.bringToFront();
                    }
                },
                mouseout: function (e) {
                    roads.resetStyle(e.target);
                },

            });
        },
        style: styleRoads,
    }).addTo(map);
});

function styleRoads(feature) {
    type = feature.properties.rdsurface;
    var colorToUse;
    if (type === "Gravel") colorToUse = '#BF9D7E';
    else if (type === "Asphalt") colorToUse = 'black';
    else colorToUse = "red";

    return {
        "color": colorToUse,
        "fillColor": colorToUse,
        "weight": 2,
    };
}

var groupedOverlays = {
    "Park Amenities": {
        "<img src='images/entrance.svg' width='24' height='28'>&nbsp;Entrance Station": entranceStation,
        "<img src='images/water.svg' width='24' height='28'>&nbsp;Water Station": waterStation,
        "<img src='images/mobile.svg' width='24' height='28'>&nbsp;Mobile Service": mobileservice,
        "<img src='images/giftshop.svg' width='24' height='28'>&nbsp;Gift Shop": giftShop,
        "<img src='images/picnic.svg' width='24' height='28'>&nbsp;Picnic Area": picnicArea,
        "<img src='images/showers.svg' width='24' height='28'>&nbsp;Showers": showers,
        "<img src='images/restroom.svg' width='24' height='28'>&nbsp;Restroom": restroom,
        "<img src='images/visitor.svg' width='24' height='28'>&nbsp;Visitor Center": visitorCenter
    },

    "Trail Points of Interest": {
        "<img src='images/cabin.svg' width='24' height='28'>&nbsp;Cabin": cabins,
        "<img src='images/campground.svg' width='24' height='28'>&nbsp;Campgrounds": campgrounds,
        "<img src='images/trailhead.svg' width='24' height='28'>&nbsp;Trailheads": trailheads,
        "<img src='images/viewpoint.svg' width='24' height='28'>&nbsp;View Point": viewpoint,
    },

    "Transit": {
        "<img src='images/parking.svg' width='24' height='28'>&nbsp;Parking": parking
    }
};


var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays).addTo(map);
map.addControl(layerControl);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
    //    position: "bottomright",
    drawCircle: true,
    follow: true,
    setView: true,
    keepCurrentZoomLevel: true,
    markerStyle: {
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.8
    },
    circleStyle: {
        weight: 1,
        clickable: false
    },
    icon: "fa fa-location-arrow",
    metric: false,
    strings: {
        title: "Current Location",
        popup: "You are within {distance} {unit} from this point",
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
    },
    locateOptions: {
        maxZoom: 18,
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    }
}).addTo(map);


function getsearchdata() {
    var sqlSer = "SELECT poilabel, poitype, the_geom FROM lancelot912.gnp_poi WHERE poitype IN ('Amphitheater','Boat Launch', 'Bus Stop / Shuttle Stop','Cabin','Campground', 'Entrance Station', 'Food Service', 'Gas Station','Gift Shop','Horseback Riding','Lodging','Parking','Picnic Area','Post Office','Ranger Station','Restroom','Trailhead', 'Train Station','Viewpoint','Visitor Center')";
    var searchLayer = $.getJSON("https://lancelot912.carto.com/api/v2/sql?format=GeoJSON&q=" + sqlSer, function (data) {
        return L.geoJson(data);
        console.log(L.geoJson(data));
    });
}


map.addControl(new L.Control.Search({
    sourceData: getsearchdata,
    propertyName: 'poilabel',
    textPlaceholder: 'Search for Point of Interests',
    markerLocation: true
}));


$(document).ready(function () {
    $("#query-trails-reset").click(function () {
        $("#query_trails_form")[0].reset();
        $('#trailFiltOutput').empty();
    });

    $('<p class = "controlHeader">Basemaps</p>').insertBefore('div.leaflet-control-layers-base');

    $("#sidebar-toggle-btn").click(function () {
        animateSidebar();
        return false;
    });

    $("#sidebar-hide-btn").click(function () {
        animateSidebar();
        return false;
    });
    //open and close sidebar
    function animateSidebar() {
        $("#sidebar").animate({
            width: "toggle"
        }, 350, function () {
            map.invalidateSize();
        });
    }

    function openReview() {
        $("#reviewSection").collapse('show');
        $("#filterSection").collapse('hide');
    }

    function openFilter() {
        $("#filterSection").collapse('show');
        $("#reviewSection").collapse('hide');
    }

    /* Highlight search box text on click */
    $("#searchbox").click(function () {
        $(this).select();
    });
    /* Prevent hitting enter from refreshing the page */
    $("#searchbox").keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
        }
    });
    $("#review-btn").click(function () {
        animateSidebar();
        openReview();
        return false;
    });
    $("#filter-btn").click(function () {
        animateSidebar();
        openFilter();
        return false;
    });

    var ddlTrails = document.getElementById("ddlTrails")
    $.get("https://lancelot912.carto.com/api/v2/sql?q=" + sqlQueryddl,
        function (data) {
            console.log(data);
            for (i = 0; i < data.total_rows; i++) {
                var option = document.createElement("OPTION");
                option.innerHTML = data.rows[i].trllabel;

                //Set route_no in Value part.
                option.value = data.rows[i].route_no;

                //Add the Option element to DropDownList.
                ddlTrails.options.add(option);
            }
        });

    $("#reviewSubmitBtn").click(function (e) {
        e.preventDefault(); //just use when testing


        var x = $("#review_trails_form").serializeArray();

        var trailVal = x[0].value;
        var trailID = (trailVal * 1);

        var review_ = x[4].value;
        var userDate = x[3].value;
        var fn = x[1].value;
        var ln = x[2].value;
        var sqlReview = "INSERT INTO lancelot912.user_review(trail_id, review, user_date, first_name, last_name) VALUES(" + trailID + ", '" + review_ + "' , '" + userDate + "' , '" + fn + "' ,'" + ln + "')";

        var posting = $.post("https://lancelot912.carto.com/api/v2/sql?q=" + sqlReview).done(function () {
            alert("Your review has been submitted!")
            // Reset the form
            $("#review_trails_form")[0].reset();
        }).fail(function (xhr, status, error) {
            alert("Status: " + status + "\nError: " + error)
        });

    });
    $("#querySubmitBtn").click(function (e) {
        e.preventDefault(); //just use when testing
        $('#trailFiltOutput').empty();
        map.removeLayer(trails);

        //        map.removeLayer(filterTrails);

        var x = $("#query_trails_form").serializeArray();
        console.log(x);

        var surfaceType = x[0].value;
        console.log(surfaceType);
        //        "WHERE trlsurface = 'surfaceType'"

        var classType = x[1].value;
        console.log(classType);
        //        "WHERE trlclass LIKE 'classType'"

        var distanceRange = x[2].value;
        console.log(distanceRange);
        //        "WHERE miles distanceRange"


        var sqlFilter = "SELECT t.the_geom, t.class, t.route_no, t.name, t.meters, t.miles, t.trlname,t.trllabel, t.trlsurface, t.trlclass, u.first_name, u.last_name, u.trail_id, u.user_date, u.review FROM lancelot912.gnp_trailss AS t LEFT OUTER JOIN lancelot912.user_review AS u ON t.route_no = u.trail_id"



        // If no filters are selected
        if (surfaceType == "" && classType == "" && distanceRange == "") {
            var sql = sqlFilter;
        }

        // If at least one filter is selected
        else {
            // Add WHERE clause root
            var sql = sqlFilter + " WHERE ";
            // If surface type is not null, add surfaceType to WHERE clause
            if (surfaceType != "") {
                var where_surface = "t.trlsurface = '" + surfaceType + "'";
                sql += where_surface;
            }
            // If classType is not null, add classType to WHERE clause
            if (classType != "") {
                var where_class = "t.trlclass LIKE '" + classType + "'";
                if (surfaceType != "") {
                    sql += " AND " + where_class;
                } else {
                    sql += where_class;
                }
            }
            // If distanceRange is not null, add distanceRange to WHERE clause
            if (distanceRange != "") {
                var where_dist = "t.miles " + distanceRange;
                if (surfaceType != "" || classType != "") {
                    sql += " AND " + where_dist;
                } else {
                    sql += where_dist;
                }
            }
        }
        console.log(sql);

        var filterTrails = $.getJSON("https://lancelot912.carto.com/api/v2/sql?format=GeoJSON&q=" + sql, function (data) {
            trails = L.geoJson(data, {
                onEachFeature: function (feature, layer) {
                    console.log(feature);
                    console.log(feature.properties);
                    layer.bindPopup('<p><b>' + feature.properties.trllabel + '</b><br/><em>' + 'Surface Type: ' + feature.properties.trlsurface + '<br/><em>' + 'Trail Level: ' + feature.properties.trlclass + '<br/><em>' + 'Miles: ' + feature.properties.miles + '<br/><em>' + 'Reviews: ' + feature.properties.user_date + ': ' + feature.properties.review + '</p>');
                    $('#trailFiltOutput').append('<p class="trail-filter">' + feature.properties.trllabel + '</p>')
                    layer.on({
                        mouseover: function (e) {
                            layer.setStyle({
                                weight: 3,
                                color: "#00FFFF",
                                opacity: 1
                            });
                            if (!L.Browser.ie && !L.Browser.opera) {
                                layer.bringToFront();
                            }
                        },
                        mouseout: function (e) {
                            trails.resetStyle(e.target);
                        },

                    });
                },
                style: styleFilterTrails,
            }).addTo(map);
        });

    });


    // Leaflet patch to make layer control scrollable on touch browsers
    var container = $(".leaflet-control-layers")[0];
    if (!L.Browser.touch) {
        L.DomEvent
            .disableClickPropagation(container)
            .disableScrollPropagation(container);
    } else {
        L.DomEvent.disableClickPropagation(container);
    }

});