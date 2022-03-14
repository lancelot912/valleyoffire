// Esri basemap tiles
var DarkGray = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'});
var LightGray = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'});   
var Streets = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'});    

// Basemaps
var baseMaps = {
    "Dark": DarkGray,
    "Light": LightGray,
    "Street": Streets,
};

// Initialize global variables for data layers
var cancertracts,
    wellpoints,
    nitrateHexbin,
    collectedHexbin,
    regressionHexbin;


// Initialize global variables for the distance decay coefficient and hexbin size with default values
var ddCoefficient = 2,
    hexbinArea = 10;


// Initialize arrays to store the well points, census tracts, interpolated nitrate concentrations, interpolated cancer rates, and predicted and observed cancer rates
var wellpointsArray = [],
    interNitrateRatesArray = [],
    interNCRArray = [],
    observedNCRArray = [];


// Initialize global variables for the Turf.js feature collections
var cancertractsCentroid,
    wellpointscollection,
    nitrateHexbinTurf,
    cancerRatesGridPointsTurf,
    collectedHexbinTurf;


// Initialize global variables for the layer list and overlays
var layerList,
    overlays;

// Initialize layers in global scope, to include them in the layer list
var wellpointsLG = L.layerGroup(),
    cancertractsLG = L.layerGroup(),
    nitrateratesIDW = L.layerGroup(),
    cancernitrateratesIDW = L.layerGroup(),
    regressionresidualsLG = L.layerGroup();

// Set the overlays to include in the layer list
var overlays = {
    "Well Points": wellpointsLG,
    "Cancer Tracts": cancertractsLG,
};


// Set the map options
var mapOptions = {
    center: [44.763057, -85.620632],
    zoom: 7,
    minZoom: 7,
    maxZoom: 17,
    bounceAtZoomLimits: false,
    layers: [DarkGray, LightGray, Streets, wellpointsLG, cancertractsLG, nitrateratesIDW, cancernitrateratesIDW, regressionresidualsLG]
};


var map = L.map('map', mapOptions);
map.zoomControl.setPosition('topleft');
map.addLayer(DarkGray);
map.addLayer(LightGray);
map.addLayer(Streets);
getUIActions();

buildLayerList(overlays);

// Sidebar
var sidebar = L.control.sidebar({
    autopan: false,
    closeButton: false,
    container: 'sidebar',
    position: 'right', 
}).addTo(map);

sidebar.open('home');
$('#regressionEquationLabel').hide();
$('#rSquaredLabel').hide();


// JQuery
$.getJSON("data/cancer_tracts.json", function (data) {
    cancertracts = L.geoJson(data, {
        style: function (feature) {
            return {
                color: '#d9d9d9',
                weight: 0.25,
                fillOpacity: 0.5,
                opacity: 1
            };
        }
    }).addTo(cancertractsLG);
    drawcancertracts();
});


$.getJSON("data/well_nitrate.json", function (data) {
    wellpoints = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                fillColor: '#242424',
                fillOpacity: 1,
                color: '#242424',
                weight: 0.25,
                opacity: 1,
                radius: 2.5
            });
        }
    }).addTo(wellpointsLG);
    drawwellpoints();
});


function drawcancertracts() {
    var breaks = getCancerRateClassBreaks(cancertracts);
    cancertracts.eachLayer(function (layer) {
        layer.setStyle({
            fillColor: getCancerRateColor(layer.feature.properties.canrate, breaks)
        });
        var popup = "<b>Cancer Rate: </b>" + (layer.feature.properties.canrate * 100).toLocaleString() + "%";
        layer.bindPopup(popup);

    });
    drawCancerRatesLegend(breaks);
    cancertracts.bringToBack();
} // end


function getCancerRateClassBreaks(cancerRatesDataSource) {
    var values = [];
    cancerRatesDataSource.eachLayer(function (layer) {
        var value = layer.feature.properties.canrate;
        values.push(value);
    });
    var clusters = ss.ckmeans(values, 5);
    var breaks = clusters.map(function (cluster) {
        return [cluster[0], cluster.pop()];
    });
    return breaks;
} // end  

function getCancerRateColor(d, breaks) {
    if (d <= breaks[0][1]) {
        return '#03045e';
    } else if (d <= breaks[1][1]) {
        return '#0077b6';  
    } else if (d <= breaks[2][1]) {
        return '#00b4d8';
    } else if (d <= breaks[3][1]) {
        return '#90e0ef';
    } else if (d <= breaks[4][1]) {
        return '#caf0f8';
    }
} // end 


