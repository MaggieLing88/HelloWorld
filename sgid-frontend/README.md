![](govtech-logo.png)

# sgID Demo Frontend

This repo contains frontend code which integrates with example backends in sgID's various SDKs.

## Running the app locally

### Prerequisites

This frontend app is hardcoded to interact with a local backend running on port 5001. If you haven't set up this local backend, follow the instructions in the sgID SDK for your language and framework of choice:

- [ExpressJS](https://github.com/opengovsg/sgid-client/tree/develop/examples/express)
- [Flask](https://github.com/opengovsg/sgid-client-python/tree/develop/examples/flask)

### Running the app

1. Clone this repo.

```
git clone https://github.com/opengovsg/sgid-demo-frontend-spa.git
```

2. Run the following:

```
cd sgid-demo-frontend-spa
npm install
npm run dev
```
