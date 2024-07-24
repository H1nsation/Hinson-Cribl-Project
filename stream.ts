import { Readable } from "stream";
import fs from 'fs'

export class ReverseReadStream extends Readable {
    filename: string;
    fd: number | null;
    position: number;
    remaining: number;
    constructor(filename: string) {
        super();
        this.filename = filename;
        this.fd = null;
        this.position = 0;
        this.remaining = 0;
      }

    _construct(callback: any) {
        fs.open(this.filename, (err, fd) => {
            if (err) {
                callback(err);
            } else {
                this.fd = fd;
                const fstat = fs.fstatSync(this.fd);
                this.remaining = fstat.size
                this.position = Math.max(fstat.size - this.readableHighWaterMark, this.position)
                callback();
            }
        });
    }

    _read(n: number) {
        const allocSize =  (this.remaining < n) ? this.remaining : n
        const buf = Buffer.alloc(allocSize);
        if (!this.fd) {
            this.destroy()
            return
        }
        fs.read(this.fd, buf, 0, allocSize, this.position, (err, bytesRead) => {
            if (err) {
                this.destroy(err);
            } else {
                this.position = Math.max(this.position - bytesRead, 0)
                this.remaining = this.remaining - bytesRead
                this.push(bytesRead > 0 ? buf.slice(0, bytesRead) : null);
            }
        });
    }

    _destroy(err: any, callback: (arg0: any) => void) {
        if (this.fd) {
            fs.close(this.fd, (er) => callback(er || err));
        } else {
            callback(err);
        }
    }
}
