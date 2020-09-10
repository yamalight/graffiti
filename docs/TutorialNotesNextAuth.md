# Build a simple note-taking app with Graffiti, Next and basic auth

## Prerequisites

- Node.js v14
- MongoDB:
  - install it locally
  - start via docker (e.g. `docker run --name mongodb -p 27017:27017 -d mongo`)
- Basic note-taking app from [first tutorial](./TutorialNotesNext.md)

## Step 1: Add basic auth plugin

First, install the auth plugin using npm:

```sh
npm install graffiti-plugin-auth
```

Then, update graffiti config `graffiti.config.js` and add the following:

```js
const nextPlugin = require('graffiti-plugin-next');
const authPlugin = require('graffiti-plugin-auth');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti',
  plugins: [nextPlugin(), authPlugin({ secret: 'my_super_secret_jwt_secret' })],
};
```

You can test that it works by running `npm run develop` and opening any page - you should get error 401 since you are not logged in.

## Step 2: Add login and register pages

First, we will extend out Graffiti config to include some additional settings for auth plugin:

```js
const nextPlugin = require('graffiti-plugin-next');
const authPlugin = require('graffiti-plugin-auth');

module.exports = {
  mongoUrl: 'mongodb://localhost/graffiti',
  plugins: [
    nextPlugin(),
    authPlugin({
      secret: 'my_super_secret_jwt_secret',
      // this tells auth plugin to allow access to /login and /register even without auth
      permitPaths: ['/login', '/register'],
      // this makes auth plugin redirect anyone without auth to /login
      redirect: '/login',
    }),
  ],
};
```

Next, we'll add basic login page under `pages/login.js`, e.g.:

```js
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

export default () => {
  const emailRef = useRef();
  const passRef = useRef();
  const [error, setError] = useState();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailVal = emailRef.current.value;
    const passVal = passRef.current.value;
    const data = { email: emailVal, password: passVal };
    // get response
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    // if it's not OK or status is not 200
    // display error with body
    if (!res.ok || res.status !== 200) {
      const body = await res.text();
      setError(`Error logging in! ${body}`);
      return;
    }
    // otherwise - get json
    const result = await res.json();
    // if it contains error
    // display it
    if (result.error) {
      setError(`Error logging in! ${result.error}`);
      return;
    }
    // otherwise - redirect to home page
    router.push('/');
  };

  return (
    <div>
      <form id="loginForm">
        <div>
          <label htmlFor="email">Email: </label>
          <input type="text" name="email" id="email" required ref={emailRef} />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            id="password"
            required
            ref={passRef}
          />
        </div>
        <div>
          <input type="submit" value="Login" onClick={handleSubmit} />
        </div>
        <div>
          <a href="/register">Register</a>
        </div>
      </form>
      <div id="error" style={{ color: 'red', fontWeight: 'bold' }}>
        {error}
      </div>
    </div>
  );
};
```

Finally, we'll add register page under `pages/register.js`, e.g.:

```js
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

export default () => {
  const emailRef = useRef();
  const passRef = useRef();
  const [error, setError] = useState();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailVal = emailRef.current.value;
    const passVal = passRef.current.value;
    const data = { email: emailVal, password: passVal };
    // get response
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    // if it's not OK or status is not 200
    // display error with body
    if (!res.ok || res.status !== 200) {
      const body = await res.text();
      setError(`Error registering in! ${body}`);
      return;
    }
    // otherwise - get json
    const result = await res.json();
    // if it contains error
    // display it
    if (result.error) {
      setError(`Error registering in! ${result.error}`);
      return;
    }
    // otherwise - redirect to home page
    router.push('/');
  };

  return (
    <div>
      <form id="loginForm">
        <div>
          <label htmlFor="email">Email: </label>
          <input type="text" name="email" id="email" required ref={emailRef} />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            id="password"
            required
            ref={passRef}
          />
        </div>
        <div>
          <input type="submit" value="Register" onClick={handleSubmit} />
        </div>
        <div>
          <a href="/login">Login</a>
        </div>
      </form>
      <div id="error" style={{ color: 'red', fontWeight: 'bold' }}>
        {error}
      </div>
    </div>
  );
};
```

