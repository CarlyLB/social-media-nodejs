// @flow

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import SocialMediaController from './controllers/SocialMediaController';

const app = express();
const port: * = process.env.PORT || 3001;
const socialMediaController = new SocialMediaController();

// Some middleware
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/topics', socialMediaController.getTopics);

app.listen(port, () => console.log(`App listening on port ${port}!`));
