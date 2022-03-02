const data = {
  "id": 500,
  "rid": 0,
  "username": "admin",
  "mobile": "15212347976",
  "email": "178@qq.com",
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjUwMCwicmlkIjowLCJpYXQiOjE2NDYxMzc4ODQsImV4cCI6MTY0NjIyNDI4NH0.SM_W7HmRuYYnuqJz4TKO0DARHpjyHuZ9X4VsYlW6KEM"
}

module.exports = [
  {
    url: 'login',
    type: 'post',
    response() {
      return {
        data,
        meta: {
          msg: "登录成功",
          status: 200
        }
      }
    },
  },
]