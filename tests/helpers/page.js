const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory');

class CustomPage{
    static async build(){
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        })

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage,{
            get: function(target, property){
                return customPage[property] || browser[property] || page[property];
            }
        })
    }
    constructor(page){
        this.page = page;
    }

    async login(){
        const user = await userFactory();
        const {session,sig} = sessionFactory(user);
    
        // setCookie for verifying session and sig.
        await this.page.setCookie({name:'session', value:session});
        await this.page.setCookie({name:'session.sig', value:sig});
        await this.page.goto('http://localhost:3000/blogs');

        // waitFor() browser to load so that it can load ('a[]..') 
        await this.page.waitFor('a[href="/auth/logout"]');
    }


    async getContentsOf(selector){
        return this.page.$eval(selector, el=>el.innerHTML);
    }
}

module.exports = CustomPage;