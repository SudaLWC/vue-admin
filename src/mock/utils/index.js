// const { join } = require('path')
// const fs = require('fs')

/**
 * @description 处理所有 controller 模块，npm run serve时在node环境中自动输出controller文件夹下Mock接口。
 * @returns {[]}
 */
// export function handleMockArray() {
//   const mockArray = []
//   const getFiles = (jsonPath) => {
//     const jsonFiles = []
//     const findJsonFile = (path) => {
//       const files = fs.readdirSync(path)
//       files.forEach((item) => {
//         const fPath = join(path, item)
//         const stat = fs.statSync(fPath)
//         if (stat.isDirectory() === true) findJsonFile(item)
//         if (stat.isFile() === true) jsonFiles.push(item)
//       })
//     }
//     findJsonFile(jsonPath)
//     jsonFiles.forEach((item) => mockArray.push(`./controller/${item}`))
//   }
//   getFiles('mock/controller')
//   return mockArray
// }


/**
 * @description 将url请求参数转为json格式
 * @param url
 * @returns {{}|any}
 */
export function paramObj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}