const mysql = require('mysql2/promise');
const fs = require('fs/promises'); // Built-in Node module for handling files async
const path = require('path');
require('dotenv').config();

// Initialize the connection pool using your .env variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});


async function seedDataFromFile(jsonFileName) {
  let connection;

  try {
   
    const filePath = path.join(__dirname, jsonFileName);
    console.log(`📖 Reading data from: ${filePath}`);
    
    const rawData = await fs.readFile(filePath, 'utf-8');
    const productArray = JSON.parse(rawData);

    // Guard clause against empty arrays
    if (!Array.isArray(productArray) || productArray.length === 0) {
      console.error('❌ Error: The file must contain a non-empty array of products.');
      return;
    }

    console.log(`🚀 Starting bulk upload of ${productArray.length} items from file...`);

    // 2. Establish a dedicated connection and start a transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const CHUNK_SIZE = 500; // Efficient chunk sizing for large datasets
    let totalProcessed = 0;

    // 3. Loop through your data using chunked iteration steps
    for (let i = 0; i < productArray.length; i += CHUNK_SIZE) {
      const chunk = productArray.slice(i, i + CHUNK_SIZE);
      
      // Transform JSON object fields into the 2D matrix structure needed by mysql2
      const valuesMatrix = chunk.map(item => [
        item.product_id,
        item.product_name, // Maps to your database schema 'name' column
        item.category,
        item.price,
        item.created_date ? new Date(item.created_date) : new Date(),
        item.updated_date ? new Date(item.updated_date) : new Date()
      ]);

      const sql = `
        INSERT INTO Product (product_id, name, category, price, created_date, updated_date) 
        VALUES ? 
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          category = VALUES(category),
          price = VALUES(price),
          updated_date = VALUES(updated_date)
      `;

      // Execute statement for this chunk segment
      await connection.query(sql, [valuesMatrix]);
      
      totalProcessed += chunk.length;
      console.log(`⏳ Progress: Successfully written batch (${totalProcessed}/${productArray.length} items)`);
    }

    // 4. Commit all transaction changes simultaneously if no loops crash
    await connection.commit();
    console.log('✅ Success: All product records saved securely to the database.');

  } catch (error) {
    // Revert everything instantly if an operation breaks midway
    if (connection) {
      await connection.rollback();
      console.log('⚠️ Rollback executed: Changes wiped to prevent database corruption.');
    }
    console.error('❌ Insertion or File Error occurred:', error.message);
  } finally {
    // 5. Clean up open connections and shutdown the pool
    if (connection) connection.release();
    await pool.end();
    console.log('🔌 Connection pool terminated cleanly.');
  }
}

// Trigger execution - Pass the exact name of your JSON file here
seedDataFromFile('../generated-data.json');
