import React from 'react';
import Image from 'next/image';
import logo from '@/public/images/logo.png';


export default function NavBar() {
    return (
        <nav className="flex justify-between items-center mb-8 p-4 border border-[#197686] rounded-3xl">
            <Image src={logo} alt="logo" width={100} height={100} />
            <ul className="hidden md:flex text-lg gap-4">
                <li>Events</li>
                <li>My Tickets</li>
                <li>About Projects</li>
            </ul>
            <button className="bg-white text-black px-4 py-3 rounded-lg"> MY TICKETS → </button>
        </nav>

    );

}

