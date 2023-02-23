import * as React from 'react'
import {Outlet, Link, useLoaderData, redirect} from 'react-router-dom'

export const routes =
[
    {
        path: "/",
        element: <Layout />,
        children:
        [
            {
                index: true,
                loader: homeLoader,
                element: <Home />
            },
            {
                path: "about",
                element: <About />
            },
            {
                path: "dashboard",
                loader: dashboardLoader,
                element: <Dashboard />
            },
            {
                path: "redirect",
                loader: redirectLoader
            },
            {
                path: "*",
                element: <NoMatch />
            }
        ]
    }
]

function Layout()
{
    return (
        <div>
            <h1>Data Router Server Rendering Example</h1>

            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/redirect">Redirect to Home</Link>
                    </li>
                    <li>
                        <Link to="/nothing-here">Nothing Here</Link>
                    </li>
                </ul>
            </nav>

            <hr />

            <Outlet />
        </div>
    )
}

const sleep = () => new Promise((r) => setTimeout(r, 500))
const rand = () => Math.round(Math.random() * 100)

async function homeLoader()
{
    await sleep()

    return {data: `Home loader - random value ${rand()}`}
}

async function dashboardLoader()
{
    await sleep()

    return {data: `Dashboard loader - random value ${rand()}`}
}

async function redirectLoader()
{
    await sleep()

    return redirect('/')
}

function Home()
{
    let data = useLoaderData()

    return (
        <div>
            <h2>Home</h2>
            <p>Loader Data: {data.data}</p>
        </div>
    )
}
  
function About()
{
    return (
        <div>
            <h2>About</h2>
        </div>
    )
}
  
function Dashboard()
{
    let data = useLoaderData()

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Loader Data: {data.data}</p>
        </div>
    )
}
  
function NoMatch()
{
    return (
        <div>
            <h2>Nothing to see here!</h2>
            <p>
                <Link to='/'>Go to the home page</Link>
            </p>
        </div>
    )
}