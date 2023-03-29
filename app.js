import express from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

dotenv.config();

const app = express();

const events = [];

app.use(bodyParser.json());
app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
    type Event{
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery{
      events: [Event!]!
    }

    input EventInput{
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootMutation{
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () => events,
      createEvent: ({ eventInput }) => {
        const { title, description, price, date } = eventInput;

        const event = {
          _id: Math.random().toString(),
          title,
          description,
          price: +price,
          date,
        };

        events.push(event);

        return event;
      },
    },
    graphiql: true,
  }),
);

app.listen(process.env.PORT, () => {
  console.log(`Started at ${process.env.PORT}`);
});
