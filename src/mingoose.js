const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;

const mingoose = {
  connect(filePath) {
    this.filePath = filePath;
  },
  Schema: class {
    constructor(fields) {
      this.fields = fields;
    }
    build(sourceItem, builtItem) {
      for (const field in this.fields) {
        if (!sourceItem[field] && this.fields[field].required) {
          throw new Error(`${field} is required`);
        }

        if (sourceItem[field]) {
          builtItem[field] = sourceItem[field];
        }
      }
    }
  },
  model(name, schema) {
    const { filePath } = this;
    const collectionFilePath = `${filePath}/${name}.json`;

    function write(data) {
      return fs.writeFile(collectionFilePath, JSON.stringify(data, null, 2));
    }

    function read() {
      return new Promise((resolve, reject) => {
        fs.readFile(collectionFilePath, "utf-8").then((data) =>
          resolve(JSON.parse(data))
        );
      });
    }

    return class {
      static create(item) {
        return new Promise((resolve, reject) => {
          read().then((items) => {
            const newItem = { _id: uuidv4(), _v: 0 };
            schema.build(item, newItem);
            let updated;
            if (items) {
              updated = [...items, newItem];
            } else {
              updated = [this.data];
            }
            write(updated).then(resolve(newItem));
          });
        });
      }
      static findById(id) {
        return new Promise((resolve, reject) => {
          read()
            .then((items) => {
              resolve(items.find((itm) => itm._id === id));
            })
            .catch((err) => reject(err));
        });
      }
      static updateById(id, body) {
        return new Promise((resolve, reject) => {
          read().then((items) => {
            const item = items.find((itm) => itm._id === id);
            schema.build(body, item);
            let _v = parseInt(item._v);
            item._v = _v++;
            const updated = items.map((itm) => (itm._id == id ? item : itm));
            write(updated).then(resolve(item));
          });
        });
      }
      static populate(item, prop) {
        return new Promise((resolve, reject) => {
          const collection = schema.fields[prop].from;
          fs.readFile(`${filePath}/${collection}.json`, "utf-8").then(
            (itemsStr) => {
              const foreignItems = JSON.parse(itemsStr);
              const foreignItem = foreignItems.find(
                (itm) => itm._id === item[prop]
              );
              item[prop] = foreignItem;
              resolve(item);
            }
          );
        });
      }

      static getRelated(item, name) {
        return new Promise((resolve, reject) => {
          const { _id } = item;
          const { from, field } = schema.fields._related[name];
          fs.readFile(`${filePath}/${from}.json`, "utf-8").then((itemsStr) => {
            const allItems = JSON.parse(itemsStr);
            const relatedItems = allItems.filter((itm) => itm[field] === _id);

            resolve(relatedItems);
          });
        });
      }
    };
  },
};

module.exports = mingoose;
