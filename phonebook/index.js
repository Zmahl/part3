const express = require('express')
const app = express()

//Makes posting in json occur
app.use(express.json())

let persons = [
    { 
        id: 1,
        name: "Arto Hellas", 
        number: "040-123456"
      },
      { 
        id: 2,
        name: "Ada Lovelace", 
        number: "39-44-5323523"
      },
      { 
        id: 3,
        name: "Dan Abramov", 
        number: "12-43-234345"
      },
      {
        id: 4,
        name: "Mary Poppendieck", 
        number: "39-23-6423122"
      }
]

const generateId = () => {
    return (Math.floor(Math.random() * 10000))
}

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })
  
  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

app.get ('/api/persons/:id', (request, response) => {
    //Request.params.id specifies id, and as it comes in as string, converts to number
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)

    if (person){
        response.json(person)
    }

    else{
        response.status(404).end(`Person with id ${id} doesn't exist`)
    }
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
    if (!body.name || !body.number) {
        return response.status(404).json({
            error: 'name or number missing'
        })
    }

    const check_name = persons.find(p => p.name === body.name)

    if(check_name){
        return response.status(404).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    

    persons = persons.concat(person)

    //Send back response with new person added
    response.json(persons)
})
const PORT = 3001

app.listen(PORT , () => {
    console.log(`Server running on ${PORT}`)
})