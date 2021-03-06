import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    if (items.count == 0) {
        return res.status(400).send(`No feed found!!`);
    }
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

// GET a specific resource by Primary Key
router.get('/:id', async (req: Request, res: Response) => {
    let { id } = req.params;

    const item = await FeedItem.findByPk(id);
    if ( ! item || ! item.url ) {
        return res.status(400).send(`id ${id} is not found`);
    }
    res.status(200).send(item);
});

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        let { id } = req.params;
        const caption = req.body.caption;
        const fileName = req.body.url;

        if ( ! caption || ! fileName ) {
            return res.status(400).send(`Body incomplete, caption and/or url missing`);
        }

        const item = await FeedItem.findByPk(id);
        if ( ! item || ! item.url ) {
            return res.status(400).send(`id ${id} is not found`);
        }

        item.caption = caption;
        item.url = fileName;
        item.url = AWS.getGetSignedUrl(item.url);

        await item.save();
        res.status(201).send(item);
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(200).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    try {
        const saved_item = await item.save();
        saved_item.url = AWS.getGetSignedUrl(saved_item.url);
        res.status(201).send(saved_item);
    } catch (error) {
        console.error(error)
        res.status(400).send( { message: 'Unknown error' });
    }
});

export const FeedRouter: Router = router;