function drawCancerRatesLegend(breaks) {
    var legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML = "<h3><b>Cancer Rate %</b></h3>";
        // For each of our breaks
        for (var i = 0; i < breaks.length; i++) {
            var color = getCancerRateColor(breaks[i][0], breaks);
            div.innerHTML +=
                '<span style="background:' + color + '"></span> ' +
                '<label>' + parseFloat(breaks[i][0] * 100).toFixed(2).toLocaleString() + '% &mdash; ' +
                parseFloat(breaks[i][1] * 100).toFixed(2).toLocaleString() + '%</label>';
        } 
        return div;
    };
    legend.addTo(map);
}

  
function drawwellpoints() {
    var breaks = getNitrateRateClassBreaks(wellpoints);
    wellpoints.eachLayer(function (layer) {
        layer.setStyle({
            fillColor: getNitrateRateColor(layer.feature.properties.nitr_ran, breaks)
        });
        var popup = "<b>Nitrate Levels: </b>" + layer.feature.properties.nitr_ran.toFixed(2) + " ppm";
        layer.bindPopup(popup);
    });
    drawNitrateRatesLegend(breaks);
    wellpoints.bringToBack();
} // end


function getNitrateRateClassBreaks(nitrateRatesDataSource) {
    var values = [];
    nitrateRatesDataSource.eachLayer(function (layer) {
        var value = layer.feature.properties.nitr_ran;
        values.push(value);
    });
    var clusters = ss.ckmeans(values, 5);
    var breaks = clusters.map(function (cluster) {
        return [cluster[0], cluster.pop()];
    });
    return breaks;
} // end 

function getNitrateRateColor(d, breaks) {
    if (d <= breaks[0][1]) {
        return '#d1890b';  
    } else if (d <= breaks[1][1]) {
        return '#ff9d14';
    } else if (d <= breaks[2][1]) {
        return '#ffbd4d';
    } else if (d <= breaks[3][1]) {
        return '#ffd866';
    } else if (d <= breaks[4][1]) {
        return '#ffe466';
    }
} // end 


function drawNitrateRatesLegend(breaks) {
    var legend = L.control({
        position: 'bottomright'
    });
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML = "<h3><b>Nitrate Levels </b></h3>";

        for (var i = 0; i < breaks.length; i++) {
            var color = getNitrateRateColor(breaks[i][0], breaks);
            div.innerHTML +=
                '<span style="background:' + color + '"></span> ' +
                '<label>' + parseFloat(breaks[i][0]).toFixed(2).toLocaleString() + ' &mdash; ' +
                parseFloat(breaks[i][1]).toFixed(2).toLocaleString() + ' ppm' + '</label>';
        } 
        return div;
    };

    legend.addTo(map);
} // end


// Build the layer list control and add it to the map
function buildLayerList(overlays) {
    layerList = L.control.layers(baseMaps, overlays, {
        collapsed: false,
        autoZIndex: true,
        hideSingleBase: true
    }).addTo(map);
} // end 


// When the user clicks Submit or Reset
// If Submit is clicked, get the distance decay coefficient and hexbin size and redraw the map with the interpolated nitrate concentrations, cancer rates, and regression residuals
function getUIActions() {
    var submit = $('#submitButton');
    submit.on('click', function (e) {
        console.log("Running now.");
        submitParameters();
    });

    var reset = $('#resetButton');
    reset.on('click', function (e) {
        console.log("Resetting now.");
        resetParameters();
        $('#regressionEquationLabel').hide();
        $('#regressionEquation').hide();
        $('#rSquaredLabel').hide();
        $('#rSquared').hide();        
    });
}


