import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BlocklistManager = () => {
  const [blocklist, setBlocklist] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBlocklist();
  }, []);

  const fetchBlocklist = async () => {
    const response = await axios.get('http://192.168.1.13:8005/api/blocklist/');
    setBlocklist(response.data.blocklist);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const addToBlocklist = async () => {
    try {
      const response = await axios.post('http://192.168.1.13:8005/api/blocklist/', { ip_or_domain: input });
      setBlocklist([...blocklist, input]);
      setInput(''); // Clear input after adding
    } catch (error) {
      console.error('Error adding to blocklist:', error);
    }
  };

  const removeFromBlocklist = async (itemToRemove) => {
    try {
      await axios.delete('http://192.168.1.13:8005/api/blocklist/', { data: { ip_or_domain: itemToRemove } });
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
    </div>
  );
};

export default BlocklistManager;