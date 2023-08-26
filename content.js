 
console.debug('---- B slow content.js----')
init();

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
    
    
}

async function first_run()
{
    browser.runtime.onMessage.addListener( async function(message, sender) { 
        console.debug("content script received message");
        // console.debug("message:", message);
        // console.debug("sender:", sender);
        
        if (message.action == 'clearEvtsAndTimers')
        {
            clearEvtsAndTimers();
        }
    }); 
    
    setEvtsAndTimers();
}

var timerId = null;
async function setEvtsAndTimers()
{
    window.addEventListener('scroll', onWindowScrollEvt);
    
    timerId = setTimeout(onLongTimeReach, 80*1000);
    
    document.addEventListener("keydown", onKeyDown);
    
    for (var i=0; i<10; i++)
    {
        await sleep(2000);
        try{
            document.querySelector('.video-title').addEventListener('click', onVideoTitleClick);       
            console.log("successfully added videotitle ele click event");
            break;
        }catch(err) { }
    }
}
function clearEvtsAndTimers()
{
    window.removeEventListener('scroll', onWindowScrollEvt);
    
    clearTimeout(timerId);
    timerId = null;
    
    
    document.removeEventListener("keydown", onKeyDown);
    
    try{
        document.querySelector('.video-title').removeEventListener('click', onVideoTitleClick);
    }catch(err) { } 
}

function onKeyDown(evt)
{
    if (evt.key.toUpperCase() == 'Z' && !evt.ctrlKey && !evt.altKey && !evt.metaKey && !evt.shiftKey)
    {
        console.log('let go key down.')
        onShouldTDisable();
    }
}

function onVideoTitleClick(evt)
{
    onShouldTDisable();
}


function onWindowScrollEvt(evt) {
    if ( judgeScroll() ) {
        console.log("B slow see Y scroll cross line");
        onShouldTDisable();
    }
}
function judgeScroll() 
{
    const playerbox = document.querySelector("#playerWrap");
    const lineY = playerbox.offsetTop + playerbox.offsetHeight;
    
    if ( window.scrollY > lineY )
        return true;
    else 
        return false;
}




function onLongTimeReach()
{
    console.log("long time reached, clear interval timer");
    onShouldTDisable();
}






function onShouldTDisable()
{
    chrome.runtime.sendMessage({
        action: 'add_me_to_list_t_disable', 
    });
    clearEvtsAndTimers();
}




async function sleep(ms) {
    return await (new Promise(resolve => setTimeout(resolve, ms)) ) ;
}