// Get the distance decay coefficient and hexbin size
// If they are valid, redraw the map, layer list, and legend with the interpolated nitrate concentrations, cancer rates, and regression residuals
function submitParameters() {
    if (wellpoints !== undefined) {
        wellpoints.remove();
    }
    if (cancertracts !== undefined) {
        cancertracts.remove();
    }
    if (nitrateHexbin !== undefined) {
        nitrateHexbin.remove();
    }
    if (collectedHexbin !== undefined) {
        collectedHexbin.remove();
    }
    if (regressionHexbin !== undefined) {
        regressionHexbin.remove();
    }

    // Use the JQuery select $() and val() methods to determine the value of the distance decay coefficient text box
    ddCoefficient = $('#ddCoefficient').val();
    ddCoefficient = parseFloat(ddCoefficient);

    // Use the JQuery select $() and val() methods to determine the value of the hexbin size text box
    hexbinArea = $('#hexbinArea').val();
    hexbinArea = parseFloat(hexbinArea);

    // Show an error popup and reset the map to the original layers and parameter values if the hexbin size is not a number or not between 6 and 90
    if (isNaN(hexbinArea) || hexbinArea < 6 || hexbinArea > 90) {
        window.alert("Please enter a number between 6 and 90.");
        $('#hexbinArea').val();
        resetParameters();
        return;

    // Show an error popup and reset the map to the original layers and parameter values if the distance decay coefficient is not a number or not between 0 and 100
    } else if (isNaN(ddCoefficient) || ddCoefficient < 1 || ddCoefficient > 100) {
        window.alert("Please enter a number between 1 and 100.");
        $('#ddCoefficient').val();
        resetParameters();
        return;
    }

    console.log("Distance Decay Coefficient: " + ddCoefficient);
    console.log("Hexbin Area: " + hexbinArea);

    // Hide the current legend
    $('.legend').hide();

    // Remove the current layer list
    layerList.remove();

    // Set the overlays to include in the updated layer list
    overlays = {
        "Cancer Rates": cancernitrateratesIDW,
        "Nitrate Levels": nitrateratesIDW,
        "Regression Residual": regressionresidualsLG
    };

    // Rebuild the layer list with the new list of overlays
    buildLayerList(overlays);
    nitrateratesinterpolation(ddCoefficient, hexbinArea);
    cancertonitrateinterpolation(ddCoefficient, hexbinArea);

} // end of submitParameters()


// Redraw the map, layer list, and legend with the original well points and census tracts
function resetParameters() {

    // Hide the current legend
    $('.legend').hide();
    if (wellpoints !== undefined) {
        wellpoints.remove();
    }
    if (cancertracts !== undefined) {
        cancertracts.remove();
    }
    if (nitrateHexbin !== undefined) {
        nitrateHexbin.remove();
    }
    if (collectedHexbin !== undefined) {
        collectedHexbin.remove();
    }
    if (regressionHexbin !== undefined) {
        regressionHexbin.remove();
    }

    // Add census tracts and well points back to the map
    cancertracts.addTo(map);
    wellpoints.addTo(map);

    // Call the function
    drawwellpoints();
    drawcancertracts();

    layerList.remove();

    // Set the overlays to include in the layer list
    overlays = {
        "Well Points": wellpointsLG,
        "Cancer Tracts": cancertractsLG
    };

    // Move the census tracts to the bottom of the layer order
    cancertracts.bringToBack();
    buildLayerList(overlays);
} // end 


// Build a Turf feature collection from the well points
function nitrateratesinterpolation(ddCoefficient, hexbinArea) {

    // Remove any previous features from the layer group    
    if (nitrateratesIDW !== undefined) {
        nitrateratesIDW.clearLayers();
    }

    // Loop through each feature
    wellpoints.eachLayer(function (layer) {

        // Create shorthand variables to access the layer properties and coordinates
        var props = layer.feature.properties;
        var coordinates = layer.feature.geometry.coordinates;
        wellpointsFeature = turf.point(coordinates, props);
        wellpointsArray.push(wellpointsFeature);

    });

    // Create a Turf feature collection from the array of well point features
    wellpointscollection = turf.featureCollection(wellpointsArray);

    // Set options for the well point interpolation
    var options = {
        gridType: 'hex', 
        property: 'nitr_ran', 
        units: 'kilometers',
        weight: ddCoefficient 
    };

    // Interpolate the well point features using the grid size from the hexbinArea variable, the submitted distance decay coefficient, and the options just specified
    nitrateHexbinTurf = turf.interpolate(wellpointscollection, hexbinArea, options);

    // Loop through each hexbin and get its interpolated nitrate concentration
    for (var hexbin in nitrateHexbinTurf.features) {
        var interpolatedNitrateRate = nitrateHexbinTurf.features[hexbin].properties.nitr_ran;
        interNitrateRatesArray.push(interpolatedNitrateRate);
    }
    console.log(nitrateHexbinTurf);

    // Convert the hexbins to a Leaflet GeoJson layer and add it to the Nitrate Concentrations layer group
    nitrateHexbin = L.geoJson(nitrateHexbinTurf, {
        // Style the nitrate concentration hexbins
        style: function (feature) {
            return {
                color: '#242424', 
                weight: 0.5,
                fillOpacity: 0.6,
                opacity: 0.5 
            };
        }
    }).addTo(nitrateratesIDW);
    console.log(nitrateHexbin);

    // Get the class breaks based on the ckmeans classification method
    var breaks = getNitrateRateClassBreaks(nitrateHexbin);

    // Loop through each feature, set its symbology, and build and bind its popup
    nitrateHexbin.eachLayer(function (layer) {
        layer.setStyle({
            fillColor: getNitrateRateColor(layer.feature.properties.nitr_ran, breaks)
        });
        var popup = "<b>Nitrate Levels: </b>" + layer.feature.properties.nitr_ran.toFixed(2) + " ppm";
        layer.bindPopup(popup);
    });

    // Move the nitrate concentration hexbins to the front
    nitrateHexbin.bringToFront();

    // Draw the legend for the nitrate concentration hexbins
    drawNitrateRatesLegend(breaks);

} // end nitrateratesinterpolation()


