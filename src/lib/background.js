import TabsStorage from "./storage.js";

const storage = new TabsStorage();

// generate markdown template to return
// to the user
const generateTodoTemplate = () => {
    return storage.getAll().then(items => {
        const template = [
            "### To-Do",
            "",
            ...items.map(
                item =>
                    `- [${item.completed ? "x" : " "}] [${item.title}](${
                        item.url
                    })`
            )
        ].join("\n");
        console.log(template);
    });
};

// generic callback for testing purposes
const saveAction = () => {
    chrome.tabs.query({}, tabs => {
        const { id } = chrome.app.getDetails();
        const todos = tabs
            .filter(tab => tab.incognito === false && !!tab.url.match(/^(http|https)/))
            .map(tab => {
                const { favIconUrl, title, url } = tab;
                return {
                    id: btoa(url),
                    title,
                    url,
                    image:
                        favIconUrl !== ""
                            ? favIconUrl
                            : `chrome-extension://${id}/icons/icon16.png`,
                    completed: false
                };
            });

        if (todos.length) {
            todos.forEach(item => {
                storage.set(item);
            });
        }

        const template = generateTodoTemplate();
        console.log(template);
    });
};

const saveAndCloseAction = () => {
    // save current tabs
    saveAction();

    // close non-active tabs
    chrome.tabs.query({}, tabs => {
        const nonActiveTabs = tabs
            .filter(tab => tab.active === false)
            .map(tab => tab.id);
        chrome.tabs.remove(nonActiveTabs, () => {
            return generateTodoTemplate();
        });
    });
};

// main parent menu item to store all available
// context menu options for extension
const parent = chrome.contextMenus.create({
    title: "Tab You Later",
    contexts: ["page"]
});

const menus = [
    {
        title: "Save tabs",
        onclick: saveAction,
        parentId: parent
    },
    {
        title: "Save and close tabs",
        onclick: saveAndCloseAction,
        parentId: parent
    }
];

// loop through menus array and create context
// menus for each item in the array
menus.forEach(item => chrome.contextMenus.create(item));
