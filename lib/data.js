/*
 * Library for storing and editing data
 */

// Dependencies
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

// Container for module
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback) {
    // open file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            // convert data to string
            dataString = JSON.stringify(data);
            // write to file and close it
            fs.writeFile(fileDescriptor, dataString, (err) => {
                if(!err) {
                    fs.close(fileDescriptor, (err) => {
                        if(!err) {
                            callback(false);
                        } else {
                            callback('Error closing file');
                        }
                    });
                } else {
                    callback('Error writing to file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};

// Read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', (err, data) => {
        if (!err && data) {
            callback(err, helpers.parseJsonToObject(data));
        } else {
            callback(err, data);
        }
    });
};

// Update data in a file
lib.update = (dir, file, data, callback) => {
    // open file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            const dataString = JSON.stringify(data);
            // truncate the file
            fs.ftruncate(fileDescriptor, (err) => {
                if(!err) {
                    fs.writeFile(fileDescriptor, dataString, (err) => {
                        if(!err) {
                            fs.close(fileDescriptor, (err) => {
                                if(!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error writing to file');
                        }
                    });
                        } else {
                    callback('Error truncating file');
                }
            });
        } else {
            console.log('Could not open file for updating. It may not exist yet.')
        }
    });
};

// Delete file
lib.delete = (dir, file, callback) => {
    // unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

// Get a list of all items in a directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir+dir+'/', (err, data) => {
        if (!err && data && data.length > 0) {
            const trimmedFileNames = [];
            for (const fileName of data) {
                trimmedFileNames.push(fileName.replace('.json', ''));
            }
            callback( false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
};

module.exports = lib;
