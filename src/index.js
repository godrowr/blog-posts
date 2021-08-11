const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const port = process.env.PORT || 3000;
const axios = require('axios');
const { response } = require('express');

app.set('port', port);
app.use(express.json());

/**
 * Root endpoint
 */
app.get('/', function(req, res) {
    res.send("RESTFful API for Brokerbay");
});

/**
 * Endpoint for /ping
 */
app.get('/api/ping', (req, res) => {
    url = "https://api.hatchways.io/assessment/blog/posts?tag=tech"
    request(url, (err,resp,body) => {
        if (resp.statusCode == 200) {
            res.send({ success: true});
        } else {
            res.send({ success: false});
        }
    })
});

/**
 * Endpoint for /posts
 */
app.get('/api/posts', (req, res) => {
    var tag = req.query.tag;
    var tags = req.query.tags;
    var sortBy = req.query.sortBy;
    var direction = req.query.direction;
    url_array = [];
    tag_array = []

    url = "https://api.hatchways.io/assessment/blog/posts";

    if (tag == null && tags == null) { return res.send({error: "Tags parameter is required"});} 
    else if (tags != null) { //or if tag array has a comma in it. 
        tag_array = tags.split(',');
    } else {
        tag_array[0] = tag
    }

    if (sortBy != null && !(sortBy == "id" || sortBy == "reads" || sortBy == "likes" || sortBy == "popularity")) 
    { return res.send({ error: "sortBy parameter is invalid"});}
    else if (sortBy == null) { sortBy = "id";}
    
    if (direction != null && !(direction == "desc" || direction == "asc"))
    { return res.send({ error: "direction parameter is invalid"});}
    else if (direction == null) { direction = "asc"; }

    for (let i =0; i < tag_array.length; i++){
        url_array[i] = axios.get(url + "?tag=" + tag_array[i] + "&sortBy=" + sortBy + "&direction=" + direction)
    }

    (async () => {
        try {
            const [...responses] = await axios.all(url_array);
            let json = []
            console.log("Returned JSON results.")
            for (let i = 0; i < responses.length; i++){
                json = json.concat(responses[i].data.posts)
            }

            const filteredJson = json.filter((obj, index, arr) => {
                return arr.map(mobj => mobj.id).indexOf(obj.id) === index;
            });

            filteredJson.sort((a, b) => {
                if (direction == "asc") {
                    if (a.likes < b.likes)
                        return -1;
                    if (a.likes > b.likes)
                        return 1;
                    return 0;
                } else {
                    if (a.likes > b.likes)
                        return -1;
                    if (a.likes < b.likes)
                        return 1;
                    return 0;
                }
              });

            res.send(filteredJson)

        } catch (err) {
            console.log(err.resp)
        }
    })();
});

/**
 * Starts listening on port 3000 and informs user.
 */
app.listen(port, () => console.log(`Listening on port ${port} ..`))