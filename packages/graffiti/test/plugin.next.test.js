/* eslint-env jest */
const path = require('path');
const { build } = require('../lib');
const { executeGraphql } = require('./helpers/graphql');
const { CREATE_NOTE_QUERY } = require('./fixtures/queries.basic');

// mock current workdir
const testPath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'examples',
  'plugin-next'
);
jest.spyOn(process, 'cwd').mockImplementation(() => testPath);

// mock config to use in-mem mongo server
jest.mock('../lib/config');

// increase timeout to 10s (for nextjs builds)
jest.setTimeout(10000);

// global vars to store server and test utils
let server;

// test data
const testNote = { name: 'test note', body: 'test note body' };

// cleanup after we're done
afterAll(() => server?.close());

beforeAll(async () => {
  // build new server
  const fastifyServer = await build();
  server = fastifyServer;
  // wait for it to be ready
  await server.ready();
});

describe('Basic setup', () => {
  test('Should create new note', async () => {
    const {
      data: {
        noteCreate: { record },
      },
    } = await executeGraphql({
      server,
      mutation: CREATE_NOTE_QUERY,
      variables: { name: testNote.name, body: testNote.body },
    });

    expect(record.name).toBe(testNote.name);
    expect(record.body).toBe(testNote.body);
  });

  test('Should render home page with next.js', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/',
    });

    // cleanup body from build timestamps
    expect(res.body).toContain(
      '<div id="__next"><div><div>Welcome to Next.js &amp; Graffiti!</div><pre>[]</pre></div></div>'
    );
  });
});
