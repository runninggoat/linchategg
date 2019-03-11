exports.keys = 'secret'
exports.security = {
  xframe: {
    enable: false,
  },
  csrf: {
    headerName: 'x-csrf-token', // 通过 header 传递 CSRF token 的默认字段为 x-csrf-token
  },
};
