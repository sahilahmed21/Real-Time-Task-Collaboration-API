// backend/src/utils/database.js
const { Pool } = require('pg');
require('dotenv').config();

// We use a connection pool instead of a single client.
// This is a critical performance optimization. A pool manages multiple client
// connections, reusing them for concurrent requests, which avoids the high
// overhead of establishing a new TCP connection to the database for every query.
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// We export a single query function that all other parts of our application will use.
// This centralizes our database access logic. If we ever need to add logging,
// tracing, or change the DB driver, we only have to do it in this one place.
module.exports = {
    query: (text, params) => pool.query(text, params),
};