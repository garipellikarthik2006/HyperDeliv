import { Home, Briefcase, Printer, Store, User, ArrowRight, Users, ShieldCheck, User as UserIcon, Store as ShopIcon, Shield, Sparkles, Zap, ShieldCheck as ShieldIcon, Star, TrendingUp, Clock, MapPin } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import heroImage from "@/assets/hero-delivery.svg.png";

const serviceCards = [
  {
    icon: UserIcon,
    title: "User",
    desc: "Order food, printouts, and more. Get everything delivered to your hostel room with our premium logistics service.",
    buttonText: "Sign Up",
    route: "/login/user",
    iconColor: "text-slate-700",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    icon: Store,
    title: "Join as Vendor", 
    desc: "Register your home kitchen or print shop. Start serving the campus community with our reliable delivery network.",
    buttonText: "Sign Up",
    route: "/login/vendor",
    iconColor: "text-slate-700",
    gradient: "from-green-500 to-teal-600"
  },
  {
    icon: ShieldIcon,
    title: "Admin",
    desc: "Manage the entire HyperDeliv platform. Monitor users, vendors, and deliveries with advanced analytics.",
    buttonText: "Sign Up", 
    route: "/login/admin",
    iconColor: "text-slate-700",
    gradient: "from-orange-500 to-red-600"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, user, logout } = useAuth();

  // No automatic redirect logic - always show landing page on root URL
  // Users can navigate manually through the UI
  
  return (
    <div className="animate-fade-in bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Delivery rider in a city"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative z-10 w-full px-6 text-center">
          <h1 className="mb-4 text-3xl font-extrabold uppercase leading-tight tracking-tight text-primary-foreground md:text-5xl">
            Localized Fast Delivery: Modernizing a Legacy
          </h1>
          <p className="mb-6 text-base text-primary-foreground/80 md:text-lg">
            HyperDeliv connects Users, offices, and local vendors with ultra-fast campus delivery for food, printouts, and more.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-white">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-white">5-Star Service</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-sm text-white">Growing Fast</span>
            </div>
          </div>
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 rounded-md bg-[#FF8C00] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#FF7700] hover:shadow-lg hover:shadow-orange-200 transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            EXPLORE FEATURES
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      
      {/* Professional Service Cards */}
      <section id="services" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-orange-400"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-500" />
              <h2 className="text-5xl font-bold text-slate-900 relative inline-block">
                LOGIN
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></span>
              </h2>
              <Shield className="w-6 h-6 text-orange-500" />
            </div>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-orange-400"></div>
          </div>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto font-medium">
            Join our premium logistics platform and experience seamless delivery services tailored to your needs
          </p>
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>24/7 Service</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4" />
              <span>Hyderabad Focus</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Star className="w-4 h-4" />
              <span>Trusted Platform</span>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serviceCards.map((card, index) => (
              <div
                key={card.title}
                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer relative flex flex-col h-full"
                onClick={() => navigate(card.route)}
                style={{ backgroundImage: card.gradient, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover' }}
>
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-amber-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{zIndex: 0}} />

                {/* Card Header with Icon */}
                <div className="p-8 pb-6 flex-grow" style={{position: 'relative', zIndex: 1}}>
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-50 group-hover:bg-slate-100 transition-colors duration-300">
                    <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-[#1a202c] mb-4">{card.title}</h3>
                    <p className="text-slate-600 leading-relaxed mb-8">{card.desc}</p>
                  </div>
                </div>
                
                {/* Card Footer with Button */}
                <div className="px-8 pb-8 mt-auto" style={{position: 'relative', zIndex: 1}}>
                  <button className="w-full bg-[#FF8C00] text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:bg-[#e07800] hover:shadow-lg flex items-center justify-center gap-2">
                    {card.buttonText}
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="text-3xl font-bold text-slate-900">10,000+</div>
              </div>
              <div className="text-slate-600">Active Users</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="text-3xl font-bold text-slate-900">500+</div>
              </div>
              <div className="text-slate-600">Partner Vendors</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="text-3xl font-bold text-slate-900">99.9%</div>
              </div>
              <div className="text-slate-600">On-Time Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
