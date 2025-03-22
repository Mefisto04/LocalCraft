// types/multer.d.ts
declare namespace Express {
    export interface Multer {
        File: {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            size: number;
            stream: NodeJS.ReadableStream;
            destination: string;
            filename: string;
            path: string;
            buffer: Buffer;
        };
    }
}