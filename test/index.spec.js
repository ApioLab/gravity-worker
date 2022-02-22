const test = require('ava')
const nock = require('nock')
const { Worker } = require('../index')
const GRAVITY_URL = 'http://gravity'
const TOPIC = 'some-test-topic'

const { getDequeueResponse } = require('./fixtures/jobs')

class ValidWorker extends Worker {
  constructor () {
    super({
      topic: TOPIC,
      gravityUrl: GRAVITY_URL
    })
  }

  async run (job) {
    await this.complete(job.uuid)
  }
}
test.before('Preparing mocks', () => {
  nock(GRAVITY_URL)
    .persist(true)
    .post('/topics/some-test-topic/dequeue')
    .reply(200, getDequeueResponse(TOPIC))

  nock(GRAVITY_URL)
    .persist(true)
    .put('/jobs/working-job/complete')
    .reply(200, { status: true, data: {} })

  nock(GRAVITY_URL)
    .persist(true)
    .put('/jobs/working-job/return')
    .reply(200, { status: true, data: {} })

  nock(GRAVITY_URL)
    .persist(true)
    .put('/jobs/working-job/fail')
    .reply(200, { status: true, data: {} })
})

// @ts-ignore
test('Should retrieve a job', async t => {
  t.plan(1)
  const w = new ValidWorker()

  // @ts-ignore
  w.on('job', (data) => {
    t.pass()
  })
  await w.dequeue()
})

// @ts-ignore
test('Should complete a job', async t => {
  t.plan(1)
  const w = new ValidWorker()
  const job = getDequeueResponse(TOPIC).data
  w.on('complete', () => {
    t.pass()
  })
  await w.complete(job.uuid)
})

// @ts-ignore
test('Should return a job', async t => {
  t.plan(1)
  const w = new ValidWorker()
  const job = getDequeueResponse(TOPIC).data
  w.on('return', () => {
    t.pass()
  })
  await w.return(job.uuid)
})

// @ts-ignore
test('Should fail a job', async t => {
  t.plan(1)
  const w = new ValidWorker()
  const job = getDequeueResponse(TOPIC).data
  w.on('fail', () => {
    t.pass()
  })
  await w.fail(job.uuid)
})
