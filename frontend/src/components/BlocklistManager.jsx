import React, { useState, useEffect } from 'react';
import api from "../api"


const BlocklistManager = () => {
  const [blocklist, setBlocklist] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlocklist(); // Fetch immediately on mount

    const intervalId = setInterval(() => {
      fetchBlocklist(); // Fetch every 10 seconds
    }, 30000); // 5000 milliseconds = 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  
  }, []);

  const fetchBlocklist = async () => {
    let isMounted = true; // Cleanup flag
    try {
      const response = await api.get('/api/blocklist/');
      if (isMounted) {
        setBlocklist(response.data.blocklist);
        setError(''); // Clear error on successful fetch
      }
    } catch (error) {
      console.error('Error fetching blocklist:', error);
      if (isMounted) {
        setError('Failed to fetch blocklist. Please try again later.'); // Step 2: Handle error
      }
    }
    return () => { isMounted = false; }; // Cleanup function
  };
  

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  

  const addToBlocklist = async () => {
    try {
      const response = await api.post('/api/blocklist/', { ip_or_domain: input });
      setBlocklist([...blocklist, input]);
      setInput(''); // Clear input after adding
    } catch (error) {
      console.error('Error adding to blocklist:', error);
    }
  };

  const removeFromBlocklist = async (itemToRemove) => {
    try {
      await api.delete('/api/blocklist/', { data: { ip_or_domain: itemToRemove } });
      setBlocklist(blocklist.filter(item => item !== itemToRemove));
    } catch (error) {
      console.error('Error removing from blocklist:', error);
    }
    setSearchQuery(''); // Clear search query after removing
  };

  const filteredBlocklist = blocklist.filter(item => item.includes(searchQuery));
  const listItemStyle = {
    display: 'flex',
    justifyContent: 'space-between', // This aligns the children to opposite ends
    alignItems: 'center', // This centers the items vertically
    marginBottom: '8px', // Adds some space between the list items
  };
  const searchComponentStyle = {
    marginBottom: '16px', // Adds some space between the search input and the list
    width: '300px', // Makes the search component
  }


  return (
    <div style={searchComponentStyle}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search blocklist" />
      <input type="text" value={input} onChange={handleInputChange} placeholder="Add to blocklist" />
      <button onClick={addToBlocklist}>Add</button>
      
      <ul>
        {filteredBlocklist.map((item, index) => (
        
          <li key={index}>
            <div style={listItemStyle}>
                <span>{item}</span>            
                <button onClick={() => removeFromBlocklist(item)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    
    {/* Render blocklist and other UI elements here */}
    </div>
    
  );
};

export default BlocklistManager;