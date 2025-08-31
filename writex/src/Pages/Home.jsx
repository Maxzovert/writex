import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { DotPattern } from "../components/magicui/dot-pattern";
import { LineShadowText } from "../components/magicui/line-shadow-text";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { ArrowRight, PenTool, Users, Zap, Star, CheckCircle, ArrowUpRight, Sparkles, BookOpen, Globe, Heart, Rocket, Flame, Crown } from "lucide-react";

const Home = () => {

  const Navigate = useNavigate()

  const handleClick = () => {
    Navigate("/SignUp")
  }

  const handleGetStarted = () => {
    Navigate("/SignUp")
  }

  const handleLearnMore = () => {
    Navigate("/About")
  }

  const features = [
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Sick Writing Tools",
      description: "Level up your writing game with our powerful editor and formatting options"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Vibing Community",
      description: "Connect with fellow writers who get your vibe and share your energy"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Write, edit, and publish in seconds - no more waiting around"
    }
  ];

  const vibes = [
    "No boring templates",
    "Express yourself freely",
    "Mobile-first design",
    "24/7 community vibes",
    "Free forever, no cap",
    "Setup in under 2 mins"
  ];

  const whyChoose = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Made with Love",
      description: "Built by writers who actually use the platform"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Always Evolving",
      description: "We're constantly adding new features based on your feedback"
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Premium Quality",
      description: "Professional tools without the corporate BS"
    }
  ];

  const earlyAdopters = [
    {
      name: "Alex",
      role: "Creative Writer",
      avatar: "A",
      content: "WriteX is literally everything I needed. Clean, simple, and actually fun to use. No more overcomplicated writing apps!",
      vibe: "🔥"
    },
    {
      name: "Jordan",
      role: "Content Creator",
      avatar: "J",
      content: "Finally, a platform that doesn't make me feel like I'm writing a corporate report. Love the community vibes!",
      vibe: "✨"
    }
  ];

  return (
    <>
      <div className="relative h-[800px] w-full overflow-hidden flex justify-center bg-stone-200 border-b-4 rounded-b-4xl">
        <div className="absolute inset-0 z-0">
          <DotPattern />
        </div>
        <div className="flex items-center justify-center flex-col relative z-10">
          <div className="text-9xl mt-[200px]">
            Write<LineShadowText>X</LineShadowText>
          </div>
            <p>Lowkey deep, highkey real — post what hits different</p>
          <InteractiveHoverButton className="mt-8" onClick={handleClick}>
            Go To Dashboard
          </InteractiveHoverButton>
        </div>
      </div>

      {/* Gen-Z Focused Landing Page */}
      
      {/* Hero Section 2 */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Flame className="w-4 h-4" />
              <span>Fresh & New - Join the Wave</span>
            </div>
                         <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
               Write What You
               <br />
               <span className="bg-gradient-to-r from-gray-700 via-gray-800 to-black bg-clip-text text-transparent">
                 Actually Feel
               </span>
             </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Stop writing for algorithms. Start writing for humans. 
              Share your thoughts, stories, and vibes with people who actually care.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-10 py-6 text-lg h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Writing Now
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              onClick={handleLearnMore}
              size="lg"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-10 py-6 text-lg h-auto rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              See What's Up
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No credit card needed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Free forever, fr fr</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Setup in 2 mins</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Gen-Z Style */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <br />
              <span className="text-gray-600">Slay Your Writing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tools that actually make sense and don't overcomplicate things
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-3xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                     <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-black rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vibes Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why WriteX is Actually Different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No corporate speak, just real talk
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vibes.map((vibe, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                                 <div className="w-6 h-6 bg-gradient-to-r from-gray-600 to-black rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{vibe}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Built Different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're not just another writing platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyChoose.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Adopters Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What Early Adopters Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real feedback from people who've been here since day one
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {earlyAdopters.map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-3xl border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                                             <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{user.name}</div>
                        <div className="text-gray-600">{user.role}</div>
                      </div>
                    </div>
                    <div className="text-3xl">{user.vibe}</div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed text-lg italic">
                    "{user.content}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Gen-Z Style */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Start
              <br />
                             <span className="bg-gradient-to-r from-gray-300 via-gray-400 to-white bg-clip-text text-transparent">
                 Your Journey?
               </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the early adopters and help shape the future of writing. 
              No pressure, just vibes and creativity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 px-12 py-6 text-xl h-auto rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-2 group"
              >
                Let's Go! 🚀
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleLearnMore}
                size="lg"
                className="border-2 border-gray-600 hover:border-gray-500 text-black px-12 py-6 text-xl h-auto rounded-2xl hover:bg-white/10 transition-all duration-300 group"
              >
                Tell Me More
                <ArrowUpRight className="ml-3 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </Button>
            </div>

            <div className="text-gray-400 text-sm">
              <p>✨ No credit card • 🚀 Setup in 2 mins • 💜 Free forever</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Matching Other Components */}
      <footer className="bg-stone-200 text-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">WriteX</span>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed max-w-md">
                Empowering the next generation of writers to share their authentic voice. 
                No corporate BS, just real creativity.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Product</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="hover:text-black transition-colors duration-300 cursor-pointer">Features</li>
                <li className="hover:text-black transition-colors duration-300 cursor-pointer">Pricing</li>
                <li className="hover:text-black transition-colors duration-300 cursor-pointer">API</li>
                <li className="hover:text-black transition-colors duration-300 cursor-pointer">Integrations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Company</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="hover:text-black transition-colors duration-300 cursor-pointer">About</li>
                <li className="hover:text-black transition-colors duration-300 cursor-pointer">Blog</li>
                <li className="hover:text-black transition-colors duration-300 cursor-pointer">Careers</li>
                <li className="hover:text-black transition-colors duration-300 cursor-pointer">Press</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-8 text-center text-gray-600">
            <p>&copy; 2024 WriteX. Built with ❤️ for the next generation of writers.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
