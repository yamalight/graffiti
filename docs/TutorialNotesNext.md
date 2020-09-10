# Build a simple note-taking app with Graffiti and Next

## Prerequisites

- Node.js v14
- MongoDB:
  - install it locally
  - start via docker (e.g. `docker run --name mongodb -p 27017:27017 -d mongo`)

## Step 1: Create new project

```sh
mkdir graffiti-notes && cd graffiti-notes
npm init -y
```

## Step 2: Install Graffiti

```sh
npm install graffiti
```

## Step 3: Add Graffiti start and dev scripts to package.json

```json
{
  // rest of your package.json
  "scripts": {
    "start": "NODE_ENV=production graffiti",
    "develop": "graffiti dev"
  }
  // rest of your package.json
}
```

## Step 4: Define notes schema

First, create new schema folder:

```sh
mkdir schema
```

Then, create new `note.js` file in it and describe our notes schema:

```js
// schema/note.js
exports.schema = {
  name: String,
  body: String,
};
```

## Step 5: Test in playground

Make sure your MongoDB is running.
Once it is - execute `npm run develop` to start your Graffiti app in dev mode
and navigate to [http://localhost:3000/playground](http://localhost:3000/playground).

Playground should now allow you to execute variety of queries and mutations for notes.

## Step 6: Add Next.js plugin

First, install the plugin using npm:

```sh
npm install graffiti-plugin-next
```

Then, create new file `graffiti.config.js` and add the following:

```js
const nextPlugin = require('graffiti-plugin-next');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti',
  plugins: [nextPlugin()],
};
```

## Step 7: Add new page

First, create `pages/` folder for Next.js to use:

```sh
mkdir pages
```

Then, create new `index.js` file and create your page using React (as you normally would using Next.js):

```js
export default () => <h1>Hello Graffiti + Next.js!</h1>;
```

## Step 8: Test in browser

Execute `npm run develop` to start your Graffiti app in dev mode
and navigate to [http://localhost:3000/](http://localhost:3000/).

You should see your newly created React page.

## Step 9: Add notes creation and browsing

First, let's add simplest GraphQL client for us to use - we'll use [graphql-request](https://github.com/prisma-labs/graphql-request):

```sh
npm install graphql-request graphql
```

Edit your `pages/index.js` and create new form for notes creation and new list of current notes, e.g.:

```js
import { gql, GraphQLClient } from 'graphql-request';
import { useState } from 'react';

// create a GraphQL client instance to send requests
const client = new GraphQLClient('http://localhost:3000/graphql', {
  headers: {},
});

// define notes query
const notesQuery = gql`
  {
    noteMany {
      _id
      name
      body
    }
  }
`;

// define create note mutation
const createNoteQuery = gql`
  mutation AddNote($name: String!, $body: String!) {
    noteCreate(record: { name: $name, body: $body }) {
      record {
        _id
        name
        body
      }
    }
  }
`;

// define simple create note function that returns new note
const createNote = async ({ name, body }) => {
  const variables = {
    name,
    body,
  };
  const data = await client.request(createNoteQuery, variables);
  return data?.noteCreate?.record;
};

// define our page
export default ({ notes }) => {
  const [allNotes, setAllNotes] = useState(notes);
  const [name, setName] = useState();
  const [body, setBody] = useState();

  // add button handler
  const handleAdd = async () => {
    const newNote = await createNote({ name, body });
    if (newNote) {
      // add new note to render list
      setAllNotes(allNotes.concat(newNote));
    }
    // reset old values
    setName('');
    setBody('');
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div>
          <input
            type="text"
            placeholder="Note name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <textarea
            placeholder="Note body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div>
          <button onClick={handleAdd}>Add note</button>
        </div>
      </div>
      {allNotes.map((note) => (
        <div key={note._id} style={{ marginBottom: 10 }}>
          <strong>{note.name}</strong>
          <p>{note.body}</p>
        </div>
      ))}
    </div>
  );
};

// define server-side props that load initial list of notes
export async function getServerSideProps(context) {
  const data = await client.request(notesQuery);
  return {
    props: { notes: data?.noteMany ?? [] }, // will be passed to the page component as props
  };
}
```

## Step 10: Try it out!

Execute `npm run develop` to start your Graffiti app in dev mode
and navigate to [http://localhost:3000/](http://localhost:3000/).

You should see your newly created page with form that should create notes and add them to page.
