// Deps
const fs = require('fs/promises')
const express = require('express')
const crypto = require('crypto')
require('dotenv').config()

const app = express()

app.set('view engine', 'ejs')

let routes
const routeSecrets = {}

const verifySignature = (req, secret) => {
    const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex')
    const trusted = Buffer.from(`sha256=${ signature }`, 'ascii')
    const untrusted = Buffer.from(req.headers.get("x-hub-signature-256"), 'ascii')
    return crypto.timingSafeEqual(trusted, untrusted)
}

;(async () => {
    try {
        routes = JSON.parse(await fs.readFile('./routes.json', { encoding: 'utf-8' }))
    } catch (err) {
        console.error('[ ERROR ]: routes.json not found')
    }

    try {        
        for (let route of routes) {
            const deploySecret = process.env[`WEBHOOK_SECRET_${ route.handler.toUpperCase() }`]
            if (!deploySecret) throw {
                message: `WEBHOOK_SECRET not found in "${ route.name }" route`
            }
            routeSecrets[route.handler] = deploySecret
            app.post(`/${ route.handler }`, express.json({ type: 'application/json' }), (req, res) => {

                // Verify signature
                console.log('secret', routeSecrets[route.handler])
                if (!verifySignature(req, routeSecrets[route.handler])) res.status(401).send('Not authorized')

                res.status(202).send('Accepted')
                console.log(`${ route.name } - Request Accepted!`)

                const ghEvent = req.headers['x-github-event']
                console.log(req.headers)
                if (ghEvent !== 'push') return
                console.log('it was a push!')
            })
        }
    } catch ({ message }) {
        console.error(`[ ERROR ]: ${ message } (while webhook secrets binding)`)
    }

    app.get('/', (req, res) => {
        res.render('index')
    })
})()

app.listen(5001, () => console.log('Github Autodeployer listening at http://localhost:5001/'))