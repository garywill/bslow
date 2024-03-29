var global_enabled = false; 

var list_w_disable = []; // window off list
var list_h_disable = []; // tab and sub tabs off list
var list_t_disable = []; // tab off list


var listeners = [];

browser.runtime.onMessage.addListener(async (message, sender) => {
    console.log("background receive message");
    // console.log("message:", message);
    // console.log("sender:", sender);
    
    if (message.action === 're-globalEnable-if-is-enabled') 
    {
        //console.log("received message re-globalEnable-if-is-enabled");
        if ( isGlobalEnabled() )
        {
            unsetGlobalEnable();
            setGlobalEnable();
        }
    }
    else if (message.action == 'add_me_to_list_t_disable')
    {
        const tabId = sender.tab.id;
        setTab_t(tabId);
    }
});

var NOTITLE=null ;

/* blue icon: normal
* gray icon or red badge "off": globally off
* red badge "woff" : off on this window 
* red badge "TN" : off on this tab and sub tabs
* red badge "T" : off on this tab
*/
function updateGlobalIcon(){
    if (!global_enabled) //globally disabled
    {
        browser.browserAction.setBadgeText({ text: "Off" });
        browser.browserAction.setBadgeBackgroundColor({ color: "#e9ec3d" }); 
        browser.browserAction.setTitle({title: default_title + " (Globally disabled)"});
        browser.browserAction.setIcon( { path: "icon_gray.png" } );
    }
    else{  // globally enabled
        browser.browserAction.setBadgeText({ text: null });
        browser.browserAction.setBadgeBackgroundColor({ color: "#00BF00" });
        browser.browserAction.setTitle({title: NOTITLE});
        browser.browserAction.setIcon( { path: "icon.png" } );
    }
}
function isGlobalEnabled(){
    return global_enabled;
}
async function setGlobalEnable(){

    if ( global_enabled == true ) 
        return;
    
    var onBeforeRequest_listener_options; 
    onBeforeRequest_listener_options = ["blocking"];
    
    
    
    
    
    listeners.push([browser.webRequest.onBeforeRequest, onBeforeRequest]);
    browser.webRequest.onBeforeRequest.addListener(
        onBeforeRequest,
        {
            urls: [
                "*://*.bilibili.com/*", 
                "*://*.hdslb.com/*", 
                "*://*.biliapi.net/*", 
                // "*://*.bilivideo.com/*",  // 不干涉视频的加载
                // "*://*.bilivideo.cn/*", 
            ] , 
        },
        // {urls: ["<all_urls>", "*://*/*", "ws://*/*", "wss://*/*", ]},
        onBeforeRequest_listener_options 
    ); 
    
    
    listeners.push([browser.webNavigation.onCommitted, onCommitted]);
    browser.webNavigation.onCommitted.addListener(
        onCommitted, 
        {
            url: [
                {
                    urlPrefix: "https://www.bilibili.com/video/", 
                } 
            ], 
        }
    );
    
    
    global_enabled = true;
    updateGlobalIcon();
}
function unsetGlobalEnable(){
    while( listeners[0] !== undefined )
    {
        L = listeners[0];
        L[0].removeListener(L[1]);
        listeners.shift();
    }
    
    global_enabled = false;
    updateGlobalIcon();
}
function toggle_global_enabled()
{   
    if( isGlobalEnabled() ) {
        unsetGlobalEnable();
    }else{
        setGlobalEnable();
    }
}
//------------------------------------------
function isWindowDisabled(wid){
    if (list_w_disable.includes(wid)) 
        return true;
    
    return false;
}
function setWindowDisabled(wid){
    if (isWindowDisabled(wid)) 
        return;
    list_w_disable.push(wid);
    update_windowBadge(wid);
}
function unsetWindowDisabled(wid){
    if ( ! isWindowDisabled(wid)) 
        return;
    list_w_disable.splice( list_w_disable.indexOf(wid) ,1);
    update_windowBadge(wid);
}
function toggle_window_disabled(wid)
{
    if ( isWindowDisabled(wid) ) {
        unsetWindowDisabled(wid);
        return true; 
    }else{
        setWindowDisabled(wid);
        return false;
    }
} 
function update_windowBadge(wid){
    if ( isWindowDisabled(wid) ){
        browser.browserAction.setTitle({title: default_title + " (Disabled in this window)", windowId: wid });
        browser.browserAction.setBadgeText({ text: "woff" , windowId: wid});
        browser.browserAction.setBadgeBackgroundColor({ color: "#f0ff4f" , windowId: wid}); 
    }else{
        browser.browserAction.setTitle({title: NOTITLE, windowId: wid });
        browser.browserAction.setBadgeText({ text: null , windowId: wid});
        //browser.browserAction.setBadgeBackgroundColor({ color: "" , windowId: wid});
    }
}
//---------------------------------------------------
function isTabIn_list_t(tabid){
    if ( list_t_disable.includes(tabid) ) 
        return true;
    
    return false;
}
function isTabIn_list_h(tabid){
    if ( list_h_disable.includes(tabid) ) { 
        return true;
    }
    return false;
}
function unsetTab_t(tabid){
    if ( isTabIn_list_t(tabid) )
        list_t_disable.splice( list_t_disable.indexOf(tabid), 1 );
    update_tabBadge(tabid);
}
function unsetTab_h(tabid){
    if ( isTabIn_list_h(tabid) )
        list_h_disable.splice( list_h_disable.indexOf(tabid), 1 );
    update_tabBadge(tabid);
}
function setTab_t(tabid) {
    unsetTab_h(tabid);
    if ( isTabIn_list_t(tabid) ) 
        return;
    list_t_disable.push(tabid);
    update_tabBadge(tabid);
    
    sendTMessageToTab(tabid);
}
function setTab_h(tabid) {
    unsetTab_t(tabid);
    if (isTabIn_list_h(tabid) )
        return;
    list_h_disable.push(tabid);
    update_tabBadge(tabid);
    
    sendTMessageToTab(tabid);
}
function normalizeTab(tabid){
    unsetTab_t(tabid);
    unsetTab_h(tabid);
    
}
function toggleTab_t(tabid){
    if (isTabIn_list_t(tabid) ) 
        unsetTab_t(tabid);
    else
        setTab_t(tabid);
}
function toggleTab_h(tabid){
    if (isTabIn_list_h(tabid) ) {
        unsetTab_h(tabid);
    }else{
        setTab_h(tabid);
    }
}
async function update_tabBadge(tabid){
    try{ 
        if (isTabIn_list_h(tabid)){
            await browser.browserAction.setTitle({title: default_title + " (Disabled on this tab and its sub new tabs)", tabId: tabid });
            await browser.browserAction.setBadgeText({ text: "TN" , tabId: tabid});
            //await browser.browserAction.setBadgeBackgroundColor({ color: "#fbff00" , tabId: tabid}); // yellow
            await browser.browserAction.setBadgeBackgroundColor({ color: "#fdff7d" , tabId: tabid}); 
        }else if( isTabIn_list_t(tabid) ){
            await browser.browserAction.setTitle({title: default_title + " (Disabled on this tab)", tabId: tabid });
            await browser.browserAction.setBadgeText({ text: "T" , tabId: tabid});
            //await browser.browserAction.setBadgeBackgroundColor({ color: "#ffea00" , tabId: tabid}); // orange
            await browser.browserAction.setBadgeBackgroundColor({ color: "#fffb89" , tabId: tabid}); 
        }else{
            await browser.browserAction.setTitle({title: NOTITLE, tabId: tabid });
            //await browser.browserAction.setBadgeTextColor({color: "", tabId: tabid });
            await browser.browserAction.setBadgeText({ text: null , tabId: tabid});
            //await browser.browserAction.setBadgeBackgroundColor({ color: "" , tabId: tabid});
        }
    } catch(err){ 
        if ( ! err.message.startsWith("Invalid tab ID:") )
            console.error(err);
    }
}
browser.tabs.onUpdated.addListener( (tabid) => {
    update_tabBadge(tabid);
});

