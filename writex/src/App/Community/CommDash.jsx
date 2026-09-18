import React from 'react'
import { motion } from 'framer-motion'
import { Users, MessageCircle, Trophy, Calendar } from 'lucide-react'

const CommDash = () => {
  return (
    <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-y-auto px-4 py-16 text-foreground">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Users className="h-10 w-10 text-primary-foreground" />
          </div>

          <h1 className="wx-serif mb-6 text-5xl text-foreground md:text-7xl">
            Coming Soon
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            We&apos;re building a calmer community space for writers. Stay tuned.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="wx-serif mb-2 text-xl text-foreground">Community Chat</h3>
            <p className="text-sm text-muted-foreground">Connect with fellow writers in real-time discussions</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className="wx-serif mb-2 text-xl text-foreground">Writing Challenges</h3>
            <p className="text-sm text-muted-foreground">Participate in writing competitions and contests</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="wx-serif mb-2 text-xl text-foreground">Events & Workshops</h3>
            <p className="text-sm text-muted-foreground">Join virtual events and skill-building workshops</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8"
        >
          <div className="mb-2 text-sm text-muted-foreground">Development Progress</div>
          <div className="mx-auto h-2 max-w-md rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 2, delay: 1 }}
              className="h-2 rounded-full bg-primary"
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">75% Complete</div>
        </motion.div>
      </div>
    </div>
  )
}

export default CommDash
