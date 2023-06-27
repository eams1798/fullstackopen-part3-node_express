import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import Person from './models/person';

const app = express();
const port = process.env.PORT;

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

morgan.token('body', (req: Request, res: Response) => (
  req.method === 'POST'? JSON.stringify(req.body): '')
);

app.use(morgan( (tokens, req, res) => ([
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' '))
));

app.get('/api', (req, res) => {
  res.json({status: 200, message: 'OK'});
});

app.get('/api/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(`<p>Phonebook has info for ${persons.length} people(s)</p>

      <p>${new Date()}</p>`);
  });
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

app.get('/api/persons/:personId', (req, res, next) => {
  const personId = req.params.personId;

  Person.findById(personId)
  .then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).json({status: 404, message: 'person not found'});
    }
  }).catch(error => {
    next(error);
  });
});

app.post('/api/persons', (req, res, next) => {
  const newPerson = req.body;
  
  // Validate newPerson
  if (!newPerson.name || !newPerson.number) {
    return res.status(400).json({status: 400, message: 'Name and number are required'});
  }
    // Add id to new person and add it to the array
    const personOnDB = new Person({...newPerson});
  
    personOnDB.save()
    .then(savedPerson => {
      return savedPerson.toJSON();
    }).then(savedAndFormattedPerson => {
      res.json(savedAndFormattedPerson);
    }).catch(error => {
      next(error);
    });
});

app.put('/api/persons/:id', (req, res, next) => {
  const dataToUpdate = req.body;

  Person
  .findByIdAndUpdate(req.params.id, dataToUpdate, { new: true, runValidators: true })
  .then(updatedPerson => { res.json(updatedPerson) })
  .catch(error => next(error));
});

app.delete('/api/persons/:personId', (req, res, next) => {
  const personId = req.params.personId;

  Person.findByIdAndRemove(personId)
  .then(result => {
    if (result) {
      res.json({ status: 204, message: 'Person deleted successfully' });
    } else {
      const error = new Error('Person not found');
      error.name = 'DeleteError';
      throw error;
    }
  }).catch(error => {
    next(error);
  });
});

const unknownEndpoint = (req: Request, res: Response): void => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): any => {
  console.error(`${error.name}:
  ${error.message}`);
  if (error.name === 'CastError') {
    return res.status(400).json({ status: 400, error: 'malformatted id' });
  } else if (error.name === 'DeleteError') {
    return res.status(404).json({ status: 404, error: 'Person not found' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ status: 400, error: error.message });
  };
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
