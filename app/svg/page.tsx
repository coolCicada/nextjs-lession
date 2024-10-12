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
        <svg width="500" height="300">
          <rect x="50" y="20" width="150" height="60" fill="lightblue" stroke="black" />
          <text x="125" y="50" text-anchor="middle" alignment-baseline="middle">步骤 1</text>

          <rect x="50" y="120" width="150" height="60" fill="lightgreen" stroke="black" />
          <text x="125" y="150" text-anchor="middle" alignment-baseline="middle">步骤 2</text>

          <rect x="250" y="70" width="150" height="60" fill="lightcoral" stroke="black" />
          <text x="325" y="100" text-anchor="middle" alignment-baseline="middle">决策</text>

          <line x1="125" y1="80" x2="125" y2="120" stroke="black" stroke-width="2" marker-end="url(#arrowhead)" />
          <line x1="200" y1="100" x2="250" y2="100" stroke="black" stroke-width="2" marker-end="url(#arrowhead)" />

          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
          </defs>
        </svg>

        <svg height="151" width="325">
            <path d="M 1 150 L 200 150 C 265 155, 265 80, 325 75" stroke="black" strokeWidth="1" fill="transparent"/>
            <line x1="0" y1="75" x2="325" y2="75" stroke="black" strokeWidth="1" />
            <path d={`M ${start.x} ${start.y} L 200 1 C 265 5, 265 70, 325 75`} stroke="black" strokeWidth="1" fill="transparent"/>
        </svg>
    </div>
  )
}

export default Page;