// Build a Turf feature collection from census tract centroids
function cancertonitrateinterpolation() {

    var cancertractsArray = [];

    // Loop through each census tract feature and build a Turf feature collection from its centroid
    turf.featureEach(cancertracts, function(currentFeature, featureIndex) {
    
        // Create shorthand variables to access the layer properties and coordinates
        var centroids = turf.centroid(currentFeature);
        centroids.properties = {canrate:currentFeature.properties.canrate};
        cancertractsArray.push(centroids);
    });

    // Create a Turf feature collection from the array of census tract centroid features
    cancertractsCentroid = turf.featureCollection(cancertractsArray);

    // Set options for the cancer rate interpolation by grid points
    var gridoptions = {gridType: 'hex', property: 'canrate', units: 'kilometers', weight: ddCoefficient };

    // Interpolate the cancer rate centroids into a surface of grid points (http://turfjs.org/docs#interpolate)
    cancerRatesGridPointsTurf = turf.interpolate(cancertractsCentroid, hexbinArea, gridoptions);

    // Use the collect function to join the cancer rates from the cancer rate grid points to the nitrate concentration hexbins (http://turfjs.org/docs/#collect)
    collectedHexbinTurf = turf.tag(nitrateHexbinTurf, cancerRatesGridPointsTurf, 'canrate', 'values');

    // Loop through each of the collected hexbins
    for (var i in collectedHexbinTurf.features) {
        var canrateArray = collectedHexbinTurf.features[i].properties.values;
        var canrateArraySum = 0;
        for (var j in canrateArray) {
            if (canrateArray.length > 0) {
                canrateArraySum += parseFloat(canrateArray[j]);
            }
        }

        // Get the average cancer rate (sum / number of features in the array)
        var canrateArrayAvg = canrateArraySum / canrateArray.length;
        if (canrateArrayAvg !== undefined) {
            collectedHexbinTurf.features[i].properties.canrate = canrateArrayAvg;
        } else {
            collectedHexbinTurf.features[i].properties.canrate = "";
        }
    }
    console.log(collectedHexbinTurf)

    // Convert the collected hexbins to a Leaflet GeoJson layer and add it to the cancer rates layer group
    collectedHexbin = L.geoJson(collectedHexbinTurf, {

        // Set a default style for the collected hexbins
        style: function (feature) {
            return {
                color: '#242424', 
                weight: 0.5, 
                fillOpacity: 0.6, 
                opacity: 0.5 
            };
        }
    }).addTo(cancernitrateratesIDW);

    // Get the class breaks based on the ckmeans classification method
    var breaks = getCancerRateClassBreaks(collectedHexbin);
    collectedHexbin.eachLayer(function (layer) {

        // Set its color based on the cancer rate
        layer.setStyle({
            fillColor: getCancerRateColor(layer.feature.properties.canrate, breaks)
        });
        var popup = "<b>Cancer Rate: </b>" + (layer.feature.properties.canrate * 100).toFixed(2).toLocaleString() + "%";
        layer.bindPopup(popup);
    });

    // Move the cancer rate hexbins to the front
    collectedHexbin.bringToFront();
    drawCancerRatesLegend(breaks);
    calculateLinearRegression(collectedHexbinTurf);

} // end cancertonitrateinterpolation()


