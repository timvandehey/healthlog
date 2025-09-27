/**
 * Deno Server for Health Log Tracker
 * * This server proxies requests from the frontend (running on a potentially different
 * origin, like file://) to a local CouchDB instance.
 * * Dependencies: None (uses Deno standard library and global fetch).
 * * To Run: 
 * deno run --allow-net --allow-read server.js
 * (Requires network access to port 8000 and CouchDB on port 5984)
 */

// --- Configuration ---
const SERVER_PORT = parseInt(Deno.env.get("PORT") || "8000", 10);
const COUCHDB_URL = Deno.env.get("COUCHDB_URL") || "http://127.0.0.1:5984";
const DATABASE_NAME = Deno.env.get("DB_NAME") || "health_logs";
const DB_BASE_URL = `${COUCHDB_URL}/${DATABASE_NAME}`;


// Simple function to handle CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow access from any origin (e.g., file://)
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

/**
 * Creates a JSON response with consistent CORS headers.
 * @param {any} body The response body, which will be JSON stringified.
 * @param {number} status The HTTP status code.
 * @returns {Response}
 */
function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
        status,
        headers: corsHeaders,
    });
}


// --- CouchDB Setup Utility ---

/**
 * Checks if the database exists and creates it if it doesn't.
 */
async function ensureDatabaseExists() {
    console.log(`Checking for CouchDB database: ${DATABASE_NAME}`);
    try {
        const checkResponse = await fetch(DB_BASE_URL);
        
        if (checkResponse.status === 404) {
            console.log("Database not found. Creating...");
            const createResponse = await fetch(DB_BASE_URL, { method: 'PUT' });
            
            if (createResponse.ok) {
                console.log(`Database '${DATABASE_NAME}' created successfully.`);
            } else {
                const errorText = await createResponse.text();
                console.error(`Failed to create database: ${errorText}`);
            }
        } else if (checkResponse.ok) {
            console.log(`Database '${DATABASE_NAME}' is ready.`);
        } else {
            console.error(`Error checking database status: ${checkResponse.status}`);
        }
    } catch (error) {
        console.error(`Could not connect to CouchDB at ${COUCHDB_URL}. Is CouchDB running?`, error.message);
        // Do not crash the server, but log the critical error
    }
}

/**
 * Ensures that the necessary Mango query indexes exist in the database.
 */
async function ensureIndexesExist() {
    console.log("Checking for required database indexes...");
    const indexDefinition = {
        index: {
            fields: ['datetime'] // We want to query and sort by the datetime field
        },
        name: 'datetime-index', // A descriptive name for the index
        type: 'json'
    };

    try {
        const response = await fetch(`${DB_BASE_URL}/_index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(indexDefinition)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.result === 'created') {
                console.log("Index 'datetime-index' was created.");
            } else {
                console.log("Index 'datetime-index' already exists.");
            }
        } else {
            console.error(`Failed to create index: ${await response.text()}`);
        }
    } catch (error) {
        console.error(`Error ensuring index exists: ${error.message}`);
    }
}
// --- Request Handlers ---

/**
 * Handles OPTIONS requests for CORS preflight.
 */
function handleOptions(request) {
    return new Response(null, { status: 204, headers: corsHeaders });
}

/**
 * Handles GET requests to fetch all documents.
 * Queries CouchDB using a Mango query to sort by datetime descending.
 */
async function handleGetLogs() {
    console.log("Handling GET request: Fetching all logs.");
    try {
        // Use the _find endpoint to query with sorting
        const mangoQuery = {
            selector: {
                // Select all documents where 'datetime' exists. This also implicitly filters out design docs.
                datetime: { '$gt': null } 
            },
            sort: [{ datetime: 'desc' }] // Sort by datetime, newest first
        };

        const couchResponse = await fetch(`${DB_BASE_URL}/_find`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mangoQuery)
        });

        if (!couchResponse.ok) {
            console.error(`CouchDB GET Error: ${couchResponse.status}`);
            return jsonResponse({ error: 'Failed to fetch from database', details: await couchResponse.text() }, couchResponse.status);
        }

        const data = await couchResponse.json();
        const logs = data.docs; // The documents are in the 'docs' array

        return jsonResponse(logs, 200);

    } catch (error) {
        console.error('Error during GET operation:', error);
        return jsonResponse({ error: `Server error: ${error.message}` }, 500);
    }
}

/**
 * Handles POST requests to create a new log document.
 * Inserts the log directly into the CouchDB database.
 */
async function handlePostLog(request) {
    console.log("Handling POST request: Saving new log.");
    try {
        const newLog = await request.json();

        // Basic validation: ensure required fields exist.
        if (!newLog.datetime || !newLog.weight) {
            return jsonResponse({ error: 'Invalid log data: "datetime" and "weight" are required.' }, 400);
        }


        // Use CouchDB's native POST method for auto-generated IDs
        const couchResponse = await fetch(DB_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLog)
        });

        if (!couchResponse.ok) {
            const errorText = await couchResponse.text();
            console.error(`CouchDB POST Error: ${couchResponse.status} - ${errorText}`);
            return jsonResponse({ error: 'Failed to save to database', details: errorText }, couchResponse.status);
        }

        const result = await couchResponse.json();
        return jsonResponse({ success: true, id: result.id, rev: result.rev, ...newLog }, 201);
    } catch (error) {
        console.error('Error during POST operation:', error);
        return jsonResponse({ error: `Invalid JSON or server error: ${error.message}` }, 400);
    }
}

// --- Main Request Router ---

async function handler(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
        return handleOptions(request);
    }
    
    // Check for the specific API endpoint
    if (url.pathname === '/api/logs') {
        if (request.method === 'GET') {
            return handleGetLogs();
        } else if (request.method === 'POST') {
            return handlePostLog(request);
        }
    }
    
    // Handle 404 for all other paths
    return jsonResponse({ error: 'Not Found' }, 404);
}

// Initialize database and start the server
await ensureDatabaseExists();
await ensureIndexesExist(); // Create our index after ensuring DB exists
console.log(`Deno server running on http://localhost:${SERVER_PORT}`);

// Start the server using Deno's standard library
Deno.serve({ port: SERVER_PORT }, handler);
