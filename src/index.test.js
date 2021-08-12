
const supertest = require('supertest')
const app = require('./index')
const request = supertest(app)


it('Testing to see if Jest works', () => {
    expect(1).toBe(1)
  })

describe("GET /api/ping", () => {
    describe("To check if destination url is up.", () => {
        it("Should respond with a 200 status code.", async () => {
            const response = await request.get("/api/ping")
            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
        })
    })

    describe("To check if json format is in use.", () => {
        it("Should specify json", async () => {
            const response = await request.get("/api/ping")
            expect(response.header['content-type']).toEqual(expect.stringContaining('json'))
        })
    })

})

describe("GET /api/posts", () => {

    describe("To check if json format is in use.", () => {
        it("Should specify json:", async () => {
            const response = await request.get("/api/posts?tag=tech")
            expect(response.header['content-type']).toEqual(expect.stringContaining('json'))
        })
    })

    describe("To call /api/posts without a tag.", () => {
        it("Should specify 'Tags parameter is required", async () => {
            const response = await request.get("/api/posts")
            expect(response.body.error).toEqual(expect.stringContaining('Tags parameter is required'))
            expect(response.statusCode).toBe(400)
        })
    })

    describe("To call /api/posts with tag = tech.", () => {
        it("Should return with posts containing tag 'tech'", async () => {
            const response = await request.get("/api/posts?tag=tech")
            expect(response.statusCode).toBe(200)
            expect(response.body.posts).toBeInstanceOf(Array)
            expect((response.body.posts[0].tags).includes('tech')).toBeTruthy()
            expect((response.body.posts[1].tags).includes('tech')).toBeTruthy()
            expect((response.body.posts[2].tags).includes('tech')).toBeTruthy()
        })
    })

    describe("To call /api/posts with tag = health.", () => {
        it("Should return with posts containing tag 'health'", async () => {
            const response = await request.get("/api/posts?tag=health")
            expect(response.statusCode).toBe(200)
            expect(response.body.posts).toBeInstanceOf(Array)
            expect((response.body.posts[0].tags).includes('health')).toBeTruthy()
            expect((response.body.posts[1].tags).includes('health')).toBeTruthy()
            expect((response.body.posts[2].tags).includes('health')).toBeTruthy()
        })
    })

    describe("To call /api/posts with tags = tech,health.", () => {
        it("Should return with posts containing tag 'health' and/or 'tech'", async () => {
            const response = await request.get("/api/posts?tags=tech,health")
            expect(response.statusCode).toBe(200)
            expect(response.body.posts).toBeInstanceOf(Array)
            expect((response.body.posts[0].tags).includes('tech') || (response.body.posts[0].tags).includes('health')).toBeTruthy()
            expect((response.body.posts[1].tags).includes('tech') || (response.body.posts[1].tags).includes('health')).toBeTruthy()
            expect((response.body.posts[2].tags).includes('tech') || (response.body.posts[2].tags).includes('health')).toBeTruthy()
        })
    })

    describe("To call /api/posts with tag = tech,health.", () => {
        it("Should return with an empty array, there is no tag called 'tech,health'", async () => {
            const response = await request.get("/api/posts?tag=tech,health")
            expect(response.body.posts).toStrictEqual([])
        })
    })

    describe("To call /api/posts with incorrect sortBy ie. sortBy = wordcount.", () => {
        it("Should return with sortBy parameter is invalid'", async () => {
            const response = await request.get("/api/posts?tags=tech&sortBy=wordcount")
            expect(response.body.error).toEqual(expect.stringContaining('sortBy parameter is invalid'))
            expect(response.statusCode).toBe(400)
        })
    })

    describe("To call /api/posts with incorrect direction ie. direction = backwards.", () => {
        it("Should return with direction parameter is invalid'", async () => {
            const response = await request.get("/api/posts?tags=tech&direction=backwards")
            expect(response.body.error).toEqual(expect.stringContaining('direction parameter is invalid'))
            expect(response.statusCode).toBe(400)
        })
    })

    describe("To call /api/posts with valid direction = desc", () => {
        it("Should return results in descending order by id", async () => {
            const response = await request.get("/api/posts?tags=tech&direction=desc")
            expect(response.statusCode).toBe(200)
            expect(response.body.posts[0].id).toBeGreaterThanOrEqual(response.body.posts[1].id)
            expect(response.body.posts[1].id).toBeGreaterThanOrEqual(response.body.posts[2].id)
        })
    })

    describe("To call /api/posts with valid direction = asc", () => {
        it("Should return results in ascending order by id", async () => {
            const response = await request.get("/api/posts?tags=tech&direction=asc")
            expect(response.statusCode).toBe(200)
            expect(response.body.posts[0].id).toBeLessThanOrEqual(response.body.posts[1].id)
            expect(response.body.posts[1].id).toBeLessThanOrEqual(response.body.posts[2].id)
        })
    })

    describe("To call /api/posts with tags = startups,health and sortBy = popularity.", () => {
        it("Should return with posts containing tag 'health' and/or 'startups' sorted by popularity", async () => {
            const response = await request.get("/api/posts?tags=startups,health&sortBy=popularity")
            expect(response.body.posts).toBeInstanceOf(Array)
            expect(response.statusCode).toBe(200)
            expect((response.body.posts[0].tags).includes('startups') || (response.body.posts[0].tags).includes('health')).toBeTruthy()
            expect((response.body.posts[1].tags).includes('startups') || (response.body.posts[1].tags).includes('health')).toBeTruthy()
            expect((response.body.posts[2].tags).includes('startups') || (response.body.posts[2].tags).includes('health')).toBeTruthy()
            expect(response.body.posts[0].popularity).toBeLessThanOrEqual(response.body.posts[1].popularity)
            expect(response.body.posts[1].popularity).toBeLessThanOrEqual(response.body.posts[2].popularity)
        })
    })

    describe("To call /api/posts with tags = tech,health and sorted by likes descended", () => {
        it("Should return with posts containing tag 'health' and/or 'tech', sortBy = likes, direction = desc", async () => {
            const response = await request.get("/api/posts?tags=tech,health&sortBy=likes&direction=desc")
            expect(response.body.posts).toBeInstanceOf(Array)
            expect(response.statusCode).toBe(200)
            expect((response.body.posts[0].tags).includes('tech') || (response.body.posts[0].tags).includes('health')).toBeTruthy()
            expect((response.body.posts[1].tags).includes('tech') || (response.body.posts[1].tags).includes('health')).toBeTruthy()
            expect((response.body.posts[2].tags).includes('tech') || (response.body.posts[2].tags).includes('health')).toBeTruthy()
            expect(response.body.posts[0].likes).toBeGreaterThanOrEqual(response.body.posts[1].likes)
            expect(response.body.posts[1].likes).toBeGreaterThanOrEqual(response.body.posts[2].likes)
            expect(response.body.posts[2].likes).toBeGreaterThanOrEqual(response.body.posts[3].likes)
        })
    })

    

})

