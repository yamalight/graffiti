# Custom resolvers example

This example shows how to use custom resolvers with Graffiti.
Schema definition file `schema/note.js` is used to create basic GraphQL endpoint with Notes schema.
Exported `exports.resolvers` function in that file creates additional custom resolvers, while exported `exports.compose` function registers new custom resolver in our GraphQL schema.

## How to use

Download the example:

```bash
curl https://codeload.github.com/yamalight/graffiti/tar.gz/master | tar -xz --strip=2 graffiti-master/examples/custom-resolvers
cd custom-resolvers
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
