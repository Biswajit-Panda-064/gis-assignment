const pool = require("../config/db");


const createPlace = async (name, type, latitude, longitude) => {
  const query = `
        INSERT INTO places (name, type, latitude, longitude, location)
        VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($4, $3), 4326))
        RETURNING *;
    `;
  const values = [name, type, latitude, longitude];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getNearbyPlaces = async (latitude, longitude, radius) => {
  const query = `
        SELECT id, name, type, latitude, longitude, 
        ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance
        FROM places
        WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3)
        ORDER BY distance;
    `;
  const values = [latitude, longitude, radius];
  const { rows } = await pool.query(query, values);
  return rows;
};


const getNearestPlace = async (latitude, longitude) => {
  const query = `
        SELECT id, name, type, latitude, longitude, 
        ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance
        FROM places
        ORDER BY distance
        LIMIT 1;
    `;
  const values = [latitude, longitude];
  const { rows } = await pool.query(query, values);
  return rows[0];
};


const getDistanceBetweenPoints = async (lat1, lon1, lat2, lon2) => {
  const query = `
        SELECT ST_DistanceSphere(
            ST_SetSRID(ST_MakePoint($2, $1), 4326),
            ST_SetSRID(ST_MakePoint($4, $3), 4326)
        ) AS distance;
    `;
  const values = [lat1, lon1, lat2, lon2];
  const { rows } = await pool.query(query, values);
  return rows[0].distance;
};

module.exports = {
  createPlace,
  getNearbyPlaces,
  getNearestPlace,
  getDistanceBetweenPoints,
};
