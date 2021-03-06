/* eslint-env jest */
const path = require('path');
const { build } = require('../lib');
const { executeGraphql } = require('./helpers/graphql');
const { exec } = require('./helpers/exec');
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

// increase timeout to 30s (for nextjs builds)
jest.setTimeout(30000);

// global vars to store server and test utils
let server;

// test data
const testNote = { name: 'test note', body: 'test note body' };

// cleanup after we're done
afterAll(() => server?.close());

beforeAll(async () => {
  // run "next build" in project workdirn
  await exec({ workdir: testPath, command: 'npx', args: ['next', 'build'] });
  // build new server
  const fastifyServer = await build();
  server = fastifyServer;
  // wait for it to be ready
  await server.ready();
});

describe('Next.js plugin setup', () => {
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

    expect(res.body).toContain(
      '<div id="__next"><div><div>Welcome to Next.js &amp; Graffiti!</div><pre>[]</pre></div></div>'
    );
  });
});
