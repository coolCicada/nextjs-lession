import { useEffect } from "react";

export default async function Page() {
    console.log('invoices!!');
    await new Promise((r) => {
        setTimeout(r, 3000);
    })
    
    return <p>Invoices Page</p>;
}