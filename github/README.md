## How to start?

1. Add/Remove Routes inside `routes.json`
2. Create `.env` and add `WEBHOOK_SECRET_{ ROUTE_HANDLER }` for each route with custom secret key (e.g. you can use crypt in Nodejs like this `require('crypto').randomBytes(48).toString('hex')`)
3. You are good to go! Start the express server and wait for webhook requests!