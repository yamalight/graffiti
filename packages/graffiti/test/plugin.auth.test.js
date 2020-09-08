/* eslint-env jest */
const path = require('path');
const bcrypt = require('bcrypt');
const { build } = require('../lib');
const { executeGraphql } = require('./helpers/graphql');
const {
  CREATE_NOTE_QUERY,
  GET_NOTES_QUERY,
} = require('./fixtures/queries.basic');
const {
  GET_USER_QUERY,
  CREATE_USER_NOTE_QUERY,
  GET_USER_NOTES_QUERY,
} = require('./fixtures/queries.auth');

// mock current workdir
const testPath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'examples',
  'plugin-auth'
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
const testUserNote = { name: 'test user note', body: 'test user note body' };
const testUser = { email: 'test@mail.com', password: '123' };
let token;
let createdUserId;

// cleanup after we're done
afterAll(() => server?.close());

beforeAll(async () => {
  // build new server
  const fastifyServer = await build();
  server = fastifyServer;
  // wait for it to be ready
  await server.ready();
});

describe('Auth plugin setup', () => {
  test('Should register new user', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/register',
      body: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    const body = await res.json();

    expect(body.token).toBeDefined();
    expect(body.user.email).toEqual(testUser.email);
    // check passwords
    const passwordsMatch = await bcrypt.compare(
      testUser.password,
      body.user.password
    );
    expect(passwordsMatch).toEqual(true);

    // save token & id for future tests
    token = body.token;
    createdUserId = body.user._id;
  });

  test('Should login with new user', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/login',
      body: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(body.user.email).toEqual(testUser.email);
    // check passwords
    const passwordsMatch = await bcrypt.compare(
      testUser.password,
      body.user.password
    );
    expect(passwordsMatch).toEqual(true);
  });

  test('Should get user data with auth', async () => {
    const {
      data: { userById: user },
    } = await executeGraphql({
      server,
      query: GET_USER_QUERY,
      variables: { id: createdUserId },
      token,
    });

    expect(user.email).toBe(testUser.email);
    // check passwords
    const passwordsMatch = await bcrypt.compare(
      testUser.password,
      user.password
    );
    expect(passwordsMatch).toEqual(true);
  });

  test('Should not create new note without auth', async () => {
    const res = await executeGraphql({
      server,
      mutation: CREATE_NOTE_QUERY,
      variables: { name: testNote.name, body: testNote.body },
    });

    expect(res.data).toBeFalsy();
    expect(res.errors).toHaveLength(1);
    expect(res.errors[1]).toMatchSnapshot();
  });

  test('Should create new note with auth', async () => {
    const {
      data: {
        noteCreate: { record },
      },
    } = await executeGraphql({
      server,
      mutation: CREATE_NOTE_QUERY,
      variables: { name: testNote.name, body: testNote.body },
      token,
    });

    expect(record.name).toBe(testNote.name);
    expect(record.body).toBe(testNote.body);
  });

  test('Should not get notes without token', async () => {
    const res = await executeGraphql({
      server,
      query: GET_NOTES_QUERY,
    });

    expect(res.data).toBeFalsy();
    expect(res.errors).toHaveLength(1);
    expect(res.errors[1]).toMatchSnapshot();
  });

  test('Should get all notes with auth', async () => {
    const {
      data: { noteMany: items },
    } = await executeGraphql({
      server,
      query: GET_NOTES_QUERY,
      token,
    });

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(testNote.name);
    expect(items[0].body).toBe(testNote.body);
  });

  test('Should create new note for current user with auth', async () => {
    const {
      data: { userNoteCreate: note },
    } = await executeGraphql({
      server,
      mutation: CREATE_USER_NOTE_QUERY,
      variables: { name: testUserNote.name, body: testUserNote.body },
      token,
    });

    expect(note.name).toBe(testUserNote.name);
    expect(note.body).toBe(testUserNote.body);
    expect(note.user.email).toBe(testUser.email);
  });

  test('Should get all notes for current user with auth', async () => {
    const {
      data: { userNotes: items },
    } = await executeGraphql({
      server,
      query: GET_USER_NOTES_QUERY,
      token,
    });

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(testUserNote.name);
    expect(items[0].body).toBe(testUserNote.body);
    expect(items[0].user.email).toBe(testUser.email);
  });
});
