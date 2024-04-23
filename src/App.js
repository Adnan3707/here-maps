import React from "react";
import { useState ,useEffect} from "react";
import Map from "./maps/maps";
import { Select } from 'antd';
import DebounceSelect from "./components/select";
import { fetchUserList } from "./components/select";
import { style_rivers,style_road,style_road_water,style_bridges } from "./maps/layers/allLayers";
import Menu from './components/menu'
import Search from './components/search'
const apikey = "twCd8gW4pQUKn9zkgB8CP-AnxPtC4HXZpwN-oR2BB3o"
// process.env.REACT_APP_HKEY;
console.log(apikey)

function App() {

var [userPosition, setuserPosition] = useState([]);
 var [defaults, setDefaults] = useState(false);
  const [restaurantPosition, setRestaurantPosition] = useState(null);
  const [searchPosition, setsearchPosition] = useState(null);
  // locations from and to
  const [value, setValue] = useState([]); //from
  const [valueto, setValueto] = useState([]);
  const [waypoints, setWaypoints] = useState(false);
  const [waypointsdisplay, setWaypointsdisplay] = useState([]);
 // layers
  const [layerStyle, setlayerStyle] = useState();
  const [vector, setVector] = useState();

  // POI States
  const [discover,setDiscover] = useState([])
  const onClickHandler_ = (location) => {
    setRestaurantPosition(location);
    console.log(restaurantPosition)
  };

  return (
    <><div>
      {/* <RestaurantList list={restaurantList} onClickHandler={onClickHandler_} /> */}
      {/* <Search placeholder="input search text" enterButton="Search" size="large" onChange={(e) => onSerachEnd_(e.target.value)} loading /> */}
      </div>
      <div style={{ display: 'flex', gap: '10px',border: '2px solid black'}}>
      <DebounceSelect
       mode="multiple"
        value={value}
        placeholder="Location From"
        fetchOptions={fetchUserList}
       
        onChange={(newValue) => {
          if(newValue.length > 0){
            setuserPosition({"lat":newValue[0].value.split(',')[0],"lng": newValue[0].value.split(',')[1] });
          }

          setValue(newValue);
        } }
        style={{
          width: '35%', // Take up available space
          background:"green"
        }} />
        <DebounceSelect
        mode="multiple"
        value={waypointsdisplay}
        placeholder="Via"
        fetchOptions={fetchUserList}
        onChange={(newValue) => {
          if(newValue.length > 0){
          console.log(newValue.map((obj)=>({lat:obj.value.split(',')[0],lng: obj.value.split(',')[1] })))
          setWaypoints(newValue.map((obj)=>({lat:obj.value.split(',')[0],lng: obj.value.split(',')[1] })));
          // setValueto(newValue);
          // setRestaurantPosition({"lat":newValue[0].value.split(',')[0],"lng": newValue[0].value.split(',')[1] })
        }
        setWaypointsdisplay(newValue)
        } }
        style={{
          width: '30%' // Take up available space
        }} />
      <DebounceSelect
       mode="multiple"
        value={valueto}
        placeholder="Location To"
        fetchOptions={fetchUserList}
        onChange={(newValue) => {
          if(newValue.length > 0){
            setRestaurantPosition({"lat":newValue[0].value.split(',')[0],"lng": newValue[0].value.split(',')[1] });
          }
          setValueto(newValue)
        } }
        style={{
          width: '35%' // Take up available space
        }} />
    </div>
    <div>
        <Map
          apikey={apikey}
          userPosition={userPosition}
          restaurantPosition={restaurantPosition} 
          layerStyle = {layerStyle}
          waypoints={waypoints}
          layerType ={vector}
          discover={discover}
          />
      </div>
      <div style={{ display: 'flex', gap: '10px',border: '2px solid yellow'}}>
      <Select
    showSearch
    placeholder="Select a Layer"
    optionFilterProp="children"
    onChange={(value)=>{ setlayerStyle(value)}}
    options={[
      {
        value: style_rivers,
        label: 'Rivers only',
      },
      {
        value: style_road,
        label: 'Roads Only',
      },
      {
        value: style_road_water,
        label: 'Road and Rivers',
      },
      {
        value: style_bridges,
        label: 'Bridges',
      },
      {
        value: '',
        label: 'Reset',
      },
    ]}
    style={{
      width: '50%' // Take up available space
    }}
  />

      <Select
    showSearch
    placeholder="Select Vector"
    optionFilterProp="children"
    onChange={(value)=>{ console.log(value) ;
      setVector(value)}}
    options={[
      {
        value: 'map',
        label: 'map',
      },
      {
        value: 'truck',
        label: 'truck restricted',
      },
      {
        value: 'traffic',
        label: 'real trafic',
      }
    ]}
    style={{
      width: '50%' // Take up available space
    }}
  />

    </div>
    <div>
    <Search state={setDiscover}/>
    </div>
      </>

   
  );
}

export default App;
