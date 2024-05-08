const express = require('express')
const app = express()

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.use(express.json());

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
});

app.get('/api/persons', (request, response) => {
  response.json(persons)
});

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.random(...persons.map(n => n.id)).toFixed(2)*(100)
    : 0
  return maxId + 1
};

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'Falta el nombre o el número' 
    });
  };

  const duplicado = persons.find(person => person.name === body.name);

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

  persons = persons.concat(person);

  response.json(person);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  };
});

app.get('/info', (request, response) => {
  const currentTime = new Date(Date.now()).toString()
  const entriesCount = persons.length
  response.send(`
  <h1>Información de la agenda</h1>
  <p>Hora de la solicitud: ${currentTime}</p>
  <p>Cantidad de entradas en la agenda: ${entriesCount}</p>`)
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
