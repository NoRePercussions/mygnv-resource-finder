import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import history from 'connect-history-api-fallback';
import morgan from 'morgan';

import passport from './passport';
import { buildContext, createOnConnect } from 'graphql-passport';

import categoryRouter, { path as categoryPath } from '../routes/CategoryRoute';
import locationRouter, { path as locationPath } from '../routes/LocationRoute';
import resourceRouter, { path as resourcePath } from '../routes/ResourceRoute';
import userRouter, { path as userPath } from '../routes/UserRoute';

import { ApolloServer, gql } from 'apollo-server-express';
import { schemaComposer } from 'graphql-compose';

import { UserType, UserModel, Role } from '../models/UserModel';
import { Category, CategoryType } from '../models/CategoryModel';
import { LocationType } from '../models/LocationModel';

import { CategoryGraphQL } from '../resolvers/CategoryResolver';
import { ResourceGraphQL } from '../resolvers/ResourceResolver';
import { LocationGraphQL } from '../resolvers/LocationResolver';

// Populate process.env, for development
import dotenv from 'dotenv';
import { ResourceType } from '../models/ResourceModel';

dotenv.config();

schemaComposer.merge(CategoryGraphQL);
schemaComposer.merge(ResourceGraphQL);
schemaComposer.merge(LocationGraphQL);

const isDevelopment = process.env.NODE_ENV === 'development';

declare global {
  namespace Express {
    export interface User extends UserType {}
    interface Request {
      id?: string;
      user?: User;
      userToUpdate?: UserType;
      category?: CategoryType;
      location?: LocationType;
      resource?: ResourceType;
    }
  }
}

export class ResponseError extends Error {
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
  status?: number;
}

const passportMiddleware = passport.initialize();

const apolloServer = new ApolloServer({
  schema: schemaComposer.buildSchema(),
  playground: {
    settings: {
      'request.credentials': 'include',
    },
  },
});

const dbUri = process.env.DB_URI ? process.env.DB_URI : '';
const port = process.env.PORT
  ? isDevelopment
    ? Number(process.env.PORT) + 1
    : process.env.PORT
  : 8080;

export const start = () => {
  // Connect to database
  mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);

  const app = express();

  // Parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // Parse application/json
  app.use(bodyParser.json());

  // Parse cookies
  app.use(cookieParser());

  app.use(passportMiddleware);

  // Routes
  app.use(resourcePath, resourceRouter);
  app.use(locationPath, locationRouter);
  app.use(categoryPath, categoryRouter);
  app.use(userPath, userRouter);

  // GraphQL middleware
  app.use(apolloServer.getMiddleware({ path: '/graphql' }));

  // Register all routes before registering webpack middleware

  if (isDevelopment) {
    // Handles any requests that don't match the ones above
    app.use(history());

    // Enable request logging for development debugging
    app.use(morgan('dev'));
  }

  // For hosting build files, for production
  if (!isDevelopment) {
    const webpackBuildDir = path.join(__dirname, '../../dist');
    app.use(express.static(webpackBuildDir));

    const htmlEntrypoint = path.join(webpackBuildDir, 'index.html');

    // Handles any requests that don't match the ones above
    app.get('/*', (req, res) => {
      res.sendFile(htmlEntrypoint);
    });
  }

  app.listen(port, () => {
    console.log('App listening on port: ' + port);
  });

  return app;
};
