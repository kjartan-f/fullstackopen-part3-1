const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const app = express()


app.use(cors())

app.use(express.static('build'))


app.use(express.json())

morgan.token('body', function getId (req) {
    const body = (Object.keys(req.body).length === 0)? '' : JSON.stringify(req.body) 
    return body
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


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
]

const generateId = () => {
    const maxId = (persons.length > 0)? Math.max(...persons.map(person => person.id)) : 0
    return maxId + 1
}


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length}</p><p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    response.json(persons.find((person) => id === person.id))
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter((person) => id !== person.id)
    response.status(204).end()
})

app.post('/api/persons', (request,response) => {

    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'name of number missing' 
          })
    }

    if (persons.find((person) => person.name === body.name)) {
        return response.status(400).json({
            error: 'person already exists'
        })
    }

    const person = {
        id : generateId(),
        name: body.name,
        number : body.number
    }
    persons = [...persons, person]

    response.json(person)
})


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})