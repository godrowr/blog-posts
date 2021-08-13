"use strict";

const express = require('express');
const axios = require('axios');
const request = require('request');
const memoryCache = require('memory-cache')
const app = express();

const PORT = process.env.PORT || 3000;
const ERROR = 400;
const OK = 200;

app.set('port', PORT);
app.use(express.json());

/* CACHE */
let cache = (duration) => {
    return (req, res, next) => {
        let key =  '__express__' + req.originalUrl || req.url
        let cacheContent = memoryCache.get(key);
        if(cacheContent){
            res.send( cacheContent );
            return
        }else{
            res.sendResponse = res.send
            res.send = (body) => {
                memoryCache.put(key,body,duration*1000);
                res.sendResponse(body)
            }
            next()
        }
    }
}


/* ROUTES */

/**
 * Endpoint for GET '/' route
 * A simple string is displayed to indicate that the server is running.
 */
app.get('/', cache(10), function(req, res) {
    res.send("RESTFful API for a hatchway's assessment, endpoints: /api/ping /api/posts");
});

/**
 * Endpoint for GET '/api/ping' route
 * A json object is displayed to indicate if the target url is up or not.
 */
app.get('/api/ping', cache(10), (req, res) => {
    var url = "https://api.hatchways.io/assessment/blog/posts?tag=tech";
    request(url, (err,resp,body) => {
        if (resp.statusCode == OK) {
            res.send({ success: true});
        } else {
            res.send({ success: false});
        }
    })
});

/**
 * Sorts JSON array by query key in a specified direction. 
 * @param {string} sortBy - the key to sort json values by
 * @param {string} direction - the direction of the sort 
 * @returns sort function for sorting the JSON array. 
 */
function sortByQuery(sortBy="id", direction="asc"){
    return function(a, b) {
        if (direction === "asc") {
            if (a[sortBy] < b[sortBy])
                return -1;
            if (a[sortBy] > b[sortBy])
                return 1;
            return 0;
        } else {
            if (a[sortBy] > b[sortBy])
                return -1;
            if (a[sortBy] < b[sortBy])
                return 1;
            return 0;
        }
      }
}

/**
 * Endpoint for GET '/api/posts' route
 * Searches target url with specified queries, returns a JSON array.
 */
app.get('/api/posts', cache(10), (req, res) => {
    //array constant declaration
    const urlArray = [];

    //array variable declaration
    var tagArray = []; //tagArray may require reassignment and thus can't be a const. 

    //variable query declarations
    var tag = req.query.tag;
    var tags = req.query.tags;
    var sortBy = req.query.sortBy;
    var direction = req.query.direction;
    var url = "https://api.hatchways.io/assessment/blog/posts";

    //tag query validation, default values and set up.
    if (tag == null && tags == null) { 
        res.status(ERROR);
        return res.send({error: "Tags parameter is required"});
    }  else if (tags != null) { 
        tagArray = tags.split(','); 
    }  else {
        tagArray[0] = tag;
    }

    //sortBy query validation, default values and set up.
    if (sortBy != null && !(sortBy === "id" || sortBy === "reads" || sortBy === "likes" || sortBy === "popularity")) { 
        res.status(ERROR);
        return res.send({ error: "sortBy parameter is invalid"});
    } else if (sortBy == null) { 
        sortBy = "id";
    }
    
    //direction query validation, default values and set up.
    if (direction != null && !(direction === "desc" || direction === "asc")){ 
        res.status(ERROR);
        return res.send({ error: "direction parameter is invalid"});
    } else if (direction == null) { 
        direction = "asc"; 
    }

    //creates an array of axios promises to be called asynchronously by axios.all
    for (let i =0; i < tagArray.length; i++){
        urlArray[i] = axios.get(url + "?tag=" + tagArray[i] + "&sortBy=" + sortBy + "&direction=" + direction);
    }

    //asynchronous function call to destination urls and merging results. 
    (async () => {
        try {
            //aynchronous url calls using axios.all
            const [...responses] = await axios.all(urlArray);
            let json = [];

            //merging all results together
            for (let i = 0; i < responses.length; i++){
                json = json.concat(responses[i].data.posts);
            }

            //filtering results for duplicates by checking for duplicate ids.
            const filteredJson = json.filter((obj, index, arr) => {
                return arr.map(mobj => mobj.id).indexOf(obj.id) === index;
            });

            //sorting the filtered json according to sortBy and direction queries.
            filteredJson.sort(sortByQuery(sortBy, direction));

            //outputing final result
            res.send({posts: filteredJson});

        } catch (err) {
            //incase of any unhandled error. 
            console.log(err.resp);
        }
    })();
});

/**
 * Starts listening on port 3000 and informs user.
 */
app.listen(PORT, () => console.log(`Listening on port ${PORT} ..`))

module.exports = app