const express=require('express')
const cors=require('cors')
const mysql=require('mysql2/promise')
const app=express()
const compression=require('compression')
const JSONStream=require('JSONStream')
require('dotenv').config()
app.use(compression())
app.use(express.json());
app.use(cors())

const pool=mysql.createPool({
    host: process.env.DB_HOST,

    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
        port:process.env.DB_PORT,
     ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
console.log('connected to database');

app.listen(process.env.PORT,()=>{
    console.log('Server running');
})

app.get('/:id',async (req,res)=>{
  try{
   const {id}=req.params
   let [rows]=await pool.query(`select * from Product where product_id=${id}`)
   res.status(200).json({
    error:false,
    rows
   })
  }catch(error){
    res.status(500).json({
        error:true,
        error
      })
  }
})

app.get('/product/extract',async (req,res)=>{
    try {
      let [rows] = await pool.query('select distinct category from Product')
     
      
      
      res.status(200).json({
        error:false,
        rows
      })
    } catch (error) {
      res.status(500).json({
        error:true,
        error
      })
    }
});

app.get('/search/:category',async (req,res)=>{
  try{
  let category= req.params.category;
  const [rows]=await pool.query(`select product_id from Product where category='${category}' order by created_date desc`)
  
  
  res.status(200).json({
    error:false,
    rows
  })
}catch(err){
  res.status(500).json({
        error:true,
        err
      })
}
})

app.get('/',async (req,res)=>{
  // res.status(200).json({
  //   msg:'hello'
  // });
      let connection;
    try {
      connection=await pool.getConnection();
       res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

  
    const stream = connection.connection.query(
      'SELECT product_id, name, price FROM Product order by created_date desc'
    ).stream();
    stream
      .pipe(JSONStream.stringify())
      .pipe(res);
     stream.on('end', () => {
      if (connection) connection.release();
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (connection) connection.release();
      res.end();
    });
      
      
    } catch (error) {
       console.error('Server error:', error);
    if (connection) connection.release();
    res.status(500).send({ error: 'Database connection failed' });
  
    }
})