// Calculate a linear regression where x is the nitrate concentration and y is the cancer rate
// Use the resulting slope (m) and y-intercept (b) to calculate the predicted cancer rate for each hexbin, and the residual (predicted rate - observed rate)
function calculateLinearRegression(collectedHexbinTurf) {

    // Remove any previous features from the layer group    
    if (regressionresidualsLG !== undefined) {
        regressionresidualsLG.clearLayers();
    }

    console.log("Creating Linear Regression Datasets...")
    // Loop through the hexbin layer with nitrate concentrations and cancer rates
    // Create a two-dimensional array of [x, y] pairs where x is the nitrate concentration and y is the cancer rate

    // Loop through each of the collected hexbins
    for (var i in collectedHexbinTurf.features) {
        var props = collectedHexbinTurf.features[i].properties;
        var interpolatedNitrateLevels = props.nitr_ran;
        var interpolatedCancerRate = props.canrate;
        var currentNitrateAndCancerRates = [parseFloat(interpolatedNitrateLevels), parseFloat(interpolatedCancerRate)];
        interNCRArray.push(currentNitrateAndCancerRates);
    }

    // Run the linearRegression method from the Simple Statistics library to return an object containing the slope and intercept of the linear regression line
    // where nitrate concentration is the independent variable (x) and cancer rate is the dependent variable (y)
    var regressionEquation = ss.linearRegression(interNCRArray);
    console.log(regressionEquation);

    // Create variables for the slope and y-intercept
    var m = regressionEquation.m;
    var b = regressionEquation.b;
    
    var regressionEquationFormat = "y = " + parseFloat(m).toFixed(5) + "x + " + parseFloat(b).toFixed(5);
    console.log("Regression Equation: " + regressionEquationFormat);

    // Calculate the r-squared for the regression (https://simplestatistics.org/docs/#rsquared)
    // The function requires a linear regression line (https://simplestatistics.org/docs/#linearregressionline) and an array of nitrate concentration and cancer rate pairs
    
    // Build the linear regression line from the regression equation
    var regressionLine = ss.linearRegressionLine(regressionEquation);
    
    // Calculate the r-squared
    var rSquared = parseFloat(ss.rSquared(observedNCRArray, regressionLine)).toFixed(5); // 1 is a perfect fit, 0 indicates no correlation
    console.log("r-Squared: " + rSquared);
    
    // Show the regression equation and r-squared labels and values in the sidebar
    $('#regressionEquationLabel').show();
    $('#regressionEquation').show();
    $('#rSquaredLabel').show();    
    $('#rSquared').show();

    // Loop through each of the collected hexbins
    for (var j in collectedHexbinTurf.features) {

        var collectedFeatureHexbinProps = collectedHexbinTurf.features[j].properties;
        
        var collectedHexbinInterpolatedNitrateLevels = collectedFeatureHexbinProps.nitr_ran;
        var collectedHexbinInterpolatedCancerRate = collectedFeatureHexbinProps.canrate;

        var predictedCancerRate = m * (parseFloat(collectedHexbinInterpolatedNitrateLevels)) + b;

        var residual = (predictedCancerRate - collectedHexbinInterpolatedCancerRate);

        collectedHexbinTurf.features[j].properties.predictedCancerRate = predictedCancerRate;
        collectedHexbinTurf.features[j].properties.residual = residual;
        
        var observedNitrateAndCancerRatesPair = [collectedHexbinInterpolatedNitrateLevels, collectedHexbinInterpolatedCancerRate];
        observedNCRArray.push(observedNitrateAndCancerRatesPair);

    }

    
    // Select the regression equation inside the regressionEquation div element's span tag and update it to the calculated regression equation
    var regressionEquationDiv = $('#regressionEquation');
    regressionEquationDiv.html(regressionEquationFormat);
    
    // Select the r-squared inside the regressionEquation div element's span tag
    var rSquaredDiv = $('#rSquared');
    rSquaredDiv.html(rSquared);

    // Convert the collected hexbins to a Leaflet GeoJson layer and add it to the regression residuals layer group
    regressionHexbin = L.geoJson(collectedHexbinTurf, {
        style: function (feature) {
            return {
                color: '#999999', 
                weight: 0.5, 
                fillOpacity: 0.5, 
                opacity: 0.5 
            };
        }

    }).addTo(regressionresidualsLG);

    // Get the class breaks based on the ckmeans classification method
    var breaks = getRegressionResidualClassBreaks(regressionHexbin);

    // Loop through each feature, set its symbology, and build and bind its popup
    regressionHexbin.eachLayer(function (layer) {
        layer.setStyle({
            fillColor: getRegressionResidualColor(layer.feature.properties.residual, breaks)
        });

        if (getRegressionResidualColor(layer.feature.properties.residual, breaks) == '#f7f7f7') {
            layer.setStyle({
                fillOpacity: 0.1
            });
        }

        var popup = 
            "<b>Nitrate Levels: </b>" + layer.feature.properties.nitr_ran.toFixed(2) + " ppm" + "<br/>" +
            "<b>Observed Cancer Rate: </b>" + (layer.feature.properties.canrate * 100).toFixed(2).toLocaleString() + "%" + "<br/>" +
            "<b>Predicted Cancer Rate: </b>" + (layer.feature.properties.predictedCancerRate * 100).toFixed(2).toLocaleString() + "%" + "<br/>";
        layer.bindPopup(popup);
    });

    regressionHexbin.bringToFront();

    // Turn off the interpolation layers
    map.removeLayer(nitrateratesIDW);
    map.removeLayer(cancernitrateratesIDW);

    // Draw the legend for the regression residuals
    drawRegressionResidualsLegend(breaks);

} // end calculateLinearRegression()


