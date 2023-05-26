const Page = require('./helpers/page');


// OPENINIG OF BROWSER
let page;

beforeEach(async()=>{
    page = await Page.build();
    await page.goto('localhost:3000');
})

// CLOSING OF BROWSER
afterEach(async()=>{
    await page.close();
})


// TEST FOR VALIDATING HEADER
test('the header has the correct text',async() =>{ 
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
});


// TEST FOR AUTH(GOOGLE LOGIN)
test('clicking login button starts the auth flow',async() =>{ 
    await page.click(".right a");
    const url = await page.url();
    
    expect(url).toMatch(/accounts\.google\.com/);
})

// signed to show logout button
test('when signed in shows logged out button',async() =>{

    await page.login();
    // evaluating the text  
    const text = await page.$eval('a[href="/auth/logout"]', el=> el.innerHTML);

    // actual test
    expect(text).toEqual('Logout');
})