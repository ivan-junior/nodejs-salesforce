const express = require('express')
require('dotenv').config()
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hello, World'
    })
})

app.get('/lead', async (req, res) => {
    const jsforce = require('jsforce')
    const conn = new jsforce.Connection({
        loginUrl: "https://bluesol--devdw.sandbox.my.salesforce.com"
    })
    await conn.login(process.env.SALESFORCE_LOGIN, process.env.SALESFORCE_PASS, (err, userInfo) => {
        if (err) {
            return res.status(400).json({
                error: 'Something is wrong when trying to connect with Salesforce, try again later'
            })
        }
        console.log(`User with id ${userInfo.id} is connected`)
    })
    await conn.query(`SELECT Id, Name FROM Lead ORDER BY Name LIMIT 10 OFFSET 0`, (err, result) => {
        if(err) {
            return res.status(400).json({
                error: `Something is wrong when trying to fetch data from Salesforce, try again later`
            })
        }
        return res.status(200).send(result)
    })
})

app.post('/lead', async (req, res) => {

    /**
     * Here we're going to create a lead that came from req.body
     * The data should look like this:
     * {
     *   "FirstName": "John",
     *   "LastName": "Doe",
     *   "Email": "john.doe@johndoe.com",
     *   "Phone": "5516999999999",
     *   "Company": "John Company",
     *   "Industry": "Others",
     *   "LeadSource": "Website",
     * }
     */
    
    const jsforce = require('jsforce')
    const conn = new jsforce.Connection({
        loginUrl: process.env.SALESFORCE_URL
    })
    await conn.login(process.env.SALESFORCE_LOGIN, process.env.SALESFORCE_PASS, (err, userInfo) => {
        if (err) {
            return res.status(400).json({
                error: 'Something is wrong when trying to connect with Salesforce, try again later'
            })
        }
        console.log(`User with id ${userInfo.id} is connected`)
    })
    await conn.sobject('Lead').create(req.body, (err, ret) => {
        if (err || !ret.success) {
            return res.status(400).json({
                error: 'Something is wrong when trying to create a Lead on Salesforce, try again later'
            })
        }
        return res.status(201).json({
            leadCreatedId: ret.id
        })
    })

})

app.listen(3000, () => {
    console.log('Server is running')
})