import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Element from './Element.jsx';
import './Element.css';
import Element_cat from './Element_cat.jsx';

const Home = () => {
  // States
  const [prodata, setProdata] = useState([]);       // Master product data list (Never overwritten)
  const [filteredData, setFilteredData] = useState([]); // Filtered products displayed to user
  const [loading, setLoading] = useState(false);
  const [cat, setCat] = useState([]);
  const [load, setLoad] = useState(false);
  const [filter, setFilter] = useState(false);  
  // Track which category is currently selected (null means none)
  const [activeCategory, setActiveCategory] = useState(null); 

  // Fetch all categories
  async function getCat() {
    setLoad(true);
    try {
      const response = await axios.get('/product/extract');
      setCat(response.data.rows);
    } catch (err) {
      console.log(err);
    } finally {
      setLoad(false);
    }
  }

  // Fetch filtered data based on category click
  async function getCatdata(category) {
    // TOGGLE OFF: If clicking the category that is already active, reset everything
    if (activeCategory === category) {
      setActiveCategory(null);
      setFilteredData([]);
      setFilter(false);
      return;
    }

    // TOGGLE ON: Update active selection layout
    setActiveCategory(category);

    try {
      const response = await axios.get(`/search/${category}`);
      const targetIds = response.data.rows; 
     
      const matchdata = targetIds.map(item => item.product_id);
      
      // Extract full data only for matching IDs from the master prodata array
      const matchedProducts = prodata.filter(item => matchdata.includes(item.product_id));
      
      setFilteredData(matchedProducts);
      setFilter(true);
    } catch (err) {
      console.log(err);
      setFilter(false);
      setActiveCategory(null);
    }
  }

  // Clear all filters completely
  const handleClearFilter = () => {
    setActiveCategory(null);
    setFilteredData([]);
    setFilter(false);
  };

  // Fetch initial master product data list
  async function getData() {
    setLoading(true);
    try {
      const response = await axios.get('/');
      setProdata(response.data);
    } catch (err) {
      console.log('error fetching products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
    getCat();
  }, []);

  // Determine which data stream to render
  const dataToRender = filter ? filteredData : prodata;

  return (
    <div className='Home'>
      <div className='Filter'>
        <p style={{ cursor: 'pointer' }} onClick={handleClearFilter}>
          Categories (Click to Clear)
        </p>
        <div className='categories'>
          {load ? (
            <p>loading..</p>
          ) : (
            cat.map((et, i) => {
              // Determine if this exact map loop item is highlighted
              const isSelected = activeCategory === et.category;

              return (
                <Element_cat 
                  key={i}  
                  category={et.category}
                  // Send selection state to child component
                  click={isSelected} 
                  onClick={() => getCatdata(et.category)} 
                />
              );
            })
          )}
        </div>
      </div>
      
      <p>{filter ? `Filtered Products (${activeCategory})` : "Available"}</p>
      <div className='Box'>
        {loading ? (
          <p>loading...</p>
        ) : (
          dataToRender.map((item, index) => (
            <Element 
              key={index} 
              id={item.product_id} 
              name={item.name} 
              price={item.price}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
