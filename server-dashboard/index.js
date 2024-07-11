const express = require('express')
const app = express()
require('./Db/Config.js')
const User = require("./Db/User.js")
const Admin= require("./Db/Admin.js")
const Product = require("./Db/Product.js")
const Jwt = require("jsonwebtoken")
const jwtKey = "myE-com"
const cors = require("cors")
const port = 5000

app.use(express.json())
app.use(cors())

app.post("/register", async (req, res) => {
    let user = new User(req.body)
    let result = await user.save()
    result = result.toObject()
    delete result.password
    Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {

        if (err) {
            res.send({ result: "please try after some time" })

        }

        res.send({ result, auth: token })
    })

})

app.post('/login', async (req, res) => {
    console.log(req.body)



    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password")
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {

                if (err) {
                    res.send({ result: "please try after some time" })

                }

                res.send({ user, auth: token })
            })

        } else {
            res.send({ result: "no results found" })
        }
    } else {
        res.send({ result: "no results found" })

    }
}) 




app.post("/add-product", async (req, res) => {
    let product = new Product(req.body)
    let result = await product.save()
    res.send(result)
})

app.get("/product" , async (req, res) => {
    let products = await Product.find()
    if (products.length > 0) {
        res.send(products)
    } else {
        res.send({ result: "no product found" })
    }
})

app.delete("/product/:id", async (req, res) => {

    const result = await Product.deleteOne({ _id: req.params.id })
    res.send(result)
})

// for update
app.get("/product/:id", async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id })
    let error = "no data found"
    if (result) {
        res.send(result)
    } else {
        res.send({ result: "no data found" })
    }
})

app.put("/product/:id", async (req, res) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    res.send(result)
})

// for search api
app.get("/search/:key", async (req, res) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }
        ]
    })
    res.send(result)
})

// verify token

function verifToken(req, res, next) {
    let token = req.headers['authorization'].toString()
    
    if (token) {
        // token = token.toString()


        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                console.log(valid)

                res.status(401).send({ result: "please provide valid token" })
                console.log(err.message)
            } else {
                next()

            }
            

        })

    } else {
        res.send({ result: "please add token with header" })
    }


}


app.listen(port, () => {
    console.log(`server has started on http//:localhost:${port}`)
})