browser.tabs.onRemoved.addListener( (tabid, removeInfo) => {
    const wid = removeInfo.windowId;
    normalizeTab(tabid);
});
browser.windows.onRemoved.addListener((wid) => {
    unsetWindowDisabled(wid);
});
browser.browserAction.onClicked.addListener((tab) => {
    const tabid = tab.id;
    const wid = tab.windowId;
    
    if ( ! isTabIn_list_h(tabid) && ! isTabIn_list_t(tabid) )
    {
        setTab_t(tabid);
    }else if ( isTabIn_list_t(tabid) ) 
    {
        setTab_h(tabid);
    }else if ( isTabIn_list_h(tabid) )
    {
        normalizeTab(tabid);
    }
    
});
browser.tabs.onCreated.addListener( (tab) => {
    if ( isTabIn_list_h(tab.openerTabId) ) {
        setTab_h(tab.id);
    }
});

async function is_off(details, tabid, tab, wid, changeInfo){
    if ( ! global_enabled ) 
        return true;
    
    if (typeof(details) == "object" )
    {
        tabid = details.tabId;
    }
    
    if (typeof(tab) == "object")
    {
        tabid = tab.id;
        wid = tab.windowId;
    }
    
    if ( tabid < 0 ) 
        return true;
    if (isTabIn_list_h(tabid) || isTabIn_list_t(tabid) ) 
        return true;
    
    if ( wid === undefined )
        try{ 
            wid = (await browser.tabs.get(tabid)).windowId;
        } catch(err){ 
            if ( ! err.message.startsWith("Invalid tab ID:") )   
                console.error(err);
            return true;
        }
    
    if( isWindowDisabled( wid ) ) 
        return true;

}


function sendTMessageToTab(tabid)
{
    browser.tabs.sendMessage(tabid, {  // 不要用await，因为可能发不出 
        action: 'clearEvtsAndTimers', 
    }); 
}


async function onCommitted(details)
{
    const tabid = details.tabId;
    const url = details.url;
    const frameId = details.frameId;
    
    if (frameId>0)
        return;
    
    console.log(`webNavigation onCommitted. tabId: ${tabid}`);
    unsetTab_t(tabid);
    
    if (url.includes('#reply'))
    { 
        console.log('url contains "#reply". tabId:', tabid)
        setTab_t(tabid);
        return;
    } 
    
    if ( !(await is_off(undefined, tabid) ) )
    {
        console.log("navigating to bilibili video page and is_off() returned false. Injecting...")
        browser.tabs.executeScript(tabid, {
            runAt: "document_start", 
            file: 'content.js', 
        });
    }
    
}

browser.commands.onCommand.addListener(async function (command) {
    switch (command) {
        case "toggle_global":
            toggle_global_enabled();
        break;
        case "toggle_t":
        case "toggle_h":
        case "toggle_window":
            const cur_tabInfo = (await browser.tabs.query({currentWindow: true, active: true}) ) [0];
            const tabid = cur_tabInfo.id;
            const wid = cur_tabInfo.windowId;
            
            if (command == "toggle_t") {
                toggleTab_t(tabid);
            }else if (command == "toggle_h") {
                toggleTab_h(tabid);
            }else if (command == "toggle_window") {
                toggle_window_disabled(wid);
            }
        break;
    }
});
