# Next.js plugin example

This example shows the most basic idea behind Graffiti with Next.js plugin.
Schema definition file `schema/note.js` is used to create basic GraphQL endpoint with Notes schema and simple Next.js front-end.

## How to use

Download the example:

```bash
curl https://codeload.github.com/yamalight/graffiti/tar.gz/master | tar -xz --strip=2 graffiti-master/examples/plugin-next
cd plugin-next
```

Install it and run:

```bash
npm install
npm run build
npm start

# or

yarn
yarn build
yarn start
```

Navigate to `http://localhost:3000/graphql` to see GraphQL endpoint.
