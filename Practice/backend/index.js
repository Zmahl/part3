const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())

//Used for easily adding data to the server, json-parser
app.use(express.json())

//Makes express able to show static content - images, css files, js files
//If file is in the same folder, I can now run the app from the BACKEND
app.use(express.static('build'))

//Array of objects, JSON file
let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2019-05-30T17:30:31.098Z",
        important: true
      },
      {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2019-05-30T18:39:34.091Z",
        important: false
      },
      {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2019-05-30T19:20:14.298Z",
        important: true
      }
]

  const generateId = () => {
    const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0

    return maxId + 1
  }

app.get('/api/notes', (request, response) => {
  response.json(notes)
})
//Creating route parameters, using colon notation within the get request
app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  console.log(id)
  const note = notes.find(note => note.id === id)

  //Checks to see if the note exists, if not returns 404 status rather than success of 200 status
  if (note) {
    response.json(note)
  }
  else {
    //end method responds to the request without sending any data
    response.status(404).end()
  }
})

app.delete('api/notes/:id', (response, request) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)

  //repond with 204 status and no content for response data
  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  //create variable to contain body of request
  const body = request.body

  //checks to see an empty request wasn't made, returns an error as json object if empty
  if (!body.content){
    return response.status(400).json({
      error : 'content missing'
    })
  }

  //If important property missing, give it false by default
  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId()
  }

  //Creates a copy of the previous notes array, adding on the new note object
  notes = notes.concat(note)
  //Returns the new array of notes to the frontend
  response.json(note)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body:', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})