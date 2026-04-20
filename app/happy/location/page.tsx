'use client';

import { Button } from "@/app/ui/button";
import { useEffect, useState } from "react";

export default function Index() {
    const [latAndLong, setLatAndLong] = useState<{ latitude?: number, longitude?: number }>({});
    return (
        <div>
            <Button onClick={() => {
                navigator.geolocation.getCurrentPosition((position) => {
                    setLatAndLong({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                }, (error) => {
                    console.error('Geolocation error:', error);
                });
            }}>获取定位</Button>
            <div>经度：{latAndLong.longitude ?? '暂无'}</div>
            <div>维度：{latAndLong.latitude ?? '暂无'}</div>
        </div>
    );
}