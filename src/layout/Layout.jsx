import React from 'react'
import { Toaster } from 'react-hot-toast'
import TripCreation from '../components/trip/TripCreation'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div>
        <Toaster/>
        <Header/>
        <Outlet/>
    </div>
  )
}

export default Layout