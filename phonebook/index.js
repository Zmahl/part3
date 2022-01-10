require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/mongo')
const { Mongoose } = require('mongoose')

//Makes posting in json occur
app.use(express.json())
app.use(cors())

app.use(express.static('build'))

app.use(morgan(function (tokens, req, res) {

    method = tokens.method(req, res)
    body = JSON.stringify(req.body)

    if (method === 'POST') {

        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            body           
            ].join(' ')
    }

    else {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms'
            ].join(' ')
    }
}))

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })
  
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
  })

app.get ('/api/persons/:id', (request, response) => {
    //Request.params.id specifies id, and as it comes in as string, converts to number
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})  

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

app.get('/api/info', (request, response) => {
    const length_list = persons.length
    const date = new Date()

    response.send(`<p>Phonebook has info for ${length_list} people</p>
    <p>${date}</p>`)
})

app.post('/api/persons', (request, response) => {
    //Works because of app.use(express.json())
    const body = request.body

    console.log(body)

    if (body.number === undefined || body.name === undefined){
        return response.status(400).json({error: "content missing"})
    }

    //Make post requests go right to MongoDB
    const person = new Person({
        name: body.name,
        number: body.number
    })

    //Saving the person I just made using the mongoose model to the DB
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

})

const PORT = process.env.PORT

app.listen(PORT , () => {
    console.log(`Server running on ${PORT}`)
})