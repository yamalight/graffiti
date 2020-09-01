/* eslint-env jest */
const path = require('path');
const { build } = require('../lib');
const { executeGraphql } = require('./helpers/graphql');
const {
  CREATE_NOTE_QUERY,
  GET_CUSTOM_NOTE_QUERY,
} = require('./fixtures/queries.custom-resolvers');

// mock current workdir
const testPath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'examples',
  'custom-resolvers'
);
jest.spyOn(process, 'cwd').mockImplementation(() => testPath);

// mock config to use in-mem mongo server
jest.mock('../lib/config');

// global vars to store server and test utils
let server;

// test data
const testNote = { name: 'test note', body: 'test note body' };

// created note
let createdNote;

// cleanup after we're done
afterAll(() => server?.close());

beforeAll(async () => {
  // build new server
  const fastifyServer = await build();
  server = fastifyServer;
  // wait for it to be ready
  await server.ready();
});

describe('Custom resolvers setup', () => {
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

    // store for future test
    createdNote = record;
  });

  test('Should use custom resolver', async () => {
    const {
      data: { noteCustomById: item },
    } = await executeGraphql({
      server,
      query: GET_CUSTOM_NOTE_QUERY,
      variables: { id: createdNote._id },
    });

    expect(item.name).toBe(testNote.name);
    expect(item.body).toBe(testNote.body);
  });
});
