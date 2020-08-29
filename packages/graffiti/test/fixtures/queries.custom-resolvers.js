exports.CREATE_NOTE_QUERY = `
mutation CreateNote($name:String!, $body:String!) {
  noteCreate(record:{name:$name, body:$body}) {
    record {
      _id
      name
      body
    }
  }
}
`;

exports.GET_CUSTOM_NOTE_QUERY = `
query GetCustomNote ($id:MongoID!) {
  noteCustomById(id:$id) {
    _id
    name
    body
  }
}
`;
