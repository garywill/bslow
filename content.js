 
console.debug('---- B slow content.js----')
init();

var timerId = null;
async function init()
{
    //console.debug(window.tabid);
    if ( ! window.has_executed )
    {
        console.debug("calling first_run()");
        await first_run();
        console.debug("finished first_run()");
        window.has_executed = true;
        //console.debug("first inject");
    }
    set_intervalTimer();
}

async function first_run()
{
    browser.runtime.onMessage.addListener( async function(message, sender) { 
        console.debug("content script received message");
        console.debug("message:", message);
        console.debug("sender:", sender);
        
        if (message.action == 'cancel_intervalTimer')
        {
            cancel_intervalTimer();
        }
    }); 
}

function cancel_intervalTimer()
{
    if ( timerId )
    {
        console.log('timerId:', timerId, '. Trying to clear it');
        clearInterval(timerId);
        timerId = null;
    }
}
async function set_intervalTimer()
{
    if ( timerId )
    {
        console.warn(`In set_intervalTimer(), timerId is not empty (${timerId}). Trying to cancel it`);
        cancel_intervalTimer();
        await sleep(10);
    }
    
    timerId = setInterval(onIntervalTimeReach, 1500);
    console.log('timerId = ', timerId);
    
    setTimeout(onLongTimeReach, 80*1000);
}
function onIntervalTimeReach() 
{
    const playerbox = document.querySelector("#playerWrap");
    const lineY = playerbox.offsetTop + playerbox.offsetHeight;
    if ( window.scrollY > lineY )
    {
        console.log("B slow see Y scroll cross line");
        onShouldTDisable();
    }
}

function onShouldTDisable()
{
    chrome.runtime.sendMessage({
        action: 'add_me_to_list_t_disable', 
    });
    cancel_intervalTimer();
}

function onLongTimeReach()
{
    console.log("long time reached, clear interval timer");
    cancel_intervalTimer();
    onShouldTDisable();
}

async function sleep(ms) {
    return await (new Promise(resolve => setTimeout(resolve, ms)) ) ;
}