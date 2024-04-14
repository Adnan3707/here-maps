import React, { useEffect, useRef,useState } from 'react';
import H from '@here/maps-api-for-javascript';
const Map = ( props ) => {
  var map = useRef(null);
    const mapRef = useRef(null);
    const platform = useRef(null)
    const { apikey, userPosition, restaurantPosition ,layerStyle ,waypoints} = props;
    const [layerType, setLayerType] = useState('map'); // Default layer type
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
            const rasterTileLayer = new H.map.layer.TileLayer(rasterTileProvider);
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
            const behavior = new H.mapevents.Behavior(
              new H.mapevents.MapEvents(newMap)
            );
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


      // Return a div element to hold the map
      return <div style={ { width: "100%", height: "500px" } } ref={mapRef} />;

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
                lineWidth: 5
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

  export default Map;