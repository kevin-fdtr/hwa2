// test code for handler functions

console.log('test util module, getBodyData');

const _handlerUtil = require('./util');

const resBodyConfigArray = [
  {
    "name": "id",
    "type": "string"
  }, 
  {
    "name": "name",
    "type": "string"
  }
];

const dataObj = {
  "id": "blt", 
  "name": "Classic Clubelicious",
  "description": "A sandwich filled with bacon, lettuce, and tomato and whatever other bits are lying around the cutting board.",
  "extra": "read all about it"
};

// Test simple object config
console.log('test simple config of an array of properties with a data object of properties');
const resObj1 = _handlerUtil.getBodyData(resBodyConfigArray, dataObj);
console.log(typeof(resObj1.description) == 'undefined' ? 'pass' : 'fail');


const resBodyConfigObj = {
  "items": [
    {
      "name": "id",
      "type": "string"
    },
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "description",
      "type": "string"
    }
  ]
};

const dataObjItems = {
  "items": [
    { 
      "id": "blt", 
      "name": "Classic Clubelicious",
      "description": "A sandwich filled with bacon, lettuce, and tomato and whatever other bits are lying around the cutting board.",
      "extra": "read all about it"
    },
    { 
      "id": "cereal", 
      "name": "Berry Bonanzific",
      "description": "Crunchy multi-grain flakes ready to be covered in chilled milk and berries (included!)"
    }
  ],
  "other": [
    { 
      "id": "blt", 
      "name": "Classic Clubelicious",
      "description": "A sandwich filled with bacon, lettuce, and tomato and whatever other bits are lying around the cutting board.",
      "extra": "read all about it"
    },
    { 
      "id": "cereal", 
      "name": "Berry Bonanzific",
      "description": "Crunchy multi-grain flakes ready to be covered in chilled milk and berries (included!)"
    }
  ]
};

// test property with array of object config
console.log('test config properties with arrays of data objects')
const resObj2 = _handlerUtil.getBodyData(resBodyConfigObj, dataObjItems);
console.log(typeof(resObj2.items) == 'object' && resObj2.items instanceof Array ? 'pass' : 'fail'); 
console.log(typeof(resObj2.items[0]) == 'object' && typeof(resObj2.items[0]) == 'object' ? 'pass' : 'fail');
console.log(typeof(resObj2.items[0].extra) == 'undefined' 
    && typeof(resObj2.items[0].id) == 'string'
    && resObj2.items[0].id == 'blt' ? 'pass' : 'fail');

// what if we pass in unexpected structures?
console.log('test with wrong config for data');
const resObj3 = _handlerUtil.getBodyData(resBodyConfigObj, dataObj);
console.log(typeof(resObj3.items) == 'object' 
    && resObj3.items instanceof Array
    && resObj3.items.length == 0 ? 'pass': 'fail');

const resObj4 = _handlerUtil.getBodyData(resBodyConfigArray, dataObjItems);
console.log(typeof(resObj4) == 'object' && Object.keys(resObj4).length == 0 ? 'pass': 'fail');


