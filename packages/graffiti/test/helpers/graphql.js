// executes query or mutation with variables on server and returns JSON result
exports.executeGraphql = async ({
  server,
  mutation,
  query,
  variables,
  token,
}) => {
  const req = {
    method: 'POST',
    url: '/graphql',
    body: {
      query: query ?? mutation,
      variables,
    },
  };
  if (token) {
    req.headers = { Authorization: `Bearer ${token}` };
  }
  const res = await server.inject(req);

  return res.json();
};
