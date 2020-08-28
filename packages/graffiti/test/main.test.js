/* eslint-env jest */
const path = require('path');
const { build } = require('../lib');
const { createTestClient } = require('apollo-server-testing');
const {
  CREATE_NOTE_QUERY,
  GET_NOTES_QUERY,
} = require('./fixtures/queries.basic');

const testPath = path.join(__dirname, '..', '..', '..', 'examples', 'basic');
jest.spyOn(process, 'cwd').mockImplementation(() => testPath);

// global vars to store server and test utils
let server;
let gqlServer;
let query;
let mutate;

// test data
const testNote = { name: 'test note', body: 'test note body' };

// cleanup after we're done
afterAll(() => server.close());

beforeAll(async () => {
  // build new server
  const { server: fastifyServer, gqlServer: graphqlServer } = await build();
  server = fastifyServer;
  gqlServer = graphqlServer;
  // wait for it to be ready
  await server.ready();
  // create new test graphql client
  const { query: testQuery, mutate: testMutate } = createTestClient(gqlServer);
  query = testQuery;
  mutate = testMutate;
});

describe('Basic setup', () => {
  test('Should create new note', async () => {
    const {
      data: {
        noteCreate: { record },
      },
    } = await mutate({
      mutation: CREATE_NOTE_QUERY,
      variables: { name: testNote.name, body: testNote.body },
    });

    expect(record.name).toBe(testNote.name);
    expect(record.body).toBe(testNote.body);
  });

  test('Should get all notes', async () => {
    const {
      data: { noteMany: items },
    } = await query({
      query: GET_NOTES_QUERY,
    });

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(testNote.name);
    expect(items[0].body).toBe(testNote.body);
  });
});
