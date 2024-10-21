'use client';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import me from '@/public/me.png';

const Page = () => {
  const router = useRouter();
  return (
    <div className='min-h-screen flex flex-col'>
      <main>
        <div className='mx-auto my-4  flex w-96 h-12 bg-slate-200 justify-around items-center rounded-full'>
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
        <div onClick={() => router.push('/oauth')} className='mx-auto mb-2 w-[750px] flex rounded-lg'>
          <div className='w-1/2 bg-yellow-50 p-6'>
            <div className='text-2xl'>oauth2.0</div>
            <div className='flex space-x-2 mt-2 mb-4'>
              <div>code</div>
              <div>visit</div>
            </div>
            <div className='text-sm'>
              这是我oauth2.0的学习,来源于阮一峰老师的博客
            </div>
          </div>
          <div className='bg-zinc-50'></div>
        </div>
        <div onClick={() => router.push('/ui-library-doc')} className='mr-2 mb-2 w-32 h-32 bg-slate-300 border flex justify-center items-center rounded-lg'>
          UI 组件库文档
        </div>
        <div onClick={() => router.push('/nick')} className='mr-2 mb-2 w-32 h-32 bg-slate-300 border flex justify-center items-center rounded-lg'>
          nick
        </div>
        <div onClick={() => router.push('/login')} className='mr-2 mb-2 w-32 h-32 bg-slate-300 border flex justify-center items-center rounded-lg'>
          login
        </div>
        <div onClick={() => router.push('/tailwindcss')} className='mr-2 mb-2 w-32 h-32 bg-slate-300 border flex justify-center items-center rounded-lg'>
          tailwindcss
        </div>
      </main>
      <footer>
        <a href="https://beian.miit.gov.cn/">京ICP备19043673号-2</a>
      </footer>
    </div>
  );
}

export default Page;