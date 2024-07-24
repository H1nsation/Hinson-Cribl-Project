import express from 'express'
import { readLogLine } from './readline'

const app = express();

app.get('/logs', (req, res, ) => {
    // HTTP Streaming headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const filename = req.query.filename as string | undefined
    const keyword = req.query.keyword as string | undefined
    const limit = req.query.limit as string | undefined

    if (filename === undefined) {
        return res.status(400).send('filename query param is required');
    }

    const event = readLogLine(filename, keyword, Number.parseInt(limit ?? '5'));
    event.on('line', (line) => {
        res.write(line + '\n');
    })
    event.on('end', () => {
        // Ensure something is sent in case if the file is empty
        res.end('');
    })
    event.on('error', () => {
        res.status(500).send('Error reading file!')
    })
});

app.listen(3000, () => {
    console.log('[server]: Server is running at http://localhost:3000');
});
