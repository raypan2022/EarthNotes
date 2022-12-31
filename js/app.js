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

  const markerStyle = 'display: block; background-color: darkred; color: white;margin: 0 auto;';

  var markers = [];
  var markerRefer = new WeakMap();
  var moveMode = false;
  var deleteMode = false;
  var overNotes = false;


  // creating my custome notes box
  class USGSOverlay extends google.maps.OverlayView {
    topLeft;
    curMarker;
    div;
    constructor(topLeft, curMarker) {
      super();
      this.topLeft = topLeft;
      this.curMarker = curMarker;
    }

    onAdd() {
      this.div = document.createElement("div");
      this.div.style.position = "absolute";
      this.div.style.height = "200px";
      this.div.style.width = "300px";
      this.div.style.backgroundColor = 'white';

      const notesBox = document.createElement("textarea");
      notesBox.rows = 10;
      notesBox.cols = 30;
      notesBox.style.padding = "10px";

      this.div.appendChild(notesBox);

      const close = document.createElement('button')
      close.innerText = 'X';
      close.onclick = () => {this.hide();};
      close.style.position = 'absolute';
      close.style.top = 0;
      close.style.right = 0;
      close.style.padding = '5px';

      this.div.appendChild(close);

      this.div.onmouseover = function() {
        overNotes = true;
        map.setOptions({scrollwheel: false});
      };
      this.div.onmouseout = function() {
        overNotes = false;
        map.setOptions({scrollwheel: true});
      };

      // still have not figured out how to bring marker to front
      // also have to figure out how to make notes follow the marker
      this.div.onclick = () => {
        markers.forEach(function(marker) {
          marker.setZIndex(0);
          markerRefer.get(marker)[0].div.style.zIndex = "0";
        });
        this.div.style.zIndex = "1";
        this.curMarker.setZIndex(1);
      };
      notesBox.onclick = () => {
        map.panTo({lat:this.topLeft.lat(),lng:this.topLeft.lng() + (60 / 2 ** (newZoom - 1))});
      };

      const panes = this.getPanes();

      panes.floatPane.appendChild(this.div);
    }

    draw() {
      const overlayProjection = this.getProjection();
      const pixel = overlayProjection.fromLatLngToDivPixel(
        this.topLeft
      );

      this.div.style.left = pixel.x + 20 + 'px';
      this.div.style.top = pixel.y - 100 + 'px';
      
    }

    onRemove() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        delete this.div;
      }
    }
    /**
     *  Set the visibility to 'hidden' or 'visible'.
     */
    hide() {
      if (this.div) {
        this.div.style.visibility = "hidden";
      }
    }
    show() {
      if (this.div) {
        this.div.style.visibility = "visible";
      }
    }
  }


  // add marker and notes on click
  google.maps.event.addListener(map, 'click', 
  function(event) {
    console.log(overNotes);
    if (!overNotes) {
      addMarker({coords: event.latLng});
    }
  });


  // add notes function
  function createNote(location, curMarker) {
    const overlay = new USGSOverlay(location, curMarker);
    overlay.setMap(map);
    return overlay;
  }


  // Add markers function 
  function addMarker(props) {
    var marker = new google.maps.Marker({
      position: props.coords,
      map: map,
      draggable: false,
    });

    if(props.iconImg) {
      marker.setIcon(props.iconImg);
    }

    // creating the marker buttons
    var newButton = document.createElement('button');
    markerNum++;
    newButton.innerText = 'marker' + markerNum;
    newButton.style.cssText = markerStyle;
    newButton.onclick = () => map.panTo({lat:props.coords.lat(),lng:props.coords.lng() + (60 / 2 ** (newZoom - 1))});
    sideBar = document.getElementById('side-menu');
    sideBar.appendChild(newButton);


    markers.push(marker);
    markerRefer.set(marker, [createNote(props.coords, marker), newButton]);
    
    marker.addListener('click', function() {
      if (deleteMode) {
        marker.setMap(null);
        markerRefer.get(marker)[0].setMap(null);
        markerRefer.get(marker)[1].remove();
      } else {
        map.panTo({lat:props.coords.lat(),lng:props.coords.lng() + (60 / 2 ** (newZoom - 1))});
        markerRefer.get(marker)[0].show();
      }
    });


    // attempting to bring one box on top of another
    // markerRefer.get(marker)[0].addListener('click' , function() {
    //   markerRefer.get(marker)[0].setZIndex = 100;
    // });


    // moves camera closer to marker
    function zoomTo(location) {
      if (map.getZoom() < 6) {
        newZoom = map.getZoom() * 1.4;
        map.setZoom(newZoom);
      }
      map.panTo({lat:location.lat(),lng:location.lng() + (60 / 2 ** (newZoom - 1))});
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