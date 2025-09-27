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
const SERVER_PORT = 8000;
const COUCHDB_URL = "http://127.0.0.1:5984";
const DATABASE_NAME = "health_logs";
const DB_BASE_URL = `${COUCHDB_URL}/${DATABASE_NAME}`;

// Simple function to handle CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow access from any origin (e.g., file://)
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

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

// --- Request Handlers ---

/**
 * Handles OPTIONS requests for CORS preflight.
 */
function handleOptions(request) {
    return new Response(null, {
        status: 204, // No Content
        headers: corsHeaders,
    });
}

/**
 * Handles GET requests to fetch all documents.
 * Queries CouchDB using the _all_docs endpoint with include_docs=true.
 */
async function handleGetLogs() {
    console.log("Handling GET request: Fetching all logs.");
    try {
        // Fetch all documents and include their content
        const couchResponse = await fetch(`${DB_BASE_URL}/_all_docs?include_docs=true`, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (!couchResponse.ok) {
            console.error(`CouchDB GET Error: ${couchResponse.status}`);
            return new Response(JSON.stringify({ error: 'Failed to fetch from database' }), {
                status: couchResponse.status,
                headers: corsHeaders
            });
        }

        const data = await couchResponse.json();
        // Map CouchDB response rows to simple log objects, filtering out design documents if any
        const logs = data.rows
            .map(row => row.doc)
            .filter(doc => doc && !doc._id.startsWith('_design/'));

        return new Response(JSON.stringify(logs), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error) {
        console.error('Error during GET operation:', error);
        return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), {
            status: 500,
            headers: corsHeaders
        });
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

        // Use CouchDB's native POST method for auto-generated IDs
        const couchResponse = await fetch(DB_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLog)
        });

        if (!couchResponse.ok) {
            const errorText = await couchResponse.text();
            console.error(`CouchDB POST Error: ${couchResponse.status} - ${errorText}`);
            return new Response(errorText, {
                status: couchResponse.status,
                headers: corsHeaders
            });
        }

        const result = await couchResponse.json();
        return new Response(JSON.stringify({ success: true, id: result.id }), {
            status: 201, // Created
            headers: corsHeaders,
        });

    } catch (error) {
        console.error('Error during POST operation:', error);
        return new Response(JSON.stringify({ error: `Invalid JSON or server error: ${error.message}` }), {
            status: 500,
            headers: corsHeaders
        });
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
    return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Initialize database and start the server
await ensureDatabaseExists();
console.log(`Deno server running on http://localhost:${SERVER_PORT}`);

// Start the server using Deno's standard library
Deno.serve({ port: SERVER_PORT }, handler);
