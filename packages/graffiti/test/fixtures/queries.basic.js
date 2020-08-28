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

exports.GET_NOTES_QUERY = `
query GetNotes {
  noteMany {
    _id
    name
    body
  }
}
`;
