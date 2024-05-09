const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express()

// let persons = [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ];

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[content-length]'));
app.use(cors());

morgan.token('url', function getUrlToken (req) {
  return req.url;
});

morgan.token('method', function getMethodToken (req) {
  return req.method;
});

morgan.token('status', function getStatusToken (req, res) {
  return headersSent(res)
    ? String(res.statusCode)
    : undefined
})

morgan.token('res', function getResponseHeader (req, res, field) {
  if (!headersSent(res)) {
    return undefined;
  };

  let header = res.getHeader(field);

  return Array.isArray(header)
    ? header.join(', ')
    : header
});

morgan.token('response-time', function getResponseTimeToken (req, res, digits) {
  if (!req._startAt || !res._startAt) {
    return;
  };

  let ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(digits === undefined ? 3 : digits);
});

morgan.token('req', function getRequestToken (req) {
  return JSON.stringify(req.body);
});

function headersSent (res) {
  return typeof res.headersSent !== 'boolean'
    ? Boolean(res.header)
    : res.headersSent
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Endpoint desconocido' });
};

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  response.json(notes);
});

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.random(...notes.map(n => n.id)).toFixed(2)*(100)
    : 0
  return maxId + 1
};

app.post('/api/notes', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'Falta el nombre o el número' 
    });
  };

  const duplicado = notes.find(person => person.name === body.name);

  if ( duplicado ){
    return response.status(400).json({
      error: 'El nombre ya existe'
    });
  };

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,    
  };

  notes = notes.concat(person);

  response.json(person);
});

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = notes.find(person => person.id === id);
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  };
});

app.get('/info', (request, response) => {
  const currentTime = new Date(Date.now()).toString()
  const entriesCount = notes.length
  response.send(`
  <h1>Información de la agenda</h1>
  <p>Hora de la solicitud: ${currentTime}</p>
  <p>Cantidad de entradas en la agenda: ${entriesCount}</p>`)
});

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(person => person.id !== id)

  response.status(204).end()
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})