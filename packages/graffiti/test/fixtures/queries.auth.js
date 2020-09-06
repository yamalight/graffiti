exports.GET_USER_QUERY = `
query GetUser($id:MongoID!) {
  userById(_id:$id) {
    _id
    email
    password
  }
}
`;
