import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, isURLValid, requireAuth} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  // > try it {{host}}/filteredimage?image_url={{URL}}
  app.get( "/filteredimage/",
    requireAuth,
    async ( req, res) => {
    let { image_url } = req.query;

    if ( !image_url ) {
      return res.status(400)
                .send(`image_url is required`);
    }

    var valid_url = await isURLValid(image_url);
    if ( ! valid_url ) {
        const error_msg : String = `${ image_url } is not a valid url`;
        console.error(error_msg);
        return res.status(404).send(error_msg);
    }

    try {
      var outpath = await filterImageFromURL(image_url);
      if (!outpath) {
        console.error(`filterImageFromURL failed`);
        return res.status(500).send("Internal filtering error");
      }
      res.sendFile(outpath, function(err) {
        console.log(`Deleting local file ${outpath}`);
        deleteLocalFiles( [ outpath ] );
        if (err) {
          console.error(`${ err.name } while sending ${ outpath }: ${ err.message }`);
          res.end();
          res.status(500).send("Internal sending error");
        } else {
          res.status(200);
        }
      });
    }
    catch (error) {
      console.error(error);
      // A fs error could occur here
      return res.status(500).send("Internal error");
    }
  } )
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
 
  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();