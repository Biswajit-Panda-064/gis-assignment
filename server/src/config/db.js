const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTableIfNotExists = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS places (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      location GEOGRAPHY(POINT, 4326)
    );
  `;

  try {
    await pool.query(query);
    console.log("Table 'places' created (with PostGIS location).");
  } catch (err) {
    console.error("PostGIS not available or error creating table:", err.message);
  }
};
(async () => {
  await createTableIfNotExists(); 
})();
module.exports = pool;
