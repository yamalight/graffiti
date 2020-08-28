/* eslint-env jest */
const path = require('path');
const { build } = require('../lib');
const { createTestClient } = require('apollo-server-testing');
const {
  CREATE_COLLECTION_QUERY,
  CREATE_NOTE_QUERY,
  GET_NOTES_QUERY,
} = require('./fixtures/queries.relations');

// mock current workdir
const testPath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'examples',
  'relations'
);
jest.spyOn(process, 'cwd').mockImplementation(() => testPath);

// mock config to use in-mem mongo server
jest.mock('../lib/config');

// global vars to store server and test utils
let server;
let gqlServer;
let query;
let mutate;

// test data
const testNote = { name: 'test note', body: 'test note body' };
const testCollection = { name: 'test collection' };

// create data
let createdCollection;

// cleanup after we're done
afterAll(() => server?.close());

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

describe('Relations setup', () => {
  test('Should create new collection', async () => {
    const {
      data: {
        collectionCreate: { record },
      },
    } = await mutate({
      mutation: CREATE_COLLECTION_QUERY,
      variables: { name: testCollection.name },
    });

    expect(record.name).toBe(testCollection.name);

    // store new collection for next tests
    createdCollection = record;
  });

  test('Should create new note', async () => {
    const {
      data: {
        noteCreate: { record },
      },
    } = await mutate({
      mutation: CREATE_NOTE_QUERY,
      variables: {
        name: testNote.name,
        body: testNote.body,
        group: createdCollection._id,
      },
    });

    expect(record.name).toBe(testNote.name);
    expect(record.body).toBe(testNote.body);
    expect(record.group._id).toBe(createdCollection._id);
    expect(record.group.name).toBe(createdCollection.name);
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
    expect(items[0].group._id).toBe(createdCollection._id);
    expect(items[0].group.name).toBe(createdCollection.name);
  });
});
