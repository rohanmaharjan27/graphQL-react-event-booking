import express from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import mongoose from 'mongoose';
import Event from './models/event.js';

dotenv.config();

const app = express();

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
      events: () =>
        Event.find()
          .then((eventArr) =>
            eventArr.map((event) => ({ ...event._doc, _id: event._doc._id.toString() })),
          )
          .catch((err) => {
            throw err;
          }),

      createEvent: ({ eventInput }) => {
        const { title, description, price, date } = eventInput;

        const newEvent = {
          title,
          description,
          price: +price,
          date: new Date(date),
        };

        const event = new Event(newEvent);

        event
          .save()
          .then((result) => ({ ...result._doc, _id: event.id }))
          .catch((err) => {
            console.log(err);
          });
        return event;
      },
    },
    graphiql: true,
  }),
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.dzsue.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  )
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Started at ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));
