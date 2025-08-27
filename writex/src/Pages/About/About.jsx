import React from 'react'
import { motion } from 'framer-motion'
import { 
  PenTool, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  Heart,
  BookOpen,
  Sparkles,
  Target,
  Award,
  Star,
  CheckCircle
} from 'lucide-react'
import Navbar from "../../App/Components/Navbar"
import { useNavigate } from "react-router-dom"

const About = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <PenTool className="w-10 h-10 text-gray-700" />,
      title: "Rich Text Editor",
      description: "Advanced writing tools with formatting, images, and real-time collaboration"
    },
    {
      icon: <Users className="w-10 h-10 text-gray-700" />,
      title: "Community Driven",
      description: "Connect with fellow writers, share ideas, and grow together"
    },
    {
      icon: <Zap className="w-10 h-10 text-gray-700" />,
      title: "Lightning Fast",
      description: "Optimized performance for seamless writing experience"
    },
    {
      icon: <Shield className="w-10 h-10 text-gray-700" />,
      title: "Secure & Private",
      description: "Your content is protected with enterprise-grade security"
    }
  ]

  const stats = [
    { number: "10K+", label: "Active Writers", icon: <Users className="w-6 h-6 text-gray-700" /> },
    { number: "50K+", label: "Blogs Published", icon: <BookOpen className="w-6 h-6 text-gray-700" /> },
    { number: "1M+", label: "Words Written", icon: <PenTool className="w-6 h-6 text-gray-700" /> },
    { number: "24/7", label: "Support", icon: <CheckCircle className="w-6 h-6 text-gray-700" /> }
  ]

  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "Former tech journalist with a passion for empowering writers",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Product",
      bio: "Product designer focused on creating intuitive user experiences",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Priya Patel",
      role: "Lead Developer",
      bio: "Full-stack engineer building the future of writing technology",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&=crop&crop=face"
    }
  ]

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-gray-700" />,
      title: "Empathy First",
      description: "We put ourselves in our users' shoes, understanding their needs and challenges to create solutions that truly serve them."
    },
    {
      icon: <Globe className="w-8 h-8 text-gray-700" />,
      title: "Global Community",
      description: "We celebrate diversity and believe that every culture and perspective enriches our collective storytelling experience."
    },
    {
      icon: <Award className="w-8 h-8 text-gray-700" />,
      title: "Excellence",
      description: "We're committed to delivering the highest quality experience, continuously improving and innovating our platform."
    }
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative pt-16 pb-20 px-4 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gray-400 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gray-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="oxygen-regular">Empowering Writers Since 2024</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-8xl font-bold text-gray-900 mb-8 lexend-txt leading-tight">
            About <span className="text-gray-700">Writex</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed oxygen-regular">
            We're on a mission to democratize writing and storytelling. Writex is more than just a platform – 
            it's a community where every voice matters and every story has the power to inspire.
          </p>
        </div>
      </motion.div>

      {/* Mission Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200">
                  <Target className="w-8 h-8 text-gray-700" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 lexend-txt">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6 oxygen-regular">
                To create the most accessible, powerful, and inspiring writing platform that empowers 
                individuals to share their stories, knowledge, and creativity with the world.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed oxygen-regular">
                We believe that everyone has a story worth telling, and we're building the tools to make 
                those stories come to life in the most beautiful and engaging way possible.
              </p>
            </div>
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 text-gray-700 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-gray-200">
                <div className="bg-gray-50/50 rounded-2xl p-6">
                  <BookOpen className="w-16 h-16 mb-6 text-gray-700" />
                  <h3 className="text-3xl font-bold mb-4 lexend-txt">Writing for Everyone</h3>
                  <p className="text-gray-600 text-lg oxygen-regular">
                    From beginners to published authors, our platform adapts to your writing journey, 
                    providing the tools and support you need at every stage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 px-4 bg-white/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 lexend-txt">Why Choose Writex?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto oxygen-regular">
              We've built Writex from the ground up with writers in mind, focusing on what matters most.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white/80 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-gray-200">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 lexend-txt">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed oxygen-regular">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 px-4 bg-stone-300"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 lexend-txt">Writex by the Numbers</h2>
            <p className="text-xl text-gray-600 oxygen-regular">
              Our community is growing every day, and we're just getting started.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 group-hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 lexend-txt">{stat.number}</div>
                  <div className="text-gray-600 font-medium oxygen-regular">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 px-4 bg-white/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 lexend-txt">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto oxygen-regular">
              The passionate individuals behind Writex who are committed to revolutionizing the writing experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative mb-6">
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 lexend-txt">{member.name}</h3>
                  <p className="text-gray-700 font-medium mb-4 oxygen-regular">{member.role}</p>
                  <p className="text-gray-600 leading-relaxed oxygen-regular">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 px-4 bg-stone-100"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 lexend-txt">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto oxygen-regular">
              The principles that guide everything we do at Writex.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="bg-white/80 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4 lexend-txt">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed oxygen-regular">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 px-4 bg-stone-300 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-gray-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-gray-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold text-gray-900 mb-8 lexend-txt">Ready to Start Writing?</h2>
          <p className="text-xl text-gray-600 mb-10 oxygen-regular">
            Join thousands of writers who are already sharing their stories on Writex.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-gray-700 px-10 py-5 rounded-full text-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:bg-gray-50 border-2 border-gray-200"
            onClick={() => navigate("/write")}
          >
            Get Started Today
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gray-600 rounded-full">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold lexend-txt">Writex</span>
          </div>
          <p className="text-gray-300 mb-8 text-lg oxygen-regular">
            Empowering writers to share their stories with the world.
          </p>
          <div className="text-sm text-gray-500 oxygen-regular">
            © 2024 Writex. All rights reserved. Made with ❤️ for the writing community.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default About
