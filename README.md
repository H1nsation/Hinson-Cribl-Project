# Hinson-Cribl-Project

## Description

This service provides on-demand monitoring of various Unix-based server logs without the need to log into each individual machine. The service allows you to issue a REST request to retrieve logs from `/var/log` on the machine receiving the request.

## How to Run

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd Hinson-Cribl-Project
   ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Start the server**:

    ```bash
    npm start
    ```

By default, the server runs on port 3000.

## Usage

### Endpoint

```bash
GET /logs
```

#### Query Parameters

- **filename (required):** The name of the log file within /var/log.
keyword (optional): A keyword to
- **keyword (optional):**  filter the log entries.
- **limit (optional):** The number of matching entries to retrieve. Defaults to 10.

#### Example Request

```bash
GET /logs?filename=auth.log&keyword=error&limit=5
```

#### Example Response

```bash
Jul 17 12:34:56 server sshd[12345]: error: Could not load host key: /etc/ssh/ssh_host_ed25519_keyJul 17 12:35:01 server sshd[12345]: error: Could not load host key: /etc/ssh/ssh_host_rsa_key
```

## Design

1. `ReverseReadStream` is a custom readable stream that reads file in reverse order.
2. `readLogLine` uses `ReverseReadStream` to process chunks line by line, filtering by keyword and limit if available.
3. The lines are emitted through `EventEmitter` so that it can write to the client through HTTP Streaming.

## Notes

- The service assumes that log files are written with the newest events at the end of the file.
- The service retrieves the most recent matching entries up to the specified limit.

## Performance Considerations

- The service is designed to handle log files of >1GB efficiently by streaming and processing lines without loading the entire file into memory.
- Only built-in Node.js modules are used for file reading and processing.
