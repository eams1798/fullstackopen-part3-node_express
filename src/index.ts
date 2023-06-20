import express, { response } from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

let persons = [
  { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": 'afc292bc-33b4-4c40-83c6-087ba58dba09'
  },
  { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": '4234676d-eba7-4e04-860c-5c239cb33383'
  },
  { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": 'f11b4407-8180-4d85-8dbc-f477616b66f3'
  },
  { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423125",
    "id": '6b1cf382-fe8a-450c-8f93-850ef2a60cbb'
  }
]

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
  res.send(`<p>Phonebook has info for ${persons.length} people(s)</p>

  <p>${new Date()}</p>`);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:personId', (req, res) => {
  const personId = req.params.personId;
  const person = persons.find(p => p.id === personId);

  if (person) {
    res.json(person);
  } else {
    res.status(404).json({status: 404, message: 'person not found'});
  }
});

app.post('/api/persons', (req, res) => {
  const newPerson = req.body;
  
  // Validate newPerson
  if (!newPerson.name || !newPerson.number) {
    return res.status(400).json({status: 400, message: 'Name and number are required'});
  }

  const personExists = persons.find(p => p.name === newPerson.name);
  if (personExists) {
    return res.status(409).json({status: 409, message: 'Person already exists'});
  }

  // Add id to new person and add it to the array
  const personWithId = {...newPerson, id: uuidv4() };
  persons.push(personWithId);

  // Respond with the added person
  res.status(201).json(personWithId);
});

app.delete('/api/persons/:personId', (req, res) => {
  const personId = req.params.personId;
  const deletedPerson = persons.find(p => p.id === personId);

  if (deletedPerson) {
    persons = persons.filter(p => p.id !== personId);
    res.json({status: 200, message: 'Person deleted successfully', person: deletedPerson}, );
  } else {
    res.status(404).json({status: 404, message: 'Person not found'});
  }
});

const unknownEndpoint = (req: Request, res: Response): void => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
