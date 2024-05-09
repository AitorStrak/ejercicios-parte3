const express = require('express');
const app = express();

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": "1"
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": "2"
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": "3"
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": "4"
  },
  {
    "id": "5",
    "name": "Aitor",
    "number": "646937014"
  }
];

app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Endpoint desconocido' });
}

app.get('/', (request, response) => {
  response.send('<h1>Menú principal</h1>');
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({ 
      error: 'Contenido perdido' 
    });
  };

  const person = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    response.json(person);
  } else {
    console.log('x');
    response.status(404).end();
  };
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto: ${PORT}`);
});