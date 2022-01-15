require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/mongo')

const requestLogger = (request, response, next) => {
    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    next()
}
app.use(express.static('build'))
//Makes posting in json occur
app.use(express.json())
app.use(requestLogger)
//Makes posting in json occur
app.use(cors())
app.use(morgan(function (tokens, req, res) {
    const method = tokens.method(req, res)
    const body = JSON.stringify(req.body)
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

app.get('/api/persons/:id', (request, response, next) => {
    //Request.params.id specifies id, and as it comes in as string, converts to number
    Person.findById(request.params.id).then(person => {

        if(person) {
            response.json(person)
        }
        else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
        //204 indicates successful response, no return; .end() quickly ends response
            return response.status(204).end()
        })
        .catch(error => next(error))

})

app.get('/api/info', (request, response) => {
    const date = new Date()
    Person.find({})
        .then(persons => {
            response.send(
                `<p> Phonebook has info for ${persons.length} people </p>
            <p>${date}</p>`
            )
        })
})

app.post('/api/persons', (request, response, next) => {
    //Works because of app.use(express.json())
    const body = request.body

    console.log(body)

    if (body.number === undefined || body.name === undefined){
        response.status(400).send( { error: 'missing name or number' } )
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
        .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        'number': body.number
    }
    //findByIdAndUpdate(search_param, new object, optional={new:true}) <-- returns updated/new object
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
    //.status() will return the status of RESPONSE, .send()
    if (error.name === 'CastError'){
        return response.status(400).send({ error: 'there was an error' })
    }

    else if (error.name === 'ValidationError'){
        return response.status(400).send({ error: error.message })
    }
    next(error)
}

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT , () => {
    console.log(`Server running on ${PORT}`)
})