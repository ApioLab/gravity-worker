### Apio Gravity Worker Helper  

Helps you implement gravity job workers:

```javascript

const {Worker} = require('/path/to/apio-gravity-worker/index.js')

const w = new Worker({
      topic: 'project.resource.action',
      scheduling: '* * * * *',
      gravityUrl: config.gravityBaseUrl
})

// React to a job
w.on('job', async job => {
  console.log("New job received",job)
})

// Starts the cron
w.start()

// Not waiting for the first cron tick running it right away
w.dequeue()

```