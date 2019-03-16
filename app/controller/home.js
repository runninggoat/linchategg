const Controller = require('egg').Controller

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'Hello world';
  }

  async _getRequest(url, params, cookies = '', accept='application/json, text/plain, */*') {
    const ctx = this.ctx
    let fullUrl = url
    let keys = Object.keys(params)
    if (keys.length > 0) {
      fullUrl = fullUrl + '?'
    }
    keys.forEach(key => {
      fullUrl = fullUrl.concat(`${key}=${params[key]}&`)
    })
    if (keys.length > 0) {
      fullUrl = fullUrl.substring(0, fullUrl.length - 1)
    }
    console.log('fullUrl', fullUrl)
    const response = await ctx.curl(fullUrl, {
      keepAlive: true,
      // 空闲的 KeepAlive socket 最长可以存活 4 秒
      freeSocketTimeout: 4000,
      // 当 socket 超过 30 秒都没有任何活动，就会被当作超时处理掉
      timeout: 30000,
      beforeRequest: options => {
        // 例如我们可以设置全局请求 id，方便日志跟踪
        options.headers['Cookie'] = cookies
        options.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
        options.headers['Origin'] = 'https://wx2.qq.com'
        options.headers['Host'] = 'wx2.qq.com'
        options.headers['Referer'] = 'https://wx2.qq.com/?&lang=zh_CN'
        // options.headers['Content-Type'] = 'application/json;charset=UTF-8'
        options.headers['Accept'] = accept
        // console.log(options)
      },
    })
    return response
  }

  async _postRequest(url, getP = {}, postP = {}, cookies = '', accept='application/json, text/plain, */*') {
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
      beforeRequest: options => {
        // 例如我们可以设置全局请求 id，方便日志跟踪
        options.headers['Cookie'] = cookies
        options.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
        options.headers['Origin'] = 'https://wx2.qq.com'
        options.headers['Host'] = 'wx2.qq.com'
        options.headers['Referer'] = 'https://wx2.qq.com/?&lang=zh_CN'
        options.headers['Content-Type'] = 'application/json;charset=UTF-8'
        options.headers['Accept'] = accept
        // console.log(options)
      },
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
    const { uuid, tip } = ctx.request.body
    console.log('waitForLogin...', uuid)
    let url = 'https://login.wx2.qq.com/cgi-bin/mmwebwx-bin/login'
    const seq = new Date().getTime()
    let params = {
      loginicon: 'true',
      uuid,
      tip,
      _: seq,
    }
    const resp = await this._getRequest(url, params)
    resp.seq = seq
    const serializedResp = JSON.stringify(resp)
    this.ctx.body = serializedResp
  }

  async getPassTicket() {
    const ctx = this.ctx
    const query = ctx.request.body
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
    console.log('wxinit', query)
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

  async startStatusNotify() {
    const ctx = this.ctx
    const query = ctx.request.body
    console.log('startStatusNotify', query)
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
    // console.log(resp)
    this.ctx.body = resp
  }

  async wxGetIcon() {
    const query = this.ctx.request.body
    console.log('wxGetIcon', query)
    const { path, accept, cookies } = query
    let url = `https://wx2.qq.com${path}`
    const resp = await this._getRequest(url, {}, cookies, accept)
    const toBase64 = resp.data.toString('base64')
    // console.log('wxGetIcon', toBase64)
    resp.icon = 'data:image/png;base64,' + toBase64
    const serializedResp = JSON.stringify(resp)
    this.ctx.body = serializedResp
  }

  async syncCheck() {
    const query = this.ctx.request.body
    console.log('syncCheck', query)
    const { skey, sid, uin, deviceId, synckey, cookies } = query
    let url = 'https://webpush.wx2.qq.com/cgi-bin/mmwebwx-bin/synccheck'
    const getP = {
      skey, sid, uin, synckey,
      deviceid: deviceId,
      r: new Date().getTime(),
      _: new Date().getTime(),
    }
    const resp = await this._getRequest(url, getP, cookies)
    const msg = resp.data.toString()
    console.log('syncCheck', msg)
    resp.msg = msg
    const serializedResp = JSON.stringify(resp)
    this.ctx.body = serializedResp
  }

  async wxSyncMsg() {
    const query = this.ctx.request.body
    console.log('wxSyncMsg', query)
    const { skey, sid, uin, deviceId, passTicket, synckey, cookies } = query
    let url = 'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxsync'
    const getP = {
      sid,
      skey,
      pass_ticket: passTicket,
    }
    const postP = {
      BaseRequest: {
        Uin: uin,
        Sid: sid,
        Skey: skey,
        DeviceID: deviceId,
      },
      SyncKey: synckey,
      rr: `-${new Date().getTime()}`,
    }
    const resp = await this._postRequest(url, getP, postP, cookies)
    console.log('wxSyncMsg', resp)
    this.ctx.body = resp
  }
}

module.exports = HomeController;
