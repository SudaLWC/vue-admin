const { mock } = require('mockjs')
const { handleMockArray } = require('./utils')
const baseURL = 'https://lianghj.top:8888/api/private/v1'


const mocks = []
const mockArray = handleMockArray()
mockArray.forEach((item) => {
  const obj = require(`${item}`)
  mocks.push(...obj)
})
mocks.map(route => responseFake(route.url, route.type, route.response))


/**
 *
 * @param url
 * @param type 
 * @param respond
 * @returns {{response(*=, *=): void, type: (*|string), url: RegExp}}
 */
const responseFake = (url, type, respond) => {
  return {
    url: new RegExp(`${baseURL}${url}`),
    type: type || 'get',
    response(req, res) {
      res.status(200)
      res.json(mock(respond instanceof Function ? respond(req, res) : respond))
    },
  }
}
