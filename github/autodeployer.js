// Deps
const fs = require('fs/promises')
const express = require('express')
const crypto = require('crypto')
const { exec } = require("child_process")
require('dotenv').config()

const app = express()

app.set('view engine', 'ejs')

let routes
const cachedRoutes = {}

const verifySignature = (req, secret) => {
    const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex')
    const trusted = Buffer.from(`sha256=${ signature }`, 'ascii')
    const untrusted = Buffer.from(req.headers['x-hub-signature-256'], 'ascii')
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
            cachedRoutes[route.handler] = {
                ...route,
                secret: deploySecret
            }
            app.post(`/${ route.handler }`, express.json({ type: 'application/json' }), (req, res) => {

                const cachedRoute = cachedRoutes[route.handler]
                if (!cachedRoute) {
                    res.send(500).send('Server Error searching for route')
                    throw {
                        message: `Route not found in "${ cachedRoute.name }" cache-route`
                    }
                }

                // Verify signature
                if (!verifySignature(req, cachedRoute.secret)) res.status(401).send('Not authorized')

                res.status(202).send('Accepted')

                const ghEvent = req.headers['x-github-event']
                if (ghEvent !== 'push') return
                console.log(`${ cachedRoute.name } - Push incoming...`)
                exec(`chmod +x ${ cachedRoute.deploy }`, (err, stdout, stderr) => {
                    if (err) throw err
                    if (stderr) throw stderr
                })
                exec(`ls -la ${ cachedRoute.deploy }`, (err, stdout, stderr) => {
                    if (err) throw err
                    if (stderr) throw stderr
                    console.log(stdout)
                })
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