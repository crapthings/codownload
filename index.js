const getPort = require('get-port')
const cote = require('cote')
const express = require('express')

const app = express()

app.get('/', (req, res) => {
  return res.json({ test: 1 })
})

app.get('/external/download', (req, res) => {
  res.download('./test.txt')
})

app.get('/external/download/okay', (req, res) => {
  res.send(200)
})

getPort().then(port => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
    boot({ port })
  })
})

function boot({ port }) {
  const source = process.env.SOURCE || `http://chengjiantong.fawufiles.com/external/download`
  const target = `/external/download`

  const proxyRequester = new cote.Requester({
    name: 'proxy client',
    namespace: 'proxy service',
    source,
    target,
    port,
  })

  proxyRequester.on('cote:added', (args, cb) => {
    console.log('found proxy service', (new Date()).toString())
  })

  proxyRequester.on('cote:removed', (args, cb) => {
    console.log('proxy service is down', (new Date()).toString())
  })

  const downloadResponder = new cote.Responder({
    name: 'download service',
    // namespace: 'download service',
  })

  downloadResponder.on('download', (req, cb) => {
    cb(source)
  })

  downloadResponder.on('say', (req, cb) => {
    cb('say')
  })
}
