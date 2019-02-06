import TabsStorage from "./storage.js";
const storage = new TabsStorage();

// cache interactive DOM elemetns
const appContainer = document.getElementById("tab-app");
const buttonClearAll = document.getElementById("clear-all");
const buttonClearCompleted = document.getElementById("clear-completed");

// clear all items from chrome storage
// and render the page again
const clearAll = () => {
    storage.clearAll();
};

// clear completed items from chrome
// storage and render the page again
const clearCompleted = e => {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    Array.from(document.getElementsByTagName("input")).forEach(checkbox => {
        if (checkbox.checked) {
            const id = checkbox.dataset.id;
            const item = storage.get(id);
            item.completed = true;
            storage.set(item);
        }
    });
};

// write app html to page
const render = () => {
    storage.getAll().then(items => {
        if (items.length) {
            // find all the items that are not completed and
            // generate an html code for each item
            const itemsTemplate = items
                .filter(item => item.completed === false)
                .map(item => {
                    return `
                    <li>
                        <input
                            type="checkbox"
                            data-id="${item.id}" />
                        <img
                            src="${item.image}"
                            alt="${item.title}" />
                        <a
                            href="${item.url}"
                            target="_blank"
                            title="${item.title}">
                            ${item.title}
                        </a>
                    </li>`;
                });

            // write HTML template to page
            appContainer.innerHTML = `
                <ul>
                    ${itemsTemplate.join("\n\t")}
                </ul>
            `;
        } else {
            appContainer.innerHTML = `<h3>All clear! 🙌</h3>`;
        }
    });
};

// event listeners
document.addEventListener("DOMContentLoaded", render);
buttonClearAll.addEventListener("click", clearAll);
buttonClearCompleted.addEventListener("click", clearCompleted);

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(changes, namespace);
    render();
});
