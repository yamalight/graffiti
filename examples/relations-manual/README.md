# Manual relations example

This example shows how to define relations for your GraphQL using Graffiti.
Similarly to basic relations example - schema definition file `schema/collection.js` defines notes collection;
and schema definition file `schema/note.js` create notes themselves.
Finally, `exports.relations` in `schema/collection.js` is used to define custom relations between collection and notes.

## How to use

Download the example:

```bash
curl https://codeload.github.com/yamalight/graffiti/tar.gz/master | tar -xz --strip=2 graffiti-master/examples/relations-manual
cd relations-manual
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
