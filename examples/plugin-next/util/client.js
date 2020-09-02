import { createClient } from 'urql';

export const client = createClient({
  url: 'http://localhost:3000/graphql',
});
