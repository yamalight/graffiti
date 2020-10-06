# Auth plugin example

This example shows the most basic idea behind auth plugin Graffiti.
Schema definition file `schema/note.js` is used to create basic GraphQL endpoint with Notes schema protected by simple user-password auth.

## How to use

Download the example:

```bash
curl https://codeload.github.com/yamalight/graffiti/tar.gz/master | tar -xz --strip=2 graffiti-master/examples/plugin-auth
cd plugin-auth
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
