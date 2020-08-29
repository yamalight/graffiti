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

exports.UPDATE_NOTE_QUERY = `
mutation UpdateNote($id:MongoID!, $name:String, $body:String) {
  noteUpdateById(record:{_id:$id, name:$name, body:$body}) {
    record {
      _id
      name
      body
    }
  }
}
`;

exports.GET_NOTE_QUERY = `
query GetNoteById($id:MongoID!) {
  noteById(_id:$id) {
    _id
    name
    body
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
