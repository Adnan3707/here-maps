import React from "react";
import { useState ,useEffect} from "react";
import Map from "./maps/maps";
import RestaurantList from "./RestaurantList/RestaurantList ";
import { Input } from 'antd';
import { Select } from 'antd';
import DebounceSelect from "./components/select";
import { fetchUserList } from "./components/select";
import { style_rivers,style_road,style_road_water,style_bridges } from "./maps/layers/allLayers";

const apikey = process.env.REACT_APP_HKEY;
console.log(apikey)
const restaurantList = [
  {
    name: "The Fish Market",
    location: { lat: 64.1508, lng: -21.9536 },
  },
  {
    name: "Bæjarins Beztu Pylsur",
    location: { lat: 64.1502, lng: -21.9519 },
  },
  {
    name: "Grillmarkadurinn",
    location: { lat: 64.1475, lng: -21.9347 },
  },
  {
    name: "Kol Restaurant",
    location: { lat: 64.1494, lng: -21.9337 },
  },
];
function App() {

var [userPosition, setuserPosition] = useState({ lat: null, lng: null });



console.log(userPosition)

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
  const onClickHandler_ = (location) => {
    setRestaurantPosition(location);
    console.log(restaurantPosition)
  };
  const onSerachEnd_ = (text) =>{
    console.log(text)
    setTimeout(() => {
      setsearchPosition(text);
    }, 2000); 
  }
  // const onChange = (value) => {
  //   // console.log(`selected ${value}`);
  //   setlayerStyle(value)
  //   console.log(layerStyle)
  // };
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
      </>

   
  );
}

export default App;
