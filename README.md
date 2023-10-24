## Why this?
I want to have an autodeployer <b>BUT</b> I don't want to use such services like docker.<br>
I'm lazy and I don't want to configure docker-compose or even a Kubernetes to handle all `caamillo.it` services
## So what is this?
Just a webhook handler to manage 1 or more services (for now it's only github). I can setup more routes binded based on their `deploy.sh` location and every time launch a tmux session