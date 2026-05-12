import { useNavigate } from "react-router-dom";
import { User, Store, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";

const Login = () => {
  const navigate = useNavigate();

  const handleNavigation = (route) => {
    console.log("Navigating to:", route);
    try {
      navigate(route);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const loginOptions = [
    {
      id: "user",
      title: "User",
      description: "Order food, printouts, and more. Get everything delivered to your hostel room with our premium logistics service.",
      route: "/login/user",
      color: "bg-blue-500 hover:bg-blue-600",
      iconColor: "text-blue-500"
    },
    {
      id: "vendor", 
      title: "Vendor",
      description: "Register your home kitchen or print shop. Start serving the campus community with our reliable delivery network.",
      route: "/login/vendor",
      color: "bg-green-500 hover:bg-green-600",
      iconColor: "text-green-500"
    },
    {
      id: "admin",
      title: "Admin", 
      description: "Manage entire HyperDeliv platform. Monitor users, vendors, and deliveries with advanced analytics.",
      route: "/login/admin",
      color: "bg-orange-500 hover:bg-orange-600",
      iconColor: "text-orange-500"
    }
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">LOGIN</h1>
              <p className="text-gray-600">Choose your role to access HyperDeliv platform</p>
            </div>

            {/* Role Cards - Horizontal Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {loginOptions.map((option, index) => {
                const icons = {
                  user: User,
                  vendor: Store,
                  admin: Briefcase
                };
                const Icon = icons[option.id];
                
                return (
                  <div
                    key={option.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => handleNavigation(option.route)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon on Left */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                          <Icon className={`w-8 h-8 ${option.iconColor}`} />
                        </div>
                      </div>
                      
                      {/* Content on Right */}
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{option.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                        
                        {/* Get Started Button */}
                        <button className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${option.color}`}>
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;
