# Relations example

This example shows how to define relations for your GraphQL using Graffiti.
Schema definition file `schema/collection.js` is used to define basic notes collection that just has name.
While schema definition file `schema/note.js` is used to create Notes schema (just as it is in basic example), while linking it to new collections schema.

## How to use

Download the example:

```bash
curl https://codeload.github.com/yamalight/graffiti/tar.gz/master | tar -xz --strip=2 graffiti-master/examples/relations
cd relations
```

Install it and run:

```bash
npm install
npm start

# or

yarn
yarn start
```

Navigate to `http://localhost:3000/graphql` to see GraphQL endpoint.
