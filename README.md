# Health Log Tracker (Frontend)

This repository contains the single-file frontend application for tracking personal health metrics, designed to interface with a local **Deno** server that manages data persistence via **CouchDB**.

## 🚀 Getting Started

Since this is a single-file application, running the frontend is extremely simple. However, the application relies entirely on the backend API to function.

### Prerequisites

1. **Deno Runtime:** Ensure Deno is installed on your system.
2. **CouchDB Instance:** You must have a CouchDB server running (e.g., at `http://localhost:5984`).
3. **Backend Server:** You need to have the Deno server running locally on port **8000**. The server must expose a `/api/logs` endpoint for `GET` (fetch all) and `POST` (create new log) requests.

### 1. Run the Frontend

1. Save the `index.html` file locally.
2. Open the file directly in your web browser (`file:///path/to/index.html`).

The browser will then attempt to connect to the backend API at `http://localhost:8000/api/logs`.

### 2. Required Backend API Specification

The application expects the Deno server to handle the following endpoints:

**Method**

**Endpoint**

**Description**

**GET**

`/api/logs`

Retrieves an array of all health logs.

**POST**

`/api/logs`

Saves a new health log entry. Expects a JSON payload like:

**POST Request Body Example:**

```
{
  "datetime": "2025-09-27T08:00",
  "weight": 185.5,
  "bs": 125,
  "pulse": 72,
  "systolic": 120,
  "diastolic": 80,
  "a1c": 5.7,
  "bp": "120/80" 
}


```

## 📐 Application Features

* **Responsive Design:** Fully adaptive layout for mobile, tablet, and desktop viewports using pure CSS media queries.
* **Metrics:** Tracks **Weight (lbs)**, **Blood Sugar (mg/dL)**, Pulse, Systolic BP, Diastolic BP, and optional A1c.
* **Data Views:** Displays data in three modes:
  * **Charts:** Uses Chart.js to visualize trends over time.
  * **Table:** Displays raw data, sorted newest first.
  * **Cards:** Provides a highly visual, mobile-friendly summary of each entry.
* **Framework:** Built using Vanilla JavaScript and the lightweight **Juris.js** library for reactive state management.

