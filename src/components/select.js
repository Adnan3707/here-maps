import React, { useMemo, useRef, useState ,useEffect } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
export default function DebounceSelect({ fetchOptions , defaults , debounceTimeout = 800, ...props }) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);

  const fetchRef = useRef(0);
  const getUserLocation = () => {
    // Check if the browser supports Geolocation API
    if (navigator.geolocation) {
      // Check permission status
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          // Permission already granted, update map center immediately
          navigator.geolocation.getCurrentPosition((position)=>{
            const userLocation = {
              label: 'Current Location',
              value: `${position.coords.latitude},${position.coords.longitude}`
            };
            setOptions(prevOptions => {
              // Check if 'Current Location' already exists in the options array
              if (!prevOptions.find((obj) => obj.label === 'Current Location')) {
                // If not, append the userLocation object to the options array
                return [...prevOptions, userLocation];
              }
              // If 'Current Location' already exists, return the existing options array
              return prevOptions;
            });
          
          });
        } else if (permissionStatus.state === 'prompt') {
          // Permission not granted, but user may grant it
          // Listen for changes in permission status
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              // Permission granted, update map center
              // navigator.geolocation.getCurrentPosition((position)=>{
              //   const userLocation = {
              //     label: 'Current Location',
              //     value: `${position.coords.latitude},${position.coords.longitude}`
              //   };
              //   setOptions(prevOptions => [...prevOptions, userLocation]);
              
              // });
            }
          };
        }
      });
    }
  }

  useEffect(() => {
    if (options.length <= 0) {
      getUserLocation()
    }

  }, [options]); // Update options when defaults change



  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}

// Usage of DebounceSelect

// export  async function fetchUserList(username) {
//   console.log('fetching user', username);
//   return fetch('https://randomuser.me/api/?results=5')
//     .then((response) => response.json())
//     .then((body) =>
//       body.results.map((user) => 
//       console.log(({
//         label: `${user.name.first} ${user.name.last}`,
//         value: user.login.username,
//       }))
//       // ({
//       //   label: `${user.name.first} ${user.name.last}`,
//       //   value: user.login.username,
//       // })
//     ),
//     )
// }

// https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json?apiKey={YOUR_API_KEY}&query=Pariser+1+Berl&prox=Latitude,Longitude

export  async function fetchUserList(username) {
  console.log('fetching user', username);
  return fetch(`https://geocode.search.hereapi.com/v1/geocode?xnlp=CL_JSMv3.1.49.1&apikey=twCd8gW4pQUKn9zkgB8CP-AnxPtC4HXZpwN-oR2BB3o&`+ new URLSearchParams({
    q: username
}))
    .then((response) => response.json())
    .then((body) =>

      body.items.map((item)=>({
        label: `${item.title}`,
        value:`${item.position.lat},${item.position.lng}`
      })
    )
    );
}