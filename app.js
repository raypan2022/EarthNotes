// important declarations
// require('dotenv').config();

// Handling the api key
// api_key = process.env.API_KEY;
api_key = 'notmykey'
const script = document.createElement('script');
script.src = "https://maps.googleapis.com/maps/api/js?key=" + api_key + "&callback=initMap&libraries=places&v=weekly"
script.defer = true;
document.head.appendChild(script);


// Initialize and add the map
function initMap() {

  // Map options
  var options = {
    zoom: 2,
    center: {lat:28.0339,lng:1.6596}
  }


  // New map
  var map = new google.maps.Map(document.getElementById("map"), options);


  // Useful variables, initialized here
  var markerNum = 0
  const markerStyle = 'display: block; background-color: darkred; color: white;margin: 0 auto;';
  var markers = Object.create({});

  // add marker on click
  google.maps.event.addListener(map, 'click', 
  function(event) {
    addMarker({coords: event.latLng});
  });


  // Add markers function
  function addMarker(props) {
    var marker = new google.maps.Marker({
      position: props.coords,
      map: map,
      draggable: true,
    });

    if(props.iconImg) {
      marker.setIcon(props.iconImg);
    }

    if(props.content) {
      var infoWindow = new google.maps.InfoWindow({
        content: props.content,
      });

      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
    }


    // finding the viewport of locations
    const bounds = new google.maps.LatLngBounds();
    const geocoder = new google.maps.Geocoder();
    geocoder
    .geocode({location: props.coords})
    .then((response) => {
      place = response.results[0];
      
      // creating the marker buttons
      newButton = document.createElement('button');
      markerNum++;
      newButton.innerText = 'marker' + markerNum;
      newButton.style.cssText = markerStyle;
      newButton.setAttribute('onclick', fitScreen(place));
      sideBar = document.getElementById('side-menu');
      sideBar.appendChild(newButton);
    });
  }


  // receives input in searchbox
  // creates the searchbox object
  var input = document.getElementById('location');
  var searchBox = new google.maps.places.SearchBox(input);


  // purely for getting the most accurate predictions
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  // zooms in on the location using its viewport
  function fitScreen(place) {
    if (!place) {
      return;                             // nothing will happen if no results
    }

    // Clear out the old markers. Currently do not need.

    // markers.forEach((marker) => {
    //   marker.setMap(null);
    // });
    // markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();


    if (!place.geometry || !place.geometry.location) {
      console.log("Returned place contains no geometry");
      return;
    }

    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  }


  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const place = searchBox.getPlaces()[0];         // selection of prediction
    document.getElementById('location').value = ''
    fitScreen(place)
    // Create a marker for each place.
    marker = new google.maps.Marker({
      map,
      draggable: true,
      title: place.name,
      position: place.geometry.location,
    });
  });

  
}

window.initMap = initMap;
