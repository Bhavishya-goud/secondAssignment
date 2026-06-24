import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Selement.css';

const Selement = () => {
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const getInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/${id}`);
      const info = response.data.rows[0];
      setProduct(info || {});
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getInfo();
  }, [getInfo]);

  return (
    <div className="product-page-container">
      <Link to="/" className="home-back-link">
        ← Back to Home
      </Link>
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      ) : product.product_id ? (
        <div className="ProductCard">
          <span className="product-badge">{product.category}</span>
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price">${product.price}</div>
          
          <div className="product-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Product ID</span>
              <span className="meta-value">#{product.product_id}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Created On</span>
              <span className="meta-value">
                {product.created_date ? new Date(product.created_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Last Updated</span>
              <span className="meta-value">
                {product.updated_date ? new Date(product.updated_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="error-card">Product not found.</div>
      )}
    </div>
  );
};

export default Selement;
