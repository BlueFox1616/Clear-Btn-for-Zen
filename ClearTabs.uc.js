(async () => {
  await ZenWorkspaces.promiseSectionsInitialized;

  const observer = new MutationObserver(() => {
    addClearButton();
  });

  const startObserving = () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  const checkTabsAndUpdateOpacity = () => {
    try {
      const currentWorkspaceId = window.ZenWorkspaces?.activeWorkspace;
      if (!currentWorkspaceId) return;

      const groupSelector = `tab-group:has(tab[zen-workspace-id="${currentWorkspaceId}"])`;
      const tabsToClose = [];

      for (const tab of gBrowser.tabs) {
        const isSameWorkSpace =
          tab.getAttribute("zen-workspace-id") === currentWorkspaceId;
        const groupParent = tab.closest("tab-group");
        const isInGroupInCorrectWorkspace = groupParent
          ? groupParent.matches(groupSelector)
          : false;
        const isEmptyZenTab = tab.hasAttribute("zen-empty-tab");

        if (
          isSameWorkSpace &&
          !tab.selected &&
          !tab.pinned &&
          !isInGroupInCorrectWorkspace &&
          !isEmptyZenTab &&
          tab.isConnected
        ) {
          tabsToClose.push(tab);
        }
      }

      const clearButtons = document.querySelectorAll(".clear-tabs-button");
      clearButtons.forEach((btn) => {
        const pinnedTabsSeparator = document.querySelector(
          ".browser-toolbox-background",
        );

        const checkVisibility = () => {
          if (tabsToClose.length > 0 && pinnedTabsSeparator.matches(":hover")) {
            btn.style.opacity = "1";
            btn.parentElement.style.width = "66%";
          } else {
            btn.style.opacity = "0";
            btn.parentElement.style.width = "98%";
          }
        };

        pinnedTabsSeparator.addEventListener("mouseenter", checkVisibility);
        pinnedTabsSeparator.addEventListener("mouseleave", checkVisibility);
        checkVisibility();
      });
    } catch (error) {
      console.error("Error updating tab visibility:", error);
    }
  };

  const clearTabs = () => {
    try {
      const currentWorkspaceId = window.ZenWorkspaces?.activeWorkspace;
      if (!currentWorkspaceId) return;

      const groupSelector = `tab-group:has(tab[zen-workspace-id="${currentWorkspaceId}"])`;
      const tabsToClose = [];

      for (const tab of gBrowser.tabs) {
        const isSameWorkSpace =
          tab.getAttribute("zen-workspace-id") === currentWorkspaceId;
        const groupParent = tab.closest("tab-group");
        const isInGroupInCorrectWorkspace = groupParent
          ? groupParent.matches(groupSelector)
          : false;
        const isEmptyZenTab = tab.hasAttribute("zen-empty-tab");

        if (
          isSameWorkSpace &&
          !tab.selected &&
          !tab.pinned &&
          !isInGroupInCorrectWorkspace &&
          !isEmptyZenTab &&
          tab.isConnected
        ) {
          tabsToClose.push(tab);
        }
      }

      if (tabsToClose.length === 0) return;

      tabsToClose.forEach((tab) => {
        tab.classList.add("tab-closing");
        setTimeout(() => {
          if (tab && tab.isConnected) {
            try {
              gBrowser.removeTab(tab, {
                animate: true,
                skipSessionStore: false,
                closeWindowWithLastTab: false,
              });
            } catch (removeError) {
              if (tab && tab.isConnected) {
                tab.classList.remove("tab-closing");
              }
            }
          }
        }, 500);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addClearButton = () => {
    const containers = document.querySelectorAll(
      ".vertical-pinned-tabs-container-separator",
    );
    containers.forEach((container) => {
      if (!container.querySelector(".clear-tabs-button")) {
        const btn = document.createElement("span");
        btn.className = "clear-tabs-button";

        const label = document.createElement("span");
        label.textContent = "Clear";
        label.style.marginRight = "4px";

        const arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = "↓";

        btn.appendChild(label);
        btn.appendChild(arrow);

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
          -moz-window-dragging: no-drag;
          opacity: 0;
          transition: font-size 0.3s ease, padding-left 0.3s ease, opacity 0.3s ease;
        `;

        arrow.style.transition = "transform 0.3s ease";

        btn.addEventListener("mouseenter", () => {
          btn.style.color = "white";
        });

        btn.addEventListener("mouseleave", () => {
          btn.style.color = "#c5c3c3";
        });

        btn.addEventListener("mousedown", () => {
          btn.style.fontSize = "12px";
        });

        btn.addEventListener("mouseup", () => {
          btn.style.fontSize = "10px";
        });

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          arrow.style.transform = "translateY(6px)";

          clearTabs();

          setTimeout(() => {
            arrow.style.transform = "translateY(0)";
          }, 300);
        });

        container.appendChild(btn);
      }
    });
  };

  setInterval(checkTabsAndUpdateOpacity, 1000);
  addClearButton();
  startObserving();
})();

