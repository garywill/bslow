var str_switch;
var type_switch;
if (isFirefox) {
    str_switch = "Disable";
    type_switch = "checkbox";
} else if (isChrome) {
    str_switch = "Switch enable/disable"
    type_switch = "normal";
}
browser.contextMenus.create({
    contexts: ["browser_action"],
    id: "checkbox_t_disable",
    type: type_switch,
    title: `${str_switch} ${addon_name} on this tab temporarily`
});
browser.contextMenus.create({
    contexts: ["browser_action"],
    id: "checkbox_h_disable",
    type: type_switch,
    title: `${str_switch} ${addon_name} on this tab and new tabs opened by this tab`
});
browser.contextMenus.create({
    contexts: ["browser_action"],
    type: "separator",
});
if (isFirefox) {
    browser.contextMenus.create({
        contexts: ["browser_action"],
        id: "checkbox_w_disable",
        type: type_switch,
        title: `${str_switch} ${addon_name} in this window`
    });
}
browser.contextMenus.create({
    contexts: ["browser_action"],
    id: "checkbox_global_disable",
    type: type_switch,
    title: `${str_switch} ${addon_name} globally`
});

if (isFirefox) {
    browser.contextMenus.onShown.addListener(updateMenuCheckboxes);
} else if (isChrome) {
    
}
async function updateMenuCheckboxes(info, tab) {
    const tabid = tab.id;
    const wid = tab.windowId;
    
    browser.contextMenus.update("checkbox_global_disable", {checked: ! isGlobalEnabled() });
    browser.contextMenus.update("checkbox_w_disable", {checked: isWindowDisabled(wid) });
    browser.contextMenus.update("checkbox_t_disable", {checked: isTabIn_list_t(tabid) });
    browser.contextMenus.update("checkbox_h_disable", {checked: isTabIn_list_h(tabid) });

    // Note: Not waiting for returned promise.
    browser.contextMenus.refresh();
}
    
browser.contextMenus.onClicked.addListener((info, tab) => {
    const tabid = tab.id;
    const wid = tab.windowId;
    const checked = info.checked;
    const menuItemId = info.menuItemId;

    switch ( menuItemId ){
        case "checkbox_global_disable":
            toggle_global_enabled();
        break;
        case "checkbox_w_disable":
            toggle_window_disabled(wid);
        break;
        case "checkbox_t_disable":
            toggleTab_t(tabid);
        break;
        case "checkbox_h_disable":
            toggleTab_h(tabid);
        break;
    }
});
