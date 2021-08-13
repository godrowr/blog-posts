# blogposts

A RESTful API built using NodeJS, Express, Axios, request. (index.js)
Tested with Jest and Supertest. (index.test.js)

### installing blogposts

From github.

```
git clone https://github.com/godrowr/blogposts.git
```

### running blogposts

Inside your favourite terminal, do:

```
cd blogposts
node src
```

Then proceed to http://locahost:3000

### testing blogposts

```
npm run tests
```

Exit through crtl-c.

## routes

Two routes exist for blogposts:

- http://locahost:3000/api/ping
- http://locahost:3000/api/posts

Note: /api/posts must contain the query tag. ('?tag=tech')

## queries for posts

#### tag

http://locahost:3000/api/posts?tag=tech

- tag = { science, culture, tech, health, startups, history ...}

##### tags

Used for multiple tag options.
http://locahost:3000/api/posts?tags=tech,health

#### sortBy

http://locahost:3000/api/posts?tags=tech,health&sortBy=likes

- sortBy = {likes, id, reads, popularity}

#### direction

http://locahost:3000/api/posts?tag=tech&direction=asc

- direction = {asc, desc}
  Where 'asc' is ascending order and 'desc' is descending order.
