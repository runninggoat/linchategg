module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/getuuid/', controller.home.getUuid)
  router.post('/waitforscan/', controller.home.waitForScan)
  router.post('/getpassticket/', controller.home.getPassTicket)
  router.post('/wxinit/', controller.home.wxinit)
  router.post('/startstatusnotify/', controller.home.startStatusNotify)
  router.post('/wxgeticon/', controller.home.wxGetIcon)
  router.post('/synccheck/', controller.home.syncCheck)
  router.post('/wxsyncmsg/', controller.home.wxSyncMsg)
};