// Establish classification breaks for regression residuals, based on their standard deviation (https://simplestatistics.org/docs/#standarddeviation)
function getRegressionResidualClassBreaks(regressionHexbin) {

    var values = [];
    regressionHexbin.eachLayer(function (layer) {
        var value = layer.feature.properties.residual;
        values.push(value);
    });

    // Use Simple Statistics to get the standard deviation of the residuals (https://simplestatistics.org/docs/#standarddeviation)
    var standardDeviation = ss.sampleStandardDeviation(values);
    var breaks = [-2 * standardDeviation, -1 * standardDeviation, standardDeviation, 2 * standardDeviation];
    console.log("Standard Deviation of Residuals: " + parseFloat(standardDeviation).toFixed(5));

    // Return the array of class breaks
    return breaks;

} // end getRegressionResidualClassBreaks()       


// Set the color of the features depending on which cluster the value falls in
function getRegressionResidualColor(d, breaks) {
    if (d <= breaks[0]) {
        return '#933435'; 
    } else if (d <= breaks[1]) {
        return '#846158';
    } else if (d <= breaks[2]) {
        return '#e0a6ba';
    } else if (d <= breaks[3]) {
        return '#f7cdd7';
    } else if (d > breaks[3]) {
        return '#f8edf1';
    }
} //end


// Create the legend for regression residuals
function drawRegressionResidualsLegend(breaks) {

    // Create a new Leaflet control object, and position it bottom right
    var legend = L.control({
        position: 'bottomright'
    });

    // When the legend is added to the map
    legend.onAdd = function () {

        // Create a new HTML <div> element and give it a class name of "legend"
        var div = L.DomUtil.create('div', 'legend');
        div.innerHTML = "<h3><b>Residuals (Predicted - Observed)</b></h3>";

        var colorMoreThanMinus2StdDev = getRegressionResidualColor(breaks[0], breaks);
        var colorMinus2ToMinus1StdDev = getRegressionResidualColor(breaks[1], breaks);
        var colorMinus1To1StdDev = getRegressionResidualColor(breaks[2], breaks);
        var color1To2StdDev = getRegressionResidualColor(breaks[3], breaks);
        var colorMoreThan2StdDev = '#0571b0';

        div.innerHTML +=
            '<span style="background:' + colorMoreThanMinus2StdDev + '"></span> ' +
            '<label>< -2 Std. Dev. (Underprediction)</label>';
        div.innerHTML +=
            '<span style="background:' + colorMinus2ToMinus1StdDev + '"></span> ' +
            '<label>-2 Std. Dev. &mdash; -1 Std. Dev.</label>';
        div.innerHTML +=
            '<span style="background:' + colorMinus1To1StdDev + '"></span> ' +
            '<label>-1 Std. Dev. &mdash; 1 Std. Dev.</label>';
        div.innerHTML +=
            '<span style="background:' + color1To2StdDev + '"></span> ' +
            '<label>1 Std. Dev. &mdash; 2 Std. Dev.</label>';
        div.innerHTML +=
            '<span style="background:' + colorMoreThan2StdDev + '"></span> ' +
            '<label>> 2 Std. Dev. (Overprediction)</label>';

        // Return the populated legend div to be added to the map   
        return div;
    }; 
    // Add the legend to the map
    legend.addTo(map);
} // end drawRegressionResidualsLegend()