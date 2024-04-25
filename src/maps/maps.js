import React, { useEffect, useRef,useState } from 'react';
import H from '@here/maps-api-for-javascript';
import '../components/css/bubble.css'
import { PushpinOutlined } from '@ant-design/icons'; 
import pinIcon from '../components/icon/redPoin';


const Map = ( props ) => {
  var map = useRef(null);
    const mapRef = useRef(null);
    const platform = useRef(null)
    const { apikey, userPosition, restaurantPosition ,layerStyle ,waypoints,discover} = props;
    const [layerType, setLayerType] = useState('map'); // Default layer 
    // create default UI with layers provided by the platform
  var uiRef = useRef(null);

    // places


    useEffect(
        () => {
          // Check if the map object has already been created
          if (!map.current) {
            // Create a platform object with the API key
            platform.current = new H.service.Platform({ apikey });
            // Create a new Raster Tile service instance
            const rasterTileService = platform.current.getRasterTileService({
              queryParams: {
                style: "explore.day",
                size: 512,
              },
            });
            // Creates a new instance of the H.service.rasterTile.Provider class
            // The class provides raster tiles for a given tile layer ID and pixel format
            const rasterTileProvider = new H.service.rasterTile.Provider(
              rasterTileService
            );
            // Create a new Tile layer with the Raster Tile provider
            new H.map.layer.TileLayer(rasterTileProvider);
            // Create a new map instance with the Tile layer, center and zoom level

            var defaultLayers = platform.current.createDefaultLayers(); 
            const newMap = new H.Map(mapRef.current,
              defaultLayers.vector.normal[layerType],
              {
                  pixelRatio: window.devicePixelRatio,
                  center:  { lat: 0, lng: 0 },
                  zoom: 3,
              },
          );

            // Add panning and zooming behavior to the map
            new H.mapevents.Behavior(
              new H.mapevents.MapEvents(newMap)
            );
            var ui = H.ui.UI.createDefault(newMap, defaultLayers);
            uiRef.current  = H.ui.UI.createDefault(newMap, defaultLayers);
            // Set the map object to the reference
            map.current = newMap;
          }
        },
        // Dependencies array
        [apikey, userPosition, restaurantPosition,layerStyle,layerType]
      );
      if (restaurantPosition) {
        calculateRoute(platform.current, map.current, userPosition, restaurantPosition,waypoints);
        map.current.setCenter({ lat: userPosition.lat, lng: userPosition.lng });
        map.current.setZoom(10);
    }          
     if(layerStyle){
      console.log('hit')
      // apply style
      changeStyle(map.current,layerStyle) 
    }    
      // Update layer type when props change
  useEffect(() => {
    if (props.layerType) {
      setLayerType(props.layerType);
      console.log(map.current)
    }
  }, [props.layerType]);
    // Update map when layerType changes
    useEffect(() => {
      if (map.current && layerType) {
        map.current.setBaseLayer(platform.current.createDefaultLayers().vector.normal[layerType]);
      }
    }, [layerType]);

     // if user grants permission
    const updateMapCenter = (position) => {
      if (map.current) {
        map.current.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        map.current.setZoom(9);
        map.current.addObject(currentLocationMarkerIcon(position.coords.latitude,position.coords.longitude,H) )
      }
    };
  
    // Check if the browser supports Geolocation API
    if (navigator.geolocation) {
      // Check permission status
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          // Permission already granted, update map center immediately
          navigator.geolocation.getCurrentPosition(updateMapCenter);
        } else if (permissionStatus.state === 'prompt') {
          // Permission not granted, but user may grant it
          // Listen for changes in permission status
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              // Permission granted, update map center
              navigator.geolocation.getCurrentPosition(updateMapCenter);
            }
          };
        }
      });
    }

      // user inputes POI

    useEffect(() => {
      // Check if `discover` and `discover.items` are defined
      if (discover && discover.items && Array.isArray(discover.items) && discover.items.length > 0) {
     
          addInfoBubble(map.current,uiRef.current,discover.items);
          // Process each item

      } else {
          console.log('discover.items is not defined or empty');
      }
  }, [discover]);
  
  

      // Return a div element to hold the map
      return <><div style={{ width: "100%", height: "500px" }} ref={mapRef} /></>;

   }
   function getMarkerIcon(color) {
    const svgCircle = `<svg width="20" height="20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="marker">
                <circle cx="10" cy="10" r="7" fill="${color}" stroke="${color}" stroke-width="4" />
                </g></svg>`;
    return new H.map.Icon(svgCircle, {
        anchor: {
            x: 10,
            y: 10
        }
    });
   }
   function calculateRoute(platform, map, start, destination,waypoints) {
    function routeResponseHandler(response) {
        const sections = response.routes[0].sections;
        const lineStrings = [];
        var waypointMarkers = [
          // Add a marker for the user
          new H.map.Marker(start, {
              icon: getMarkerIcon('red')
          }),
          // Add a marker for the selected restaurant
          new H.map.Marker(destination, {
              icon: getMarkerIcon('green')
          })
      ]
        sections.forEach((section) => {
            // convert Flexible Polyline encoded string to geometry
            lineStrings.push(H.geo.LineString.fromFlexiblePolyline(section.polyline));
        });
        const multiLineString = new H.geo.MultiLineString(lineStrings);
        const bounds = multiLineString.getBoundingBox();

        // Create the polyline for the route
        const routePolyline = new H.map.Polyline(multiLineString, {
            style: {
                lineWidth: 5,
                strokeColor: 'rgba(0, 0, 255, 1)',
                lineDash: [0, 2],
                lineTailCap: 'arrow-tail',
                lineHeadCap: 'arrow-head'
            }
        });

        // Remove all the previous map objects, if any
        map.removeObjects(map.getObjects());
        // Add the polyline to the map
        map.addObject(routePolyline);
        
        if(waypoints){
          waypoints.forEach((waypoint) => {
            const waypointMarker = new H.map.Marker({
                lat: waypoint.lat,
                lng: waypoint.lng
            });
            // Populate the waypointMarkers array:
            waypointMarkers.push(waypointMarker);
        });
        }
        map.addObjects(waypointMarkers);
    }

    // Get an instance of the H.service.RoutingService8 service
    const router = platform.getRoutingService(null, 8);

    // Define the routing service parameters
    const routingParams = {
      'origin': `${start.lat},${start.lng}`,
      'destination': `${destination.lat},${destination.lng}`,
      'transportMode': 'car',
      'return': 'polyline'
    };
    if(waypoints){
      routingParams['via']=  new H.service.Url.MultiValueQueryParameter(
        waypoints.map(wp => `${wp.lat},${wp.lng}`)
      )
    }
    console.log(routingParams)
    // Call the routing service with the defined parameters
    router.calculateRoute(routingParams, routeResponseHandler, console.error);
    // Assuming you have a reference to the map stored in map.current
// map.current.setCenter({lat: start.lat, lng: start.lng });

   }
   function changeStyle(newMap,layerStyle){
    var baseLayer = newMap.getBaseLayer();
    if (layerStyle) {
      baseLayer.getProvider().setStyle(new H.map.Style(layerStyle));  
     
  }
   } 
   function currentLocationMarkerIcon(lat,lng,H) {
    let color = 'blue'
    const svgCircle = `<svg width="20" height="20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="marker">
                <circle cx="10" cy="10" r="7" fill="${color}" stroke="${color}" stroke-width="4" />
                </g></svg>`;
                var icon = new H.map.Icon(svgCircle, {
                  anchor: {
                      x: 10,
                      y: 10
                  }
              });
    //  new H.map.Icon(pin, {
    //     anchor: {
    //         x: lat,
    //         y: lng
    //     }
    // });
    return new H.map.Marker({ lat: lat, lng: lng }, { icon:  icon });

   }
