import { client } from '../util/client';

const notesQuery = `
  query AllNotes {
    noteMany {
      name
      body
    }
  }
`;

export default function HomePage({ notes }) {
  return (
    <div>
      <div>Welcome to Next.js & Graffiti!</div>
      <pre>{JSON.stringify(notes, null, 2)}</pre>
    </div>
  );
}

export const getStaticProps = async () => {
  const {
    data: { noteMany },
  } = await client.query(notesQuery).toPromise();

  return {
    props: {
      notes: noteMany,
    },
  };
};
