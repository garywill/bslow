# B Slow

上B站 (Bilibili) web看视频太卡，每次打开一个 B 站视频，电脑风扇开始转，小浏览器受不了。让它轻一点卡。

- [Firefox on AMO](https://addons.mozilla.org/firefox/addon/b-slow/)
  
  只需要[轻轻访问一下我的B站频道（一般发技术等内容）](https://space.bilibili.com/2123686105)就可以免费安装使用啦，如果关注就更好了～

### 原理

脚本错峰执行，而播放功能不受影响。

在 webrequestBlocking 里加`await sleep()`，让非核心视频功能资源经过 N 秒的随机延时后再加载，**错峰出行**。而播放功能不受影响。

**不对网站内容和功能做任何修改、添加、删除**。

### 用户可决定临时停用

需要对视频点赞收藏留言时  
是可以临时禁用的，可使用以下其中一种方式临时禁用:  

1. 点视频上方标题  
2. 点一下工具栏上的按钮  
3. 往下滚动页面到留言  
4. 页面打开后的80s自然触发临时禁用

### 待改进

1. 发现在 webrequestBlocking 里，纯await sleep()的时候也要占用少量的 cpu 

2. B 站的网页全屏功能要等全部资源加载后才能用（全屏幕倒是可以正常用）。搞不清网页全屏是在哪个.js 里（好像他们全打成bundle了没法分了）

### 对浏览器的支持

仅Firefox。可惜 Chrome 无法使用。Chrome 的 webqurestBlocking 竟然不支持 async 。而且以后 mv3 更没希望了
