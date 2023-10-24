## How to start?

1. Add/Remove Routes inside `routes.json`
```
// Example of routes.json
[
    {
        "name": "caamillo.it", // service name
        "handler": "caamillo", // handler name (needs to be as same as .env secret-key, e.g. caamillo -> WEBHOOK_SECRET_CAAMILLO). It will be uppercase or lowercase makes no differences, it will be automatically uppercased
        "path": "/home/caamillo/htdocs/caamillo.it", // path of the root to find service's deploy.sh
        "website": "https://caamillo.it" // optional
    }
]
```
2. In these routes please specify a `path` attribute that contains a `deploy.sh`
3. In your `deploy.sh` please before doing a `git pull` remove all local changes using `git stash` (I specify that because every time you `chmod +x` this file, github wants to push this change)
4. Create `.env` inside the webhook root and add `WEBHOOK_SECRET_{ ROUTE_HANDLER }` for each route with custom secret key (e.g. you can use crypt in Nodejs like this `require('crypto').randomBytes(48).toString('hex')`)
5. You are good to go! Start the express server with `npm run start` and wait for webhook requests!