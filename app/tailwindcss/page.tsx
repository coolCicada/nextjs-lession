export default function Index() {
    return (
        <main className="p-5">
            <h1 className="text-center text-lg text-blue-400">Hello World</h1>

            <div className="my-4 h-10 w-full rounded-md border-2 border-violet-600 bg-violet-200 p-2">
                <p className="text-center font-mono font-extrabold">A div</p>
            </div>

            <div className="fixed top-0 h-10 w-10 bg-red-500"></div>

            <div className="flex justify-around">
                <div className="h-16 w-16 rounded-full bg-blue-500"></div>
                <div className="h-16 w-16 rounded-full bg-blue-500"></div>
                <div className="h-16 w-16 rounded-full bg-blue-500"></div>
            </div>

            <div className="grid grid-cols-3 gap-5 mt-4">
                <div className="bg-violet-500 h-12"></div>
                <div className="bg-violet-500 h-12"></div>
                <div className="bg-violet-500 h-12"></div>
                <div className="bg-violet-500 h-12"></div>
                <div className="bg-violet-500 h-12"></div>
                <div className="bg-violet-500 h-12"></div>
                <div className="bg-violet-500 h-12"></div>
                <div className="bg-violet-500 h-12"></div>
            </div>

            <div className="md:block hidden">
                <p>a &gt; 768px</p>
            </div>
            <div className="max-md:block hidden">
                <p>a &lt; 768px </p>
            </div>

            <button className="my-4 rounded-lg bg-blue-500 px-4 py-2
             text-white hover:bg-blue-700 focus:outline-none 
             focus:ring-blue-300 active:bg-blue-800
             ">
                click me
            </button>

            <ul className="my-2 space-y-2">
                <li className="bg-white p-2 first:bg-red-100">1</li>
                <li className="bg-white p-2 first:bg-yellow-100 odd:bg-blue-200 even:bg-green-200">2</li>
                <li className="bg-white p-2 first:bg-yellow-100 odd:bg-blue-200 even:bg-green-200">3</li>
                <li className="bg-white p-2 first:bg-yellow-100 odd:bg-blue-200 even:bg-green-200">4</li>
            </ul>

            <div className="m-10 rounded-lg bg-white px-6 py-8 shadow-xl ring-1 ring-slate-900/5">
                <h3 className="text-base font-medium tracking-tight text-slate-900">
                    这是字体元素
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                    这是一个p元素
                </p>
                <button className="dark:text-white text-blue-900 px-4 py-2 text-sm font-medium mt-8 bg-blue-100 rounded-md">
                    这是一个button
                </button>
            </div>
        </main>
    )
}