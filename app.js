import express from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
    type RootQuery{
      events: [String!]!
    }

    type RootMutation{
      createEvent(name: String): String
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () => ['Gaming', 'Movies', 'Coding'],
      createEvent: (args) => {
        const eventName = args.name;
        return eventName;
      },
    },
    graphiql: true,
  }),
);

app.listen(process.env.PORT, () => {
  console.log(`Started at ${process.env.PORT}`);
});