//    function addDomMarker() {
//     const markerElement = document.createElement('div');

//     markerElement.style.userSelect = 'none';
//     markerElement.style.webkitUserSelect = 'none';
//     markerElement.style.msUserSelect = 'none';
//     markerElement.style.mozUserSelect = 'none';
//     markerElement.style.cursor = 'default';

//     markerElement.style.backgroundColor = '#cd5f58';
//     markerElement.style.padding = '10px';
//     markerElement.style.width = '32px';
//     markerElement.style.height = '32px';
//     markerElement.style.font = 'normal 12px arial';
//     markerElement.style.lineHeight = '12px';
//     markerElement.style.textAlign = 'center';

//     markerElement.innerHTML = 'Pike Place Market';


//     const changeOpacity = (evt) => {
//         evt.target.style.opacity = 0.5;
//     }

//     const restoreOpacity = (evt) => {
//         evt.target.style.opacity = 1;
//     }

//     // create dom icon and event listeners
//     const markerIcon = new H.map.DomIcon(markerElement, {
//         // is called when marker enters the viewport
//         onAttach: (el) => {
//             el.addEventListener('mouseover', changeOpacity);
//             el.addEventListener('mouseout', restoreOpacity);
//         },
//         // called when the marker leaves the viewport
//         onDetach: (el) => {
//             el.removeEventListener('mouseover', changeOpacity);
//             el.removeEventListener('mouseout', restoreOpacity);
//         }
//     });

//     const marker = new H.map.DomMarker(
//         { lat: 47.6101359, lng: -122.3420567},
//         { icon: markerIcon }
//     );

//     return marker;

// }
 function addPopup_places(H,ui,content, position){
 var infoBubble =  new H.ui.InfoBubble(position, {
    // read custom data
    content: content,
  });
  console.log('ui ref',ui)
  ui.addBubble(infoBubble)
  console.log(ui.getBubbles)
  // infoBubble.setContent('<div>New content for the info bubble</div>');
  // infoBubble.setPosition({ lat: 52.5, lng: 13.4 });
 }
 function addMarkerToGroup(group, coordinate, html) {
                  const iconSize = new H.math.Size(32, 32);
                var myIcon = new H.map.Icon(pinIcon, {size: iconSize});
        var marker = new H.map.Marker(coordinate, {
          icon: myIcon
      });
  // add custom data to the marker
  marker.setData(html);
  group.addObject(marker);
}

function addInfoBubble(map,ui,data) {
  var group = new H.map.Group();
  map.addObject(group);

  // add 'tap' event listener, that opens info bubble, to the group
  group.addEventListener('tap', function (evt) {
    // event target is the marker itself, group is a parent event target
    // for all objects that it contains
    var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
      // read custom data
      content: evt.target.getData()
    });
    // show info bubble
    ui.addBubble(bubble);
  }, false);

 data.forEach((value, index) =>{

   addMarkerToGroup(group, value.position,
     `<div>${value.address.label}<br /></div>`);
 
 })

}

  export default Map;