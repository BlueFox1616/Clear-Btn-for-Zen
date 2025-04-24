(() => {
    // Function to check tabs and update opacity of the Clear button
    const checkTabsAndUpdateOpacity = () => {
        try {
            const currentWorkspaceId = window.ZenWorkspaces?.activeWorkspace;
            if (!currentWorkspaceId) return;

            const groupSelector = `tab-group:has(tab[zen-workspace-id="${currentWorkspaceId}"])`;
            const tabsToClose = [];
            let anyTabMatches = false; // Flag to check if any tab matches the criteria
            
            for (const tab of gBrowser.tabs) {
                const isSameWorkSpace = tab.getAttribute('zen-workspace-id') === currentWorkspaceId;
                const groupParent = tab.closest('tab-group');
                const isInGroupInCorrectWorkspace = groupParent ? groupParent.matches(groupSelector) : false;
                const isEmptyZenTab = tab.hasAttribute("zen-empty-tab");
                
                if (isSameWorkSpace && !tab.selected && !tab.pinned && !isInGroupInCorrectWorkspace && !isEmptyZenTab && tab.isConnected) {
                    tabsToClose.push(tab);
                    anyTabMatches = true; // A tab matches the criteria
                }
            }

            // Get the Clear button and update its opacity
            const clearButton = document.querySelector('.vertical-pinned-tabs-container-separator .clear-tabs-button');
            const container = document.querySelector('.vertical-pinned-tabs-container-separator');
            if (clearButton && container) {
                // Update the opacity of the button
                clearButton.style.opacity = anyTabMatches ? '1' : '0'; // Set opacity to 1 if tabs to close are found, else 0.5
                
                // Update container width based on visibility of the button
                if (anyTabMatches) {
                    container.style.width = '66%';  // Default width when button is visible
                } else {
                    container.style.width = '98%';  // Increased width when button is not visible
                }
            }

        } catch (error) {
            console.log(error);
        }
    };

    // Function to clear the tabs when the "Clear" button is clicked
    const clearTabs = () => {
        try {
            const currentWorkspaceId = window.ZenWorkspaces?.activeWorkspace;
            if (!currentWorkspaceId) return;

            const groupSelector = `tab-group:has(tab[zen-workspace-id="${currentWorkspaceId}"])`;
            const tabsToClose = [];
            
            for (const tab of gBrowser.tabs) {
                const isSameWorkSpace = tab.getAttribute('zen-workspace-id') === currentWorkspaceId;
                const groupParent = tab.closest('tab-group');
                const isInGroupInCorrectWorkspace = groupParent ? groupParent.matches(groupSelector) : false;
                const isEmptyZenTab = tab.hasAttribute("zen-empty-tab");
                
                if (isSameWorkSpace && !tab.selected && !tab.pinned && !isInGroupInCorrectWorkspace && !isEmptyZenTab && tab.isConnected) {
                    tabsToClose.push(tab);
                }
            }

            if (tabsToClose.length === 0) return;

            tabsToClose.forEach(tab => {
                tab.classList.add('tab-closing');
                setTimeout(() => {
                    if (tab && tab.isConnected) {
                        try {
                            gBrowser.removeTab(tab, { animate: true, skipSessionStore: false, closeWindowWithLastTab: false });
                        } catch (removeError) {
                             if (tab && tab.isConnected) {
                               tab.classList.remove('tab-closing');
                            }
                        }
                    }
                }, 500);
            });
        } catch (error) {
            console.log(error);
        }
    };

    // Function to add the "Clear" button to the DOM
    const addClearButton = () => {
        const container = document.querySelector('.vertical-pinned-tabs-container-separator');
        if (container) {
            // Prevent duplicates
            if (!container.querySelector('.clear-tabs-button')) {
                const btn = document.createElement('span');
                btn.textContent = "↓ Clear";
                btn.className = 'clear-tabs-button';
                
                // Styling the button with the same properties as the original pseudo-element
                btn.style.cssText = `
                    color: #c5c3c3;
                    padding-left: 8px;
                    font-size: 10px;
                    display: inline-block;
                    position: absolute;
                    right: 0;
                    font-weight: bold;
                    cursor: pointer;
                    user-select: none;
                    transition: font-size 0.3s ease, padding-left 0.3s ease, opacity 0.3s ease;

                `;

                // Hover state for button
                btn.addEventListener('mouseenter', () => {
                    btn.style.color = 'white';
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.color = '#c5c3c3';
                });

                // Active state for button
                btn.addEventListener('mousedown', () => {
                    btn.style.fontSize = '12px';
                });

                btn.addEventListener('mouseup', () => {
                    btn.style.fontSize = '10px';
                });

                // Click listener for clearing tabs
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    clearTabs();
                });

                container.appendChild(btn);
            }
        } else {
            console.warn("Couldn't find `.vertical-pinned-tabs-container-separator` element.");
        }
    };

    // Set an interval to check for tabs and update the opacity every second
    setInterval(checkTabsAndUpdateOpacity, 1000); // Check every 1 second

    // Add the Clear button initially
    addClearButton();
})();
