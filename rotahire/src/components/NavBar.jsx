'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Globe, Plus } from 'lucide-react';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`
        fixed left-1/2 -translate-x-1/2 z-50
        border border-gray-200 bg-white/50 backdrop-blur-md
        transition-all duration-300 ease-in-out py-3 px-8 flex justify-between items-center
        ${isScrolled ? 'top-0 w-full rounded-none' : 'top-5 w-11/12 rounded-2xl'}
      `}
    >
      <div>
        <Image
          src="/DistrictShortCran.png"
          alt="RotaHire Logo"
          width={120}
          height={40}
        />
      </div>
      <div className='flex space-x-8'>
        <Link 
          href="/" 
          className="relative text-blackD font-medium font-['Poppins'] text-sm tracking-wide transition-all duration-300 ease-in-out hover:text-cranberry group"
        >
          home
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cranberry to-pink-500 transition-all duration-300 ease-out group-hover:w-full"></span>
        </Link>
        <Link 
          href="/jobs" 
          className="relative text-blackD font-medium font-['Poppins'] text-sm tracking-wide transition-all duration-300 ease-in-out hover:text-cranberry group"
        >
          jobs
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cranberry to-pink-500 transition-all duration-300 ease-out group-hover:w-full"></span>
        </Link>
        <Link 
          href="/" 
          className="relative text-blackD font-medium font-['Poppins'] text-sm tracking-wide transition-all duration-300 ease-in-out hover:text-cranberry group"
        >
          about us
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cranberry to-pink-500 transition-all duration-300 ease-out group-hover:w-full"></span>
        </Link>
        <Link 
          href="/" 
          className="relative text-blackD font-medium font-['Poppins'] text-sm tracking-wide transition-all duration-300 ease-in-out hover:text-cranberry group"
        >
          contact
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cranberry to-pink-500 transition-all duration-300 ease-out group-hover:w-full"></span>
        </Link>
      </div>
      <div className='flex space-x-4'>
        <Button
          aria-label="Rotaract website"
          className="flex items-center gap-2 border border-gray-400 bg-transparent text-gray-600 hover:bg-gray-200 transition-all ease-in-out duration-300"
        >
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">rotaract3220.org</span>
        </Button>
        <Button
          aria-label="Post a job"
          className="flex items-center gap-2 bg-cranberry/80 hover:bg-cranberry border border-cranberry text-white transition-all ease-in-out duration-300"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-sm font-medium">Post a job</span>
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
