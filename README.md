# ACP Web Server

A Typescript + Express web server with 4 routes
- GET /hello
- GET /health
- GET /metadata
- POST /calculate

### Build & run locally
Prerequisites:
- `npm`
- `tsc`

```sh
# To install typescript / tsc
npm install -g typescript
```

To run locally, input `npm run dev`. This compiles the typescript files and runs the compiled JS output.

### Tests
Tests are run on the compiled JS output. To start the tests, input `npm run test`.

This app uses [pm2](https://www.npmjs.com/package/pm2) to start the webserver in a background process, runs the tests using [jest](https://www.npmjs.com/package/jest), before stopping the process.

If the app is already running locally, you can skip the pm2 step by running `npx jest`.

### Building Docker Image
Use the following script to build the docker image & run it locally (optional).
```sh
docker build . -t acp:1.0 --build-arg COMMIT_HASH=$(git rev-parse HEAD)
docker run -p 3000:3000 acp:1.0    
```