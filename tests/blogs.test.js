const Page = require('./helpers/page');

let page;

beforeEach(async()=>{
    page = await Page.build();
    await page.goto('localhost:3000');
})


afterEach(async () =>{
    await page.close();
});


describe('When logged in', async()=>{
    beforeEach(async()=>{
        // login
        await page.login();
        // selecting the button from the inspect
        await page.click('a.btn-floating');
    });

    test('When logged in can see logged create form(red button)' ,async()=>{
        // checking whether i am present at the correct React form==> for this verfying the title of form
        const label = await page.getContentsOf('form label');
    
        expect(label).toEqual('Blog Title');
    
    })

    describe('Valid Inputs', async() =>{
        beforeEach(async()=>{
            await page.type('.title input', 'My title');
            await page.type('.title input', 'My Content');

            await page.click('form button')
        })

        test('Submitting takes user to review screen', async() =>{
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        })

        test('Submitting then saving adds blog to index page', async()=>{
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')
            
            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        })
    })

    describe('And using invalid inputs', async()=>{
        beforeEach(async() => {
            // selecting next button
            await page.click('form button');
        })

        test('the form shows an error message', async() =>{
            // error message below blog title in new blog create form
            const titleError = await page.getContentsOf('.title .red-text');
            // error message below blog content in new blog create form
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    })
})

describe('User is not logged in', async() =>{


    test('User cannot create a blog posts', async() =>{
        const result = await page.evaluate(() =>{
            return fetch('/api/blogs',{
                method:'POST',
                credentials: 'same-origin',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({title: 'My Title', content:'My Content'})
            }).then(res => res.json());
        })
        
        expect(result).toEqual({ error: 'You must log in!' })
    })


    test('User cannot get a list of response', async()=>{
        const result = await page.evaluate(() => {
            return fetch('/api/blogs',{
                method:'GET',
                credentials: 'same-origin',
                headers:{
                    'Content-Type':'application/json'
                }
            })
        })

        expect(result).toEqual({ error: 'You must log in!' })
    })
})


