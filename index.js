const request = require('@fatmatto/ptth')
const CronJob = require('cron').CronJob
const EventEmitter = require('events').EventEmitter
/**
 * @class Worker
 */
class Worker extends EventEmitter {
  /**
   * Creates an instance of a Worker.
   * @param {Object} config
   * @param {String} config.topic The name of the kind of jobs this worker will run
   * @param {String} [config.scheduling] Cron expression to state when to look for queued jobs to process. Defaults to every minute.
   * @param {String} [config.gravityUrl] The gravity instance's url
   * @param {String} [config.timezone] The timezone to use in the cron parser
   * @param {String} [config.retryBackoff] Backoff time after a job is set to be retried
   *
   */
  constructor (config) {
    super()
    this.topic = config.topic
    this.retryBackoff = config.retryBackoff || null
    this.gravityUrl = config.gravityUrl
    this.scheduling = config.scheduling || '* * * * *'
    if (config.timezone) {
      this.timezone = config.timezone
    }
  }

  /**
   * Returns the next job to run
   */
  async dequeue () {
    const response = await request({
      method: 'POST',
      url: `${this.gravityUrl}/topics/${this.topic}/dequeue`
    })

    const job = response.body.data

    if (job) {
      this.emit('job', job)
    }

    return job
  }

  /**
 * Enqueues a new job into the queue
 */
  async enqueue (data) {
    const response = await request({
      method: 'POST',
      url: `${this.gravityUrl}/topics/${this.topic}/enqueue`,
      body: data
    })
    return response.body.data
  }

  /**
   * Mark the job as succesfully completed
   * @param {String} jobUuid The job uuid
   */
  async complete (jobUuid, output = {}) {
    const response = await request({
      method: 'PUT',
      url: `${this.gravityUrl}/jobs/${jobUuid}/complete`,
      body: {
        output
      }
    })
    this.emit('complete', response.body.data)
    return response.body.data
  }

  /**
   * Mark the job as failed
   * @param {String} jobUuid The job uuid
   */
  async fail (jobUuid, error = {}) {
    const response = await request({
      method: 'PUT',
      url: `${this.gravityUrl}/jobs/${jobUuid}/fail`,
      body: {
        error
      }
    })
    this.emit('fail', response.body.data)
    return response.body.data
  }

  /**
   * Return the job to the "in_queue" state
   * @param {String} jobUuid The job uuid
   */
  async return (jobUuid) {
    const options = {}

    if (this.retryBackoff !== null) {
      // Retry backoff is expressed in milliseconds
      // we will add these milliseconds to the current time
      const currentTime = Date.now()
      const backoffMs = currentTime + this.retryBackoff
      options.backoffUntil = new Date(backoffMs).toISOString()
    }
    const response = await request({
      method: 'PUT',
      url: `${this.gravityUrl}/jobs/${jobUuid}/return`,
      body: options
    })
    this.emit('return', response.body.data)
    return response.body.data
  }

  /**
   * Starts dequeing job, whenever a job is found, it emits a "job" event.
   */
  start () {
    this.cron = new CronJob(this.scheduling, async () => {
      await this.dequeue()
    }, null, true, this.timezone)
  }
}

module.exports = { Worker }
