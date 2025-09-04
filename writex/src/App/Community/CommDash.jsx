import React from 'react'
import { motion } from 'framer-motion'
import { Users, MessageCircle, Trophy, Calendar } from 'lucide-react'
import Navbar from '../Components/Navbar'

const CommDash = () => {
  return (
    <>
    <Navbar />
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-900 rounded-full mb-8">
            <Users className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 lexend-txt mb-6">
            Coming Soon
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 oxygen-regular mb-8 max-w-2xl mx-auto">
            We're building something amazing for our community. Get ready for an enhanced experience!
          </p>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 lexend-txt mb-2">Community Chat</h3>
            <p className="text-gray-600 oxygen-regular text-sm">Connect with fellow writers in real-time discussions</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 lexend-txt mb-2">Writing Challenges</h3>
            <p className="text-gray-600 oxygen-regular text-sm">Participate in exciting writing competitions and contests</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 lexend-txt mb-2">Events & Workshops</h3>
            <p className="text-gray-600 oxygen-regular text-sm">Join virtual events and skill-building workshops</p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8"
        >
          <div className="text-sm text-gray-500 mb-2">Development Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 2, delay: 1 }}
              className="bg-gradient-to-r from-blue-500 to-gray-900 h-3 rounded-full"
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">75% Complete</div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 text-sm text-gray-500"
        >
          <p>Stay tuned for updates on our social media channels</p>
        </motion.div>
      </div>
    </div>
    </>
  )
}

export default CommDash