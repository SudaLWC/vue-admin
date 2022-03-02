const { mock } = require('mockjs')
const userList = [
  {
    "id": 500,
    "role_name": "超级管理员",
    "username": "admin",
    "create_time": 1486720211,
    "mobile": "15212347977",
    "email": "123@163.com",
    "mg_state": false
  },
  {
    "id": 596,
    "role_name": "超级管理员",
    "username": "admin5",
    "create_time": 1646116223,
    "mobile": "15355555556",
    "email": "143@qq.cn",
    "mg_state": true
  },
  {
    "id": 598,
    "role_name": "超级管理员",
    "username": "admin2",
    "create_time": 1646116478,
    "mobile": "13212121212",
    "email": "11@q.com",
    "mg_state": false
  },
  {
    "id": 599,
    "role_name": "超级管理员",
    "username": "测试1",
    "create_time": 1646117825,
    "mobile": "123123",
    "email": "xx@qq.com",
    "mg_state": true
  },
  {
    "id": 600,
    "role_name": "超级管理员",
    "username": "测1",
    "create_time": 1646118249,
    "mobile": "1222",
    "email": "xxx@qq.com",
    "mg_state": false
  }
]

module.exports = [
  {
    url: /users\?/,
    type: 'get',
    response(options) {
      console.log(options);
      let { query = '', pagenum = 1, pagesize = 5 } = options.query
      // 根据 query 查询数据
      let mockList = userList.filter((item) => {
        if (query && item.username.indexOf(query) < 0) return false
        return true
      })

      // 根据数据条数修正 pagenum
      if (Math.ceil(mockList.length / pagesize) < pagenum) pagenum = 1

      // 根据 pagenum 和 pagesize 筛选数据
      let pageList = mockList.filter(
        (item, index) =>
          index < pagesize * pagenum && index >= pagesize * (pagenum - 1)
      )
      return {
        data: {
          total: mockList.length,
          pagenum,
          users: pageList
        },
        meta: {
          msg: "获取管理员列表成功",
          status: 200
        }
      }
    },
  },
  {
    url: 'users',
    type: 'post',
    response(options) {
      // console.log(options);
      const { email, mobile, password, username } = options.body
      const newUser = mock({
        "id": '@id',
        "role_name": "超级管理员",
        "username": username,
        "create_time": Date.parse(new Date()) / 1000,
        "mobile": mobile,
        "email": email,
        "role_id": -1,
        "mg_state": false
      })
      newUser.id -= 0
      userList.unshift(newUser)
      const { role_name, role_id, mg_state, ...data } = newUser
      // console.log(newUser, '\n', data);
      return {
        data,
        meta: {
          msg: "创建成功",
          status: 201
        }
      }
    },
  },
  {
    url: /users\/\d+\/state\/(true|false)$/,
    type: 'put',
    response(options) {
      // 获取路径参数 id 和 mg_state
      const { url } = options
      const idReg = /(?<=users\/)\d+(?=\/state)/
      const id = ~~idReg.exec(url)[0]
      const mg_state = JSON.parse(/(?<=users\/\d+\/state\/)(true|false)$/.exec(url)[0])
      // 根据 id 修改对应用户的状态 mg_state
      let curUser = userList.find(item => item.id === id)
      curUser['mg_state'] = mg_state
      // console.log(curUser);

      return {
        data: curUser,
        meta: {
          msg: "设置状态成功",
          status: 200
        }
      }
    },
  },
  {
    url: /users\/\d+$/,
    type: 'get',
    response(options) {
      const { url } = options
      const data = userList.find(item => item.id === ~~/(?<=users\/)\d+$/.exec(url))
      // console.log(data);
      return {
        data,
        meta: {
          msg: "获取成功",
          status: 200
        }
      }
    }
  }
]