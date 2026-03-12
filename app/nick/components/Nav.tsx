import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { navLinks } from '../constants';
import { headerLogo } from '../assets/images';
import { hamburger } from '../assets/icons';

export const Nav = () => {
  return (
    <header className='padding-x py-8 absolute z-10 w-full'>
      <nav className='flex justify-between items-center max-container'>
        <Link href='/'>
          <Image
            src={headerLogo}
            alt='logo'
            width={129}
            height={29}
            className='m-0 w-[129px] h-[29px]'
          />
        </Link>
        <ul className='flex-1 flex justify-center items-center gap-16 max-lg:hidden'>
          {navLinks.map((item) => {
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  className='font-montserrat leading-normal text-lg text-slate-gray'
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
        <div className='flex gap-2 text-lg leading-normal font-medium font-montserrat max-lg:hidden wide:mr-24'>
          <Link href='/'>Sign in</Link>
          <span></span>
          <a href=''>Explore now</a>
        </div>
        <div className='hidden max-lg:block'>
          <Image
            src={hamburger}
            alt='hamburger icon'
            width={25}
            height={25}
          />
        </div>
      </nav>
    </header>
  );
};
