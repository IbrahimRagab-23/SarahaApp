import { fileTypeFromBuffer } from "file-type";
import multer from "multer"
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { BadException } from './../../exceptions/index.js';
import { object } from "zod";
export const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    files: ['application/pdf', 'application/json']
}
export const localFileUpload = ({ maxFileSize = 5, validation = [] } = {}) => {
    const storage = multer.memoryStorage({
        destination: function (req, file, cb) {
            cb(null, './assets')
        },
        filename: function (req, file, cb) {
            cb(null, randomUUID() + file.originalname)
        }
    })

    return multer({ storage, limits:{fileSize: maxFileSize * 1024 * 1024} })
}
export const processFile = async ({ customPath = "general", file, validation = [] } = {}) => {
    const result = await fileTypeFromBuffer(file.buffer);
    if (!result || !validation.includes(result.mime)) {
        throw BadException("Invalid File")
    } else {
        await mkdir(resolve(`./assets/${customPath}`), { recursive: true })
        const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`
        await writeFile(resolve(`./${uniqueFilePath}`), file.buffer)
        file.path = uniqueFilePath
        console.log(
        {processFile:file.path = uniqueFilePath}
        );
        
        return file
    }
};
export const processFiles = async ({ customPath, files = [], validation = [] } = {}) => {
    const assets = []
    try {
        for (const file of files) {
            const uploadFile = await processFile({ customPath, file, validation });
            assets.push(uploadFile);
        }

        return assets;
    } catch (err) {
        await Promise.allSettled(
            assets.map((asset) => unlink(resolve(`./${asset.finalPath}`)))
        );
        throw BadException("Invalid File")

    }

};
export const processFields = async ({ customPath, fields = {}, validation = [] } = {}) => {
    const assets = []

    try {
        for (const field of Object.keys(fields)) {
            const files = await processFiles({ customPath, files: fields[field], validation })
            assets.push({ field, files })
        }
        return assets
    } catch (err) {
        await Promise.allSettled(
            assets.flatMap(({ files }) => files).map((file) => unlink(resolve(`./${file.finalPath}`)))
        )
        throw BadException("Invalid File")
    }
};

export const processMulterUpload = async ({ req, customPath = "general", validation = [] } = {}) => {

    if (req.file) {
        await processFile({ customPath, file: req.file, validation })
    } else if (Array.isArray(req.files)) {
        await processFiles({ customPath, files: req.files, validation })
    } else if (typeof req.files == "object" && Object.keys(req.files)?.length) {

        await processFields({ customPath, fields: req.files, validation })
    }

};
export const uploadMiddleware = ({ isRequired = true, multerMiddleware, customPath = "general", validation = [] } = {}) => {
    return (req, res, next) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                return next(new Error(error.message, { cause: { status: 400 } }));
            }

            try {
                if (isRequired &&
                  ( !req.file &&
                    !(Array.isArray(req.files) && req.files.length)) &&
                    !(typeof req.files == "object" && Object.keys(req.files)?.length)) {
                    next(BadException("File is Required"))
                    return
                }
                await processMulterUpload({ req, customPath, validation });
                next();
            } catch (err) {
                next(err);
            }
        });
    };
};