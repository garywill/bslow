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


async function onBeforeSendHeaders(details)
{
    // console.debug("onBeforeSendHeaders()", details.tabId, details.type , details.url);
    
    if ( await is_off(details) ) 
        return;
    
    const resourceType = details.type;
    if ( [
            'main_frame', 'stylesheet', 
            'xmlhttprequest', 
            'image', 
            'media', 
        ].includes(resourceType) 
    )
        return;
    
    
    
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
            filename.includes('core') 
            || filename.includes('npd') 
        )
    ) 
        return;
        
    if (['png','avif', 'svg', 'webp'].includes(sfx) )
        return;
    
    // return {cancel :true}
        
    var sleep_t=getRandomTime(14, 22);
    // console.debug(`wait ${sleep_t}ms  ${targetHost}\t ${filename}`)
    await sleep(sleep_t);
    // console.debug(`now  ${sleep_t}ms  ${targetHost}\t ${filename}`)
        

}


//===================================================
function getRandomTime(min, max) { 
    min = min*1000;
    max = max*1000;
    return Math.floor ( Math.random() * (max-min+1)  + min ) ;
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



