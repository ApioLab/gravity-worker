module.exports = {
  getDequeueResponse: (TOPIC) => {
    return {
      status: true,
      data: {
        _id: '5d5dc5e83688f63909d18a3a',
        topic: TOPIC,
        data: {
          hello: 'world'
        },
        __v: 0,
        startedAt: 1566426610066,
        updatedAt: '2019-08-21T22:30:00.265Z',
        status: 'completed',
        priority: 0,
        retries: 0,
        createdAt: '2019-08-21T22:30:00.265Z',
        uuid: 'working-job'
      }
    }
  }
}
