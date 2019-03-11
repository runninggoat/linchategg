module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/getuuid/', controller.home.getUuid)
  router.get('/waitforscan/', controller.home.waitForScan)
  router.get('/getpassticket/', controller.home.getPassTicket)
  router.post('/wxinit/', controller.home.wxinit)
  router.post('/startstatusnotify/', controller.home.startStatusNotify)
};
