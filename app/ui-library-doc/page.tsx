'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'doc-simply-ui/dist/style.css';

const Doc = dynamic(() => import('doc-simply-ui'), { ssr: false });

const Page = () => {
  return (
    <div>
      <Doc />
    </div>
  );
};

export default Page;
