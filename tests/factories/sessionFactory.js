const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);


module.exports = user =>{
     // faking a session
     const sessionObject = {
         passport:{
            // ._id is mongoose model id which is a JS object but we want string bcoz later we are stringify it.  
             user:user._id.toString()
         }
     }
 
     const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64') 
     const sig = keygrip.sign('session=' + session);
     return {session ,sig};
}