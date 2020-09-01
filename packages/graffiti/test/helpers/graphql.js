// executes query or mutation with variables on server and returns JSON result
exports.executeGraphql = async ({ server, mutation, query, variables }) => {
  const res = await server.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query: query ?? mutation,
      variables,
    },
  });

  return res.json();
};
