const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'Hello world';
  }

  async _getRequest(url, params) {
    const ctx = this.ctx
    let fullUrl = url + '?'
    let keys = Object.keys(params)
    keys.forEach(key => {
      fullUrl = fullUrl.concat(`${key}=${params[key]}&`)
    })
    fullUrl = fullUrl.substring(0, fullUrl.length - 1)
    console.log('fullUrl', fullUrl)
    const response = await ctx.curl(fullUrl, {
      keepAlive: true,
      // 空闲的 KeepAlive socket 最长可以存活 4 秒
      freeSocketTimeout: 4000,
      // 当 socket 超过 30 秒都没有任何活动，就会被当作超时处理掉
      timeout: 30000,
    })
    return response
  }

  async getUuid() {
    console.log('getUuid...')
    let url = 'https://login.wx2.qq.com/jslogin'
    let params = {
      appid: 'wx782c26e4c19acffb',
      fun: 'new',
      lang: 'zh_CN',
      _: new Date().getTime(),
    }
    const resp = await this._getRequest(url, params)
    const serializedResp = JSON.stringify(resp)
    this.ctx.body = serializedResp
  }

  async waitForScan() {
    const ctx = this.ctx
    const { uuid, tip } = ctx.query
    console.log('waitForLogin...', uuid)
    let url = 'https://login.wx2.qq.com/cgi-bin/mmwebwx-bin/login'
    let params = {
      loginicon: 'true',
      uuid,
      tip,
      _: new Date().getTime(),
    }
    const resp = await this._getRequest(url, params)
    const serializedResp = JSON.stringify(resp)
    this.ctx.body = serializedResp
  }

  async getPassTicket() {
    const ctx = this.ctx
    const query = ctx.query
    const { ticket, uuid, scan } = query
    console.log('getPassTicket...', query)
    let url = 'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage'
    let params = {
      ticket,
      uuid,
      lang: 'zh_CN',
      scan,
      fun: 'new',
      version: 'v2',
    }
    const resp = await this._getRequest(url, params)
    const serializedResp = JSON.stringify(resp)
    this.ctx.body = serializedResp
  }

  async wxinit() {
    const ctx = this.ctx
    const query = ctx.request.body
    console.log(query)
    const { passTicket, wxuin, wxsid, skey, cookies, deviceId } = query
    let url = 'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxinit'
    const getP = {
      pass_ticket: passTicket,
      // r: '-1765460762',
      lang: 'zh_CN'
    }
    const postP = {
      BaseRequest: {
        Uin: wxuin,
        Sid: wxsid,
        Skey: skey,
        DeviceID: deviceId,
      },
    }
    // console.log('wxinit getP', getP)
    // console.log('wxinit postP', postP)
    const resp = await this._postRequest(url, getP, postP, cookies)
    // console.log(resp)
    this.ctx.body = resp
  }

  async _postRequest(url, getP = {}, postP = {}, cookies = '') {
    const ctx = this.ctx
    let fullUrl = url + '?'
    let keys = Object.keys(getP)
    keys.forEach(key => {
      fullUrl = fullUrl.concat(`${key}=${getP[key]}&`)
    })
    fullUrl = fullUrl.substring(0, fullUrl.length - 1)
    console.log('fullUrl', fullUrl)
    console.log('getP', getP)
    console.log('postP', postP)
    const response = await ctx.curl(fullUrl, {
      keepAlive: true,
      // 空闲的 KeepAlive socket 最长可以存活 4 秒
      freeSocketTimeout: 4000,
      // 当 socket 超过 30 秒都没有任何活动，就会被当作超时处理掉
      timeout: 30000,
      // 必须指定 method
      method: 'POST',
      // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
      contentType: 'json',
      // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
      dataType: 'json',
      data: postP,
      // cookie: cookies,
      // beforeRequest: options => {
      //   // 例如我们可以设置全局请求 id，方便日志跟踪
      //   options.headers['Cookie'] = cookies
      //   options.headers['User-Agent'] = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)'
      //   options.headers['Origin'] = 'https://wx2.qq.com'
      //   options.headers['Host'] = 'wx2.qq.com'
      //   options.headers['Referer'] = 'https://wx2.qq.com/?&lang=zh_CN'
      //   options.headers['Content-Type'] = 'application/json;charset=UTF-8'
      //   options.headers['Accept'] = 'application/json, text/plain, */*'
      //   // console.log(options)
      // },
    })
    return response
  }

  async startStatusNotify() {
    const ctx = this.ctx
    const query = ctx.request.body
    console.log(query)
    const { passTicket, wxuin, wxsid, skey, deviceId, cookies, userName } = query
    let url = 'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxstatusnotify'
    const getP = {
      pass_ticket: passTicket,
      // r: '-1765460762',
      lang: 'zh_CN'
    }
    const postP = {
      BaseRequest: {
        Uin: wxuin,
        Sid: wxsid,
        Skey: skey,
        DeviceID: deviceId,
      },
      ClientMsgId: new Date().getTime(),
      Code: 3,
      FromUserName: userName,
      ToUserName: userName,
    }
    // console.log('startStatusNotify postP', postP)
    const resp = await this._postRequest(url, getP, postP, cookies)
    console.log(resp)
    this.ctx.body = resp
  }
}

module.exports = HomeController;
