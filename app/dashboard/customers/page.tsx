'use client';

import { useEffect } from "react";

export default function Page() {
  console.log('customers!!')

  useEffect(() => {
    console.log('eff customers') 
}, []);
  return <p>cust</p>;
}