const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options={}){
    this.useCache=true;  // initially declared true
    this.hashkey = JSON.stringify(options.key || '');
    return this;
}


mongoose.Query.prototype.exec = async function(){

    // if it is flase then return all the things which is not cached
    // the original value i.e exec
    if(!this.useCache){
        return exec.apply(this,arguments);
    }

    const key = JSON.stringify(Object.assign({},this.getQuery(),{
        collection: this.mongooseCollection.name
    }))

    // see if we have a value for 'key' in redis
    const cachevalue = await client.hget(this.hashkey ,key); 

    //if we do, return that
    if(cachevalue){

        // converting mongoose document to JSON data but it will return array of object but we want a single object
        const doc = JSON.parse(cachevalue);

        return Array.isArray(doc) 
            ? doc.map(d => new this.model(d))
            : new this.model(doc); 

    }

    // otherwise, issue the query and store the result in redis
    const result = await exec.apply(this,arguments);

    client.hset(this.hashkey ,key, JSON.stringify(result));

    return result;
} 


module.exports = {
    clearHash(hashkey){
        client.del(JSON.stringify(hashkey));
    }
}