'use strict'
{
    const createCheckBox = (id) => {
        let elem = document.createElement("input");
        elem.setAttribute("type", "checkbox");
        elem.setAttribute("id", id);
        return elem;
    };

    const createLabel = (title, url, id) => {
        let elem = document.createElement("label");
        elem.setAttribute("htmlFor", id);
        let link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.textContent = title;
        elem.appendChild(link);
        return elem;
    };

    const createInfo = (title, url, id) => {
        let elem = document.createElement("div");
        let checkbox = createCheckBox(id);
        let label = createLabel(title, url, id);
        elem.appendChild(checkbox);
        elem.appendChild(label);
        return elem;
    }

    document.getElementById("add_btn").addEventListener("click", async () => {
        await chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            let titles = [];

            for (let i = 0; i < tabs.length; i++) {
                titles.push({ title: tabs[i].title, url: tabs[i].url });
            }
            chrome.storage.sync.get({titles: []}, function (value) {
                if (value.titles) {
                    titles = titles.concat(value.titles);
                }
                titles = Array.from(
                    new Map(titles.map((item) => [item.url, item])).values()
                );
                chrome.storage.sync.set({'titles': titles}, function () {
                });

                let list_elem = document.getElementById("list");
                while (list_elem.firstChild) {
                    list_elem.removeChild(list_elem.firstChild);
                }
                for (let [id, item] of titles.entries()) {
                    list_elem.appendChild(createInfo(item.title, item.url, id));
                }
            });
        });
    });
    
    document.addEventListener("DOMContentLoaded", async () => {
        let titles = [];
        await chrome.storage.sync.get({titles: []}, function (value) {
            if(value.titles) {
                titles = value.titles;
            }
            let list_elem = document.getElementById("list");
            for (let [id, item] of titles.entries()) {
                list_elem.appendChild(createInfo(item.title, item.url, id));
            }
        });
    });

    document.getElementById("remove_btn").addEventListener("click", async () => {
        let titles = [];
        let checkbox = document.querySelectorAll('input[type="checkbox"]');
        checkbox.forEach((elem) => {
            if (!elem.checked) {
                let link = elem.nextSibling.firstChild;
                titles.push({ title: link.textContent, url: link.getAttribute("href") });
            }
        });
        chrome.storage.sync.set({'titles': titles}, function () {
        });

        let list_elem = document.getElementById("list");
        while (list_elem.firstChild) {
            list_elem.removeChild(list_elem.firstChild);
        }
        for (let [id, item] of titles.entries()) {
            list_elem.appendChild(createInfo(item.title, item.url, id));
        }
    });

    document.getElementById("checkAll_btn").addEventListener("click", async () => {
        let checkbox = document.querySelectorAll('input[type="checkbox"]');
        checkbox.forEach((elem) => {
            elem.checked = true;
        });
    });

    document.getElementById("save_btn").addEventListener("click", async () => {
        let elems = document.querySelectorAll('a');
        let data = "";
        for (let [i, elem] of elems.entries()) {
            data += i.toString() + ",\"" + elem.textContent + "\",\"" + elem.getAttribute("href") + "\"\n";
        }
        try {
            const handle = await getNewFileHandle();
            await writeFile(handle, data);
        } catch (e) {
            console.log(e);
        }
    });

    async function getNewFileHandle() {
        const options = {
            suggestedName: 'Untitled.csv',
            types: [
                {
                    description: 'Text Files',
                    accept: {
                        'text/plain': ['.csv'],
                    },
                },
            ],
        };
        const handle = await window.showSaveFilePicker(options);
        return handle;
    }

    async function writeFile(fileHandle, contents) {
        const writable = await fileHandle.createWritable();
        await writable.write(contents);
        await writable.close();
    }
}