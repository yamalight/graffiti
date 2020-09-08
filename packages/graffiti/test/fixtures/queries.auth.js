exports.GET_USER_QUERY = `
query GetUser($id:MongoID!) {
  userById(_id:$id) {
    _id
    email
    password
  }
}
`;

exports.CREATE_USER_NOTE_QUERY = `
mutation AddUserNote($name:String!, $body:String!) {
  userNoteCreate(name:$name, body:$body) {
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

exports.GET_USER_NOTES_QUERY = `
query GetUserNotes {
  userNotes {
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
