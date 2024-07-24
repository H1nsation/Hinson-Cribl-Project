import { ReverseReadStream } from './stream';
import EventEmitter from 'events';

export function readLogLine(filename: string, keyword?: string, limit?: number) {
    const stream = new ReverseReadStream(`/var/log/${filename}`);
    const event = new EventEmitter();
    let prev = '';
    let maxAppearance = limit

    const processLine = (line: string) => {
        if (keyword === undefined) {
            event.emit('line', line)
        } else {
            const numMatches = (line.match(new RegExp(keyword, 'g')) || []).length;
            if (!numMatches) {
                return;
            }
            if ((limit === undefined) || (limit !== undefined && maxAppearance !== undefined && maxAppearance - numMatches >= 0)) {
                event.emit('line', line)
                if (maxAppearance !== undefined) {
                    maxAppearance -= numMatches
                }
            }
        }
    }

    stream.on("data", (chunk: Buffer) => {
        const lines = chunk.toString("utf-8").split('\n');
        lines[lines.length - 1] += prev;
        const front = lines.shift();
        if (front) {
            prev = front;
        }

        while (lines.length) {
            const line = lines.pop();
            if (typeof line === 'string' && line !== '') {
                processLine(line)
            }
        }
    });
  
    stream.on("end", () => {
        if (prev !== '') {
            processLine(prev)
        }
        console.log("Stream read complete");
        event.emit('end')
    });

    stream.on("error", (err) => {
        event.emit('error');
        console.log('error: ', err)
    });

    return event;
}
