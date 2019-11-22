// API Earthquake link
var earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
// API Earthquake link
var faultLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


function markerSize(mag) {
  return (mag ** 2) * 10000;
}

function markerColor(mag) {
  return mag > 5 ? "red":
    mag > 4 ? "orange":
      mag > 3 ? "gold":
        mag > 2 ? "yellow":
          mag > 1 ? "yellowgreen":
            "greenyellow"; // <= 1 default
}

// Perform GET request to query earthquake URL
d3.json(earthquakeLink, function(data) {
  // Send data.features object to the createFeatures function
  createFeatures(data.features);
});

// Perform GET request to query faults URL
d3.json(faultLink, function(data) {
  // Send data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData, faultLink) {

  var faults = L.geoJSON(faultLink, {
  onEachFeature : function (feature, layer) {
        L.polyline(feature.geometry.coordinates);
      },
      style: {
        weight: 2,
        color: 'blue'
      }
    });

  var earthquakes = L.geoJSON(earthquakeData, {
  // Define a function to run once for each feature in the features array
  // Give each feature a popup with place and time of the earthquake
  onEachFeature : function (feature, layer) {

    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " +  feature.properties.mag + "</p>")
    },     pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.properties.mag),
        fillOpacity: 0.6,
        stroke: black,
    })
  }
  });
    
  // Sending earthquakes and faults layers to createMap function
  createMap(earthquakes, faults);
}

function createMap(earthquakes, faults) {

  // Define satelitemap and darkmap layers
  var satelitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var piratesmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.pirates",
    accessToken: API_KEY
    });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satelite Map": satelitemap,
    "Street Map": streetmap,
    "Pirate Map": piratesmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": faults
  };

  // Create our map, giving it the satelitemap, earthquakes, and 
  // faults layers to display on load
  var myMap = L.map("map", {
    center: [31.6,-99.6],
    zoom: 3,
    layers: [piratesmap, earthquakes, faults]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
  
      var div = L.DomUtil.create('div', 'info legend'),
          magnitudes = [0, 1, 2, 3, 4, 5];
  
      for (var i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' + 
      + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };
  
  legend.addTo(myMap);

}



  
