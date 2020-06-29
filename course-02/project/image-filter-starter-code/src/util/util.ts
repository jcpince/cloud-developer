import fs from 'fs';
import Jimp = require('jimp');
import { resolve } from 'bluebird';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const urlExist = require("url-exist");
export const jwtSecret = process.env.JWT_SECRET;

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async resolve => {
        try {
            const photo = await Jimp.read(inputURL);
            const outpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
            await photo
            .resize(256, 256) // resize
            .quality(60) // set JPEG quality
            .greyscale() // set greyscale
            .write(__dirname+outpath, (img)=>{
                resolve(__dirname+outpath);
            });
        }
        catch (error) {
            console.error(`error during filterImageFromURL: ${error}`);
            resolve(null);
        }
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        if(fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    }
}

export async function isURLValid(image_url: String) : Promise<boolean> {

    var res = await urlExist(image_url);
    if ( ! res ) {
        console.error(`urlExist(${image_url}) failed`);
        return false;
    }

    return res;
}

export function generateJWT(user: String): string {
    // Use jwt to create a new JWT Payload containing
    console.info(`Signing token ${ user } with ${ jwtSecret }.`)
    return jwt.sign(user, jwtSecret);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {

    if (!req.headers || !req.headers.authorization){
        console.error('No authorization headers.')
        return res.status(401).send({ message: 'No authorization headers.' });
    }
    return next();

    // Token is in the form Bearer jkbahjksgbdjagdfgakjhgs
    const token_bearer = req.headers.authorization.split(' ');
    if(token_bearer.length != 2){
        console.error(`Malformed token ${ req.headers.authorization } -- len ${ token_bearer.length }.`)
        var i;
        for (i = 0; i < token_bearer.length; i++) {
            console.error(`token_bearer[${i}]: ${ token_bearer[i] }`)
        }
        return res.status(401).send({ message: 'Malformed token.' });
    } else {
        console.info(`Well formed token ${ req.headers.authorization }.`)
        var i;
        for (i = 0; i < token_bearer.length; i++) {
            console.info(`token_bearer[${i}]: ${ token_bearer[i] }`)
        }
    }
    
    const token = token_bearer[1];

    return jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        console.error(`Wrong token ${ token } .`)
        return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
      }
      return next();
    });
}