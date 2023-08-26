const addon_name = "B Slow";
const default_title = addon_name;

setGlobalEnable();
//----------------------------------------------------------


/* 
* webRequest details:
* Firefox:
*      top-frame html request:
*              originUrl: the url which user was visiting before this navigation
*              documentUrl: undefined
*      in-page link request from in main-frame: 
*              originUrl = documentUrl
*      in-page link request from in iframe: 
*              originUrl: iframe's src 
*              documentUrl: parent frame's url
* Chrome: initiator (can be string 'null')
*/

async function onBeforeRequest(details)
{
    // console.debug("onBeforeRequest()", details.tabId, details.type , details.url);
    
    if ( await is_off(details) ) 
        return;
    
    const resourceType = details.type;
    if ( [                   // 以下不干涉：
            'main_frame',    // 主体html页面
            'stylesheet',    // css
            'xmlhttprequest',   // api和估计是上报检测用的一些
            'image',    //  图片
            'media',    //  任意媒体
        ].includes(resourceType) 
    )
        return;
    
    
    // ------  开始整理基本url对象 --
    const targetUrl = details.url;
    const targetUrlObj = new URL(targetUrl);
    const targetHost = targetUrlObj.hostname;  // host:带端口 hostname:不带端口
    var documentUrl = "";
    var documentUrlObj = null;
    var documentHost = "";
    var originUrl = ""
    var originUrlObj = null;
    var originHost = ""
    
    
    if (details.documentUrl) {
        documentUrl = details.documentUrl ;
        documentUrlObj = new URL(documentUrl);
        documentHost = documentUrlObj.hostname;
    }
    
    if (isFirefox)
        originUrl = details.originUrl ;
    else
        originUrl = details.initiator ;
    
    if (originUrl) {
        originUrlObj = new URL(originUrl);
        originHost = originUrlObj.hostname;
    }
    //  -------- 整理基本url对象完成----
    
    // console.debug("here 33");
    
    // 如果不是B站
    if ( ! ( originHost.endsWith('.bilibili.com') || originHost.endsWith('.hdslb.com') ) )
        return;
    
    // 在加addlistner时过虑 bilivideo 
    // if ( targetHost.includes('bilivideo.')  )
    //     return;
    
    // console.debug("here 44");
    
    // 如果不是视频播放页面
    if (originUrlObj.pathname.split('/')[1] != 'video') 
        return;
    
    var targetPathArr = targetUrlObj.pathname.split('/') ;
    var filename_n_query = targetPathArr[ targetPathArr.length-1 ];
    var filename = filename_n_query.split('?')[0]

    // console.debug("here 55");
    if (filename=='web' )
        return;
    
    var filenameArr = filename.split('.');
    var sfx = filenameArr [filenameArr.length-1] ;
    
    
    // console.debug("here 66");
    if ( sfx == 'js' && 
        (
            filename.includes('core')      // core.xxx.js 是核心
            || filename.includes('npd')    // npd（或helper） xxxx.js 是与播放进度控制有关
        )
    ) 
        return;
        
    if (['png','avif', 'svg', 'webp'].includes(sfx) )  // 图片 图形 图标的具体资源（有些是由js控制加载的，因此也在对应js之后才出现）
        return;
    
    // return {cancel :true}
    
    
    // 以上应该已经排除完毕。准备延时
    var sleep_t=getRandomTime(14, 22);
    // console.debug(`wait ${sleep_t}ms  ${targetHost}\t ${filename}`)
    var pastT = 0;
    while(pastT < sleep_t)
    {
        if (await is_off(details)) // 如果中途用户禁用
        {
            // console.debug("middle way break");
            await sleep( genRandomNum(300, 1200) );
            break;
        }
        var segT = Math.min( genRandomNum(1400, 2700) , sleep_t - pastT  );
        await sleep(segT);
        pastT += segT;
    }
    // console.debug(`now  ${sleep_t}ms  ${targetHost}\t ${filename}`)
        

}


//===================================================
function genRandomNum(min, max) {
    return Math.floor ( Math.random() * (max-min+1)  + min ) ;
}
function getRandomTime(min, max) { 
    min = min*1000;
    max = max*1000;
    return genRandomNum(min, max);
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



