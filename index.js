const puppeteer = require('puppeteer');

const conf = {view: {width: 390 , height: 844},
              launch : {headless: 'newupp', args: ['--no-sandbox', '--disable-setuid-sandbox']}}



const sleep = duration => new Promise(resolve => setTimeout(resolve, duration));
const scrollDown = async(calls, page) => {
    if (calls > 5){calls = 5}
    let i = 0
    while( i <= calls ){
        await sleep(10);
        await page.mouse.wheel({deltaY: 1080} )
        i++
    }
}
//Алгоритм получения информации о курсах на степике по запросу
const getStepikCoursesInfo = async(request = 'физика') => {

    
        viewConf = conf.view
        const browser = await puppeteer.launch(conf.launch)
        const page = await browser.newPage()
        await page.setViewport(viewConf)
        await page.goto(`https://stepik.org/catalog/search?q=${request}`)
        await page.waitForSelector('.catalog-block__content')
        await page.waitForSelector('.catalog-rich-card__link-wrapper')
        await scrollDown(1, page)
        await page.waitForSelector('.page-footer')
    
        const result = await page.evaluate(() => {
            let data = []
            const courses = document.querySelectorAll('.course-cards__item')
            for (let course of courses){
                const info = course.querySelector(".course-card__title")
                const title_html = info.innerHTML
                if(title_html == '&nbsp;') {continue}
                else{
                    const title = info.innerText
                    const source = "https://stepik.org"
                    const url = source + info.getAttribute('href')
                    data.push({
                        source: source,
                        title: title,
                        url: url
                    })    
                }       
            }
            if (data == []){
                return []
            }else{return data}
        })
    
        await browser.close()
        return result
    
}

(async () => {
    console.log(await getStepikCoursesInfo());
})()