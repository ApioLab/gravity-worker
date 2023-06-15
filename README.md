### Apio Gravity Worker Helper  

Helps you implement gravity job workers:

```javascript

const {Worker} = require('/path/to/apio-gravity-worker/index.js')

const w = new Worker({
      topic: 'project.resource.action',
      scheduling: '* * * * *',
      gravityUrl: config.gravityBaseUrl,
      retryBackoff: 1000 * 60 // optional, 1 minute backoff
})

// React to a job
w.on('job', async job => {
  console.log("New job received",job)

  // Return the job to retry it
  w.return(job.uuid)

  // Mark the job as failed, not to be retried
  w.fail(job.uuid,{error:'message'})

  // Mark the job as completed, not to be retried
  w.complete(job.uuid,{output:42})
})

// Starts the cron
w.start()

// Not waiting for the first cron tick running it right away
w.dequeue()

```