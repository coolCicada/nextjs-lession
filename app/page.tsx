'use client';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-1 p-4 flex flex-wrap content-start'>
        <div onClick={() => router.push('/oauth')} className='mr-2 mb-2 w-32 h-32 bg-slate-300 border flex justify-center items-center rounded-lg'>
          oauth
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