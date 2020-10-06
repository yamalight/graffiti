# Default queries control example

This example shows how to control default queries and mutations created by Graffiti.
Schema definition file `schema/note.js` is used to create basic GraphQL endpoint with Notes schema.
Exported `exports.config` variable in that file defines what default queries and mutations should be disabled.

## How to use

Download the example:

```bash
curl https://codeload.github.com/yamalight/graffiti/tar.gz/master | tar -xz --strip=2 graffiti-master/examples/default-queries
cd default-queries
```

Install it and run:

```bash
npm install
# if you don't have mongo - there's an npm script to start one using docker
npm run mongo
npm start

# or

yarn
yarn mongo
yarn start
```

Navigate to `http://localhost:3000/graphql` to see GraphQL endpoint.
