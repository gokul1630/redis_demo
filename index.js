const express = require("express")
const axios = require("axios")
const redis = require("redis")

const app = express()

const client = redis.createClient({
    url: "",
})

app.use(express.json())

client.on("error", (err) => console.log("Redis Client Error", err))

app.get("/todos/:query?", async (req, res) => {
    try {
        const { query } = req.params

        if (!query) {
            client.get("todoss", async (err, data) => {
                if (err) throw err

                if (data) {
                    return res.json(JSON.parse(data))
                } else {
                    const response = await axios("https://jsonplaceholder.typicode.com/todos")
                    client.setex("todoss", 300, JSON.stringify(response.data))
                    if (response) res.json(response.data)
                }
            })
        } else {

            client.get(query, async (err, data) => {
                if (err) throw err

                if (data) {
                    return res.json(JSON.parse(data))
                } else {
                    const response = await axios(`https://jsonplaceholder.typicode.com/todos/${query}`)
                    client.setex(query, 300, JSON.stringify(response.data))
                    if (response) res.json(response.data)
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
})

app.listen(3000, async () => {
    console.log("server listrening on port 3000")
})
