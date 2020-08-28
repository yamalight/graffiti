exports.CREATE_NOTE_QUERY = `
mutation CreateNote($name:String!, $body:String!, $group: MongoID!) {
  noteCreate(record:{name:$name, body:$body, group: $group}) {
    record {
      _id
      name
      body
      group {
        _id
        name
      }
    }
  }
}
`;

exports.CREATE_COLLECTION_QUERY = `
mutation CreateCollection($name:String) {
  collectionCreate(record:{name:$name}) {
    record {
      _id
      name
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
    group {
      _id
      name
    }
  }
}
`;

exports.GET_COLLECTIONS_QUERY = `
query GetCollections {
  collectionMany {
    _id
    name
    notes {
      _id
      name
      body
    }
  }
}
`;
