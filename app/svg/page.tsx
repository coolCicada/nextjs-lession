'use client';
import React, { useEffect, useState } from 'react'

const Page = () => {
    const [start, setStart] = useState({x: 1, y : 1});
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setStart(({x, y}) => ({
    //             x: x + 1,
    //             y: y + 1
    //         }))
    //     }, 1000);
    //     return () => {
    //         clearInterval(interval);
    //     }
    // }, []);
    // console.log('start:' ,start);
  return (
    <div>
        <span>svg 曲线</span>
        <svg height="151" width="325">
            <path d="M 1 150 L 200 150 C 265 155, 265 80, 325 75" stroke="black" strokeWidth="1" fill="transparent"/>
            <line x1="0" y1="75" x2="325" y2="75" stroke="black" strokeWidth="1" />
            <path d={`M ${start.x} ${start.y} L 200 1 C 265 5, 265 70, 325 75`} stroke="black" strokeWidth="1" fill="transparent"/>
        </svg>
    </div>
  )
}

export default Page;