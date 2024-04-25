import React, { useState } from 'react';
import { AudioOutlined } from '@ant-design/icons';
import { Input, Space } from 'antd';
const { Search } = Input;
const suffix = (
  <AudioOutlined
    style={{
      fontSize: 16,
      color: '#1677ff',
    }}
  />
);


function App({state}){
    const onSearch = (value, _e, info) => {
        console.log(info?.source, value);
        // console.log(fetchUserList(value))
        navigator.geolocation.getCurrentPosition(async (position) => {
            // Obtain the latitude and longitude from the position object
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            // Perform operations with the coordinates
            console.log(`Current position: ${latitude}, ${longitude}`);
            
            // Example: Make an API call with the coordinates
            const apiKey = 'twCd8gW4pQUKn9zkgB8CP-AnxPtC4HXZpwN-oR2BB3o';
            const query = value;
            const limit = 5;
            const apiUrl = `https://discover.search.hereapi.com/v1/discover?apikey=${apiKey}&q=${encodeURIComponent(query)}&at=${latitude},${longitude}&limit=${limit}`;
            
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                // Process the data (e.g., display nearest coffee shops)
                state(null) // empty previous values
                state(data)
                // data.items.forEach(item => {
                //     console.log(`Name: ${item.title}, Address: ${item.address.label}, Distance: ${item.distance} meters`);
                // });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }, (error) => {
            console.error('Error getting location:', error);
        });
        
        
    }
 return   (
        <Space direction="vertical">
          <Search
            placeholder="Places to search NearBy"
            onSearch={onSearch}
            style={{
              width: 200,
            }}
          />
        </Space>
      ); 
} 
export default App;