'use client'

import Link from 'next/link'
import Image from 'next/image'
import { UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

const Header = () => {
  const [isSearchHovered, setIsSearchHovered] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-recapify-dark shadow-md z-50">
      <nav className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-3 gap-3">
        {/* ✅ Logo and Mobile Toggle */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-recapify-teal hover:opacity-80 transition-colors"
          >
            <Image
              src="/favicon.ico"
              alt="Recapify Logo"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            Recapify
          </Link>
        </div>

        {/* ✅ Desktop Section */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 flex-1 md:justify-end relative w-full">
          {/* ✅ Desktop Search */}
          <div
            className="hidden md:block transition-all duration-300 md:w-auto"
            style={{
              flexBasis: isSearchHovered ? '80%' : '12rem',
              maxWidth: isSearchHovered ? '100%' : '12rem',
            }}
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => setIsSearchHovered(false)}
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className={`w-full border rounded-md px-4 py-1 focus:outline-none focus:ring focus:border-recapify-teal transition-all duration-300 ${
                  isSearchHovered ? 'shadow-lg' : ''
                }`}
              />

              {/* ✅ Desktop Quick Search Dropdown */}
              {isSearchHovered && (
                <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-xl z-50 p-4 min-h-48 w-full">
                  <div className="text-sm text-gray-500 mb-3">Quick search</div>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <span className="text-gray-600">📄</span>
                      <span className="ml-2">Search in files...</span>
                    </div>
                    <div className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <span className="text-gray-600">📁</span>
                      <span className="ml-2">Search in repositories...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ✅ Desktop Navbar Links */}
          <div className="hidden md:flex flex-row justify-center items-center gap-6 mt-3 md:mt-0">
            <Link
              href="/"
              className="text-white hover:text-recapify-teal transition-colors"
            >
              Home
            </Link>
            <Link
              href="/features"
              className="text-white hover:text-recapify-teal transition-colors"
            >
              Features
            </Link>
            <Link
              href="/signin"
              className="px-6 py-2 flex items-center justify-center rounded-full bg-recapify-teal text-white hover:opacity-90 transition-colors shadow-md"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Sign In
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
