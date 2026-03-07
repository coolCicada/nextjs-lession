'use client';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import me from '@/public/me.png';

const Page = () => {
  const router = useRouter();
  return (
    <div className='min-h-screen flex flex-col'>
      <main className='px-4 flex-1'>
        <div className='mx-auto my-4  flex sm:w-96 h-12 bg-slate-200 justify-around items-center rounded-full'>
          <span>Home</span>
          <span>About</span>
          <span>Projects</span>
          <span>Skills</span>
        </div>
        <Image
          className='rounded-full my-12 mx-auto'
          src={me}
          alt="1"
          width={127}
          height={127}
        />
        <div className='my-12'>
          <div className='text-sm text-center'>Hi, my name is</div>
          <div className='text-4xl text-center'>Matt</div>
        </div>
        <div className='flex flex-wrap justify-evenly gap-5 sm:flex-row rounded-xl overflow-hidden'>
          <div className='bg-yellow-50 p-6 w-full sm:w-96'>
            <div onClick={() => router.push('/oauth')} className='text-2xl cursor-pointer hover:text-blue-300'>oauth2.0</div>
            <div className='flex space-x-2 mt-2 mb-4'>
              <div>code</div>
              <div>visit</div>
            </div>
            <div className='text-sm'>
              这是我oauth2.0的学习,来源于阮一峰老师的博客ewfwf范围分为非服务恶妇
            </div>
          </div>
          <div className='bg-pink-50 p-6 w-full sm:w-96'>
            <div onClick={() => router.push('/ui-library-doc')} className='text-2xl cursor-pointer hover:text-blue-300'>simply-ui</div>
            <div className='flex space-x-2 mt-2 mb-4'>
              <div>code</div>
              <div>visit</div>
            </div>
            <div className="text-sm">
              UI 组件库文档
            </div>
          </div>
          <div className='bg-pink-50 p-6 w-full sm:w-96'>
            <div onClick={() => router.push('/nick')} className='text-2xl cursor-pointer hover:text-blue-300'>
              Nick
            </div>
            <div className='flex space-x-2 mt-2 mb-4'>
              <div>code</div>
              <div>visit</div>
            </div>
            <div className="text-sm">
              nick
            </div>
          </div>
          <div className='bg-pink-50 p-6 w-full sm:w-96'>
            <div onClick={() => router.push('/login')} className='text-2xl cursor-pointer hover:text-blue-300'>
              login
            </div>
            <div className='flex space-x-2 mt-2 mb-4'>
              <div>code</div>
              <div>visit</div>
            </div>
            <div className="text-sm">
              login
            </div>
          </div>
          <div className='bg-pink-50 p-6 w-full sm:w-96'>
            <div onClick={() => router.push('/ui-library-doc')} className='text-2xl cursor-pointer hover:text-blue-300'>
              simply-ui
            </div>
            <div className='flex space-x-2 mt-2 mb-4'>
              <div>code</div>
              <div>visit</div>
            </div>
            <div className="text-sm">
              UI 组件库文档
            </div>
          </div>
          <div className='bg-pink-50 p-6 w-full sm:w-96'>
            <div onClick={() => router.push('/tailwindcss')} className='text-2xl cursor-pointer hover:text-blue-300'>
              tailwindcss
            </div>
            <div className='flex space-x-2 mt-2 mb-4'>
              <div>code</div>
              <div>visit</div>
            </div>
            <div className="text-sm">
              tailwindcss 
            </div>
          </div>
          <div className='bg-green-50 p-6 w-full sm:w-96'>
            <div onClick={() => router.push('/todos')} className='text-2xl cursor-pointer hover:text-blue-300'>
              Todos Showcase
            </div>
            <div className='flex space-x-2 mt-2 mb-4'>
              <div>web</div>
              <div>feishu</div>
            </div>
            <div className="text-sm">
              可展示的代办页面，支持飞书与网页同步
            </div>
          </div>
        </div>
      </main>
      <footer className='flex justify-center'>
        <a href="https://beian.miit.gov.cn/">京ICP备19043673号-2</a>
      </footer>
    </div>
  );
}

export default Page;