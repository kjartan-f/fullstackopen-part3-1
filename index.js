require('dotenv').config()
const express = require('express')
const app = express()

const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', function getId (req) {
  const body = (Object.keys(req.body).length === 0)? '' : JSON.stringify(req.body)
  return body
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const errorHandler = (error, request, response, next) => {

  if (error.name === 'CastError') {
    return response.status(404).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)

}


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  }).catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length}</p><p>${new Date()}</p>`)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response,next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request,response, next) => {

  const body = request.body

  /*if (!body.name || !body.number) {
      return response.status(400).json({
          error: 'name or number missing'
        })
  }*/

  const person = new Person({
    name: body.name,
    number : body.number
  })

  person.save().then(person => {
    response.json(person.toJSON())
  }).catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name of number missing'
    })
  }

  const updatePerson = {
    name : body.name,
    number : body.number
  }

  Person.findByIdAndUpdate(request.params.id, updatePerson, { new:true }).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})