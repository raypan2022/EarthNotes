// important declarations, ignore will implement later
// require('dotenv').config();
// Handling the api key
// api_key = process.env.API_KEY;

// calls the google maps api 
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
  map.setOptions({minZoom: 2});

  
  // Useful variables, initialized here 
  var markerNum = 0
  var markers = [];
  var markerRefer = new WeakMap();
  var moveMode = false;
  var deleteMode = false;


  // add marker and notes on click
  google.maps.event.addListener(map, 'click', 
  function(event) {
    addMarker({coords: event.latLng});
  });

  // Add markers function 
  function addMarker(props) {
    markers.forEach((marker) => {marker.setIcon("http://maps.google.com/mapfiles/kml/paddle/red-circle.png")});

    var marker = new google.maps.Marker({
      position: props.coords,
      map: map,
      icon: "http://maps.google.com/mapfiles/kml/paddle/blu-circle.png",
      draggable: false,
    });

    if(props.iconImg) {
      marker.setIcon(props.iconImg);
    }


    // removing previous content in the notes area
    function clearNotes() {
      var notes = document.getElementById('notes')
    while (notes.firstChild) {
      notes.removeChild(notes.lastChild);
    }
    }
    clearNotes();

  
    // creating the text area corresponding with the marker
    var noteTitle = document.createElement('textarea')
    var noteBody = document.createElement('textarea');
    noteTitle.rows = 2;
    noteTitle.style.fontFamily = "sans-serif";
    noteTitle.style.resize = "none";
    noteTitle.style.fontSize = "40px";
    noteTitle.style.color = "#5F6A6A";
    noteTitle.style.fontWeight = "bold";
    noteTitle.style.width = "100%";
    noteTitle.style.borderRadius = "20px";
    noteTitle.style.boxShadow = "none";
    noteTitle.style.border = "none";
    noteTitle.style.outline = "none";
    noteTitle.style.padding = "10px"
    noteTitle.placeholder = "Enter a title...";
    noteBody.placeholder = "Write something in the notes body...";
    noteBody.style.display = "block";
    noteBody.style.border = "none";
    noteBody.style.padding = "10px";
    noteBody.style.boxShadow = "none";
    noteBody.style.overflow = "auto";
    noteBody.style.outline = "none";
    noteBody.style.resize = "none";
    noteBody.style.width = "100%";
    noteBody.style.height = "80%";
    noteBody.style.fontSize = "16px";
    notes.append(noteTitle, noteBody);
    notesPair = {
      title: noteTitle,
      body: noteBody
    };


    // creating the marker buttons
    var newButton = document.createElement('button');
    markerNum++;
    newButton.innerText = 'marker' + markerNum;
    newButton.classList.add("button");
    newButton.onclick = () => {
      map.panTo({lat:props.coords.lat(),lng:props.coords.lng()});
      clearNotes();
      notes.append(noteTitle, noteBody);
      markers.forEach((marker) => {marker.setIcon("http://maps.google.com/mapfiles/kml/paddle/red-circle.png")});
      marker.setIcon("http://maps.google.com/mapfiles/kml/paddle/blu-circle.png");
    };
    sideBar = document.getElementById('side-menu');
    sideBar.appendChild(newButton);
    

    markers.push(marker);
    markerRefer.set(marker, [notesPair, newButton]);
    
    marker.addListener('click', function() {
      if (deleteMode) {
        marker.setMap(null);
        clearNotes();
        markerRefer.get(marker)[1].remove();
      } else {
        clearNotes();
        markers.forEach((marker) => {marker.setIcon("http://maps.google.com/mapfiles/kml/paddle/red-circle.png")});
        marker.setIcon("http://maps.google.com/mapfiles/kml/paddle/blu-circle.png");
        notes.append(markerRefer.get(marker)[0].title, markerRefer.get(marker)[0].body);
        map.panTo({lat:props.coords.lat(),lng:props.coords.lng()});
      }
    });


    // moves camera closer to marker
    function zoomTo(location) {
      if (map.getZoom() < 6) {
        newZoom = map.getZoom() * 1.4;
        map.setZoom(newZoom);
      }
      map.panTo({lat:location.lat(),lng:location.lng()});
    }


    // zoom to location of interest
    zoomTo(props.coords);
  }


  // receives input in searchbox
  // creates the searchbox object
  var input = document.getElementById('location');
  var searchBox = new google.maps.places.SearchBox(input);


  // purely for getting the most accurate predictions
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });


  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const place = searchBox.getPlaces()[0];         // selection of prediction
    document.getElementById('location').value = '';


    // Create a marker for each place.
    addMarker({coords: place.geometry.location})
  });


  // code regarding the rest of the html file

  // setting up the side buttons
  move = document.getElementById('move-control')
  move.onclick = function() {
    if (!deleteMode) {
      moveMode = true; 
    markers.forEach((marker) => marker.setDraggable(true));
    }
  }
  remove = document.getElementById('remove-control');
  remove.onclick = function() {
    if (!moveMode) {
      deleteMode = true;
    }
  } 
  cancel = document.getElementById('cancel-control')
  cancel.onclick = function() {
    moveMode = false;
    markers.forEach((marker) => marker.setDraggable(false));
    deleteMode = false;
  }
}

window.initMap = initMap;