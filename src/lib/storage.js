/**
 * Tabs Storage
 * @author Rocco Augusto
 */
export default class TabsStorage {
    constructor() {
        this.data = [];

        // get all records and save
        this.getAll().then(items => {
            this.data = items;
            chrome.browserAction.setBadgeText({
                text: String(items.length || "")
            });
            chrome.browserAction.setBadgeBackgroundColor({ color: "#4688F1" });
        });

        // update extension badge so user can see length
        // of to-do list at a glance without opening up
        // the pop-up window
        chrome.storage.onChanged.addListener(changes => {
            const { newValue } = changes["tabs-storage"];
            chrome.browserAction.setBadgeText({
                text: String(newValue.length || "")
            });
            chrome.browserAction.setBadgeBackgroundColor({ color: "#4688F1" });
        });
    }

    /**
     * Get item by id
     * @param {string} id the record id
     * @returns {(string|boolean)}
     */
    get(id) {
        if (!id) {
            throw Error("An 'id' must be provided.");
        }
        // check data array for existing record
        // and return to use
        let index = -1;
        this.data.forEach((data, i) => {
            if (data.id === id) {
                index = i;
            }
        });

        return index > -1 && this.data[index];
    }

    /**
     * Get all items and return
     * @returns {array}
     */
    getAll() {
        // grab the tab-you-later data store from chrome
        // storage api and save it
        return new Promise(resolve => {
            chrome.storage.sync.get("tabs-storage", items => {
                return resolve(items["tabs-storage"] || []);
            });
        });
    }

    /**
     * Save data
     * @param {object} item the item object to be saved
     */
    set(item) {
        if (!item || !item.url) {
            throw Error("There was an error saving record.");
        }

        // either get the item id or create one if
        // it doesn't exist
        const { id } = item;
        const record = this.data.find(data => data.id === id);

        // push a new item to data array if it
        // is not already in array
        if (!record) {
            this.data.push(item);
        } else {
            // check data array for existing record
            // and save the index for updating
            let index = -1;
            this.data.forEach((data, i) => {
                if (data.id === id) {
                    index = i;
                }
            });

            // update existing record if it does not
            // already exist
            if (index > -1) {
                this.data[index] = item;
            }
        }

        // send rejection if data could not
        // be saved
        chrome.storage.sync.set(
            {
                "tabs-storage": this.data.filter(
                    data =>
                        data.completed !== true &&
                        !!data.url.match(/^(http|https)/)
                )
            },
            () => {
                console.log(
                    `Saved "${this.data.length}" items to Chrome Storage.`
                );
            }
        );
    }

    /**
     * wipe data
     */
    clearAll() {
        return new Promise(resolve => {
            const length = this.data.length;
            chrome.storage.sync.set({ "tabs-storage": [] }, () => {
                console.log(`Cleared "${length}" items from Chrome Storage.`);
                this.data = [];
                resolve(this.data);
            });
        });
    }
}