Now once you fire up the app and navigate to [http://localhost:3000](http://localhost:3000), you should be redirected to login page.
You should also be able to register and login with your new account using new pages.

## Step 3: Adjust server-side query execute to use new auth token

If you try to load index page now - it will fail.
This happens because we are fetching list of notes on the server - and server doesn't correctly pass user auth to GraphQL API.
The fix is pretty straightforward - simply pass cookie header to the client, i.e.:

```js
// pages/index.js

// ... other code

export async function getServerSideProps(context) {
  client.setHeader('cookie', context.req.headers.cookie); // <-- pass cookie from user to client
  const data = await client.request(notesQuery);
  return {
    props: { notes: data?.noteMany ?? [] }, // will be passed to the page component as props
  };
}
```

That fixes the request and allows using the app in the same manner it was done initially.

## Step 4: (Auto-)adding current user to notes

Finally, we want to assign notes to user who've created them.
For this, first we'll need to modify our schema a bit:

```js
// schema/note.js
exports.schema = {
  name: String,
  body: String,
  // adding like below to link note to user
  // User collection is created by auth plugin
  user: { type: 'ObjectId', ref: 'User' },
};
```

Next, we are going to disable all default GraphQL methods for notes since we want to auto-add current user to them:

```js
// schema/node.js

// ...
// ... existing code here
// ...

// config for default queries
exports.config = {
  // define defaults
  defaults: {
    // disable default mutations
    mutations: false,
  },
};
```

After that, we'll create our custom resolvers that will use GraphQL context to add current user to notes:

```js
// schema/node.js

// ...
// ... existing code here
// ...

// define new resolvers function that will create
// our custom resolver
exports.resolvers = ({ typedef, model: Model }) => {
  // our new noteCreate resolver that creates new note
  // and adds current user from context to is as creator
  typedef.addResolver({
    name: 'noteCreate',
    type: typedef,
    args: { name: 'String!', body: 'String!' },
    resolve: async ({ source, args: { name, body }, context, info }) => {
      const note = new Model({ name, body, user: context.user._id });
      await note.save();
      return note;
    },
  });
};
```

Finally, we need to add our new resolvers to our schema:

```js
// schema/node.js

// ...
// ... existing code here
// ...

// define new compose function that will register our custom resolver
// in graphql schema so we can actually use it
exports.compose = ({ schemaComposer, typedef }) => {
  schemaComposer.Mutation.addFields({
    noteCreate: typedef.getResolver('noteCreate'),
  });
};
```

## Step 5: Adjust front-end to use new queries

To finish with this - we'll need to change our frontend queries and rendering a bit.
First, we'll need to modify our mutation and listing queries:

```js
// we now also get user
const notesQuery = gql`
  {
    noteMany {
      _id
      name
      body
      user {
        _id
        email
      }
    }
  }
`;

// no longer uses `record: {name, body}` and no longer reads data from `record`
// also now gets note's user
const createNoteQuery = gql`
  mutation AddNote($name: String!, $body: String!) {
    noteCreate(name: $name, body: $body) {
      _id
      name
      body
      user {
        _id
        email
      }
    }
  }
`;

const createNote = async ({ name, body }) => {
  const variables = {
    name,
    body,
  };
  const data = await client.request(createNoteQuery, variables);
  // now use plain data as note, instead of using `.record`
  return data?.noteCreate;
};
```

Finally, we need to render note's user in UI, this can be easily achieved by changing note rendering loop:

```js
export default ({ notes }) => {
  // ...
  // ... other code
  // ...
  return (
    <div>
      {/* ...
          ... other code
          ... */}
      {allNotes.map((note) => (
        <div key={note._id} style={{ marginBottom: 10 }}>
          <p>
            <strong>{note.name}</strong> by {note.user?.email ?? 'no user'}{' '}
            {/* we're now rendering user email here (when available) */}
          </p>
          <p>{note.body}</p>
        </div>
      ))}
    </div>
  );
};
```

And that does it - you now have an app with auth that allows you to create notes tied to specific user,
and read notes from all users.
