let path = require('path')
let fsp = require('fs/promises')
let express = require('express')

const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'

function resolve(p)
{
    return path.resolve(__dirname, p)
}

async function createServer()
{
    let app = express()
    let vite

    if(!isProduction)
    {
        vite = await require('vite').createServer(
            {
                root,
                server:
                {
                    middlewareMode: true,
                    appType: 'custom'
                }
            }
        )

        app.use(vite.middlewares);
    }
    else
    {
        app.use(require('compression')())
        app.use(express.static(resolve('dist/client')))
    }

    app.use(
        '*',
        async (req, res) => 
        {
            let url = req.originalUrl

            try
            {
                let template
                let render

                if(!isProduction)
                {
                    template = await fsp.readFile(resolve('index.html'), 'utf8')
                    template = await vite.transformIndexHtml(url, template)

                    render = await vite
                        .ssrLoadModule('src/entry.server.jsx')
                        .then((m) => m.render)
                }
                else
                {
                    template = await fsp.readFile(resolve('dist/client/index.html'), 'utf8')

                    render = require(resolve('dist/server/entry.server.js')).render
                }

                /*let html = template.replace('<!--app-html-->', render(url))
                
                res.setHeader('Content-Type', 'text/html')
      
                return res.status(200).end(html)*/

                try
                {
                    let appHtml = await render(req)
                    let html = template.replace('<!--app-html-->', appHtml)

                    res.setHeader('Content-Type', 'text/html')
      
                    return res.status(200).end(html)
                }
                catch(exception)
                {
                    if(exception instanceof Response && exception.status >= 300 && exception.status <= 399)
                    {
                        return res.redirect(exception.status, exception.headers.get('Location'))
                    }
                    
                    throw exception
                }
            }
            catch(error)
            {
                if(!isProduction)
                {
                    vite.ssrFixStacktrace(error)
                }

                console.log(error.stack)
      
                res.status(500).end(error.stack)
            }
    })

    return app
}

createServer().then((app) =>
{
    app.listen(3000, () =>
    {
        console.log('HTTP server is running at http://localhost:3000')
    })
})