/* eslint-env jest */
const path = require('path');
const { build } = require('../lib');
const { executeGraphql } = require('./helpers/graphql');
const {
  CREATE_NOTE_QUERY,
  GET_NOTES_QUERY,
} = require('./fixtures/queries.basic');

// mock current workdir
const testPath = path.join(__dirname, '..', '..', '..', 'examples', 'basic');
jest.spyOn(process, 'cwd').mockImplementation(() => testPath);

// mock config to use in-mem mongo server
jest.mock('../lib/config');

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

  test('Should get all notes', async () => {
    const {
      data: { noteMany: items },
    } = await executeGraphql({
      server,
      query: GET_NOTES_QUERY,
    });

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(testNote.name);
    expect(items[0].body).toBe(testNote.body);
  });
});
