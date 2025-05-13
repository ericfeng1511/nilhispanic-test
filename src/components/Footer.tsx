
const Footer = () => {
  return (
    <footer className="bg-nil-navy text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="text-2xl font-bold mb-4">NIL<span className="text-nil-orange">Hispanic</span></h3>
            <p className="text-gray-300 mb-4">
              Empowering Hispanic student-athletes to maximize their NIL opportunities while connecting brands with an untapped demographic.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-nil-orange">
                <span className="sr-only">Instagram</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-nil-orange">
                <span className="sr-only">Twitter</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-nil-orange">
                <span className="sr-only">LinkedIn</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-300 hover:text-nil-orange">About Us</a></li>
              <li><a href="#how-it-works" className="text-gray-300 hover:text-nil-orange">How It Works</a></li>
              <li><a href="#athletes" className="text-gray-300 hover:text-nil-orange">Athletes</a></li>
              <li><a href="#brands" className="text-gray-300 hover:text-nil-orange">For Brands</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-nil-orange">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">
                <span className="block">Email:</span>
                <a href="mailto:contact@nilhispanic.com" className="hover:text-nil-orange">contact@nilhispanic.com</a>
              </li>
              <li className="text-gray-300">
                <span className="block">Phone:</span>
                <a href="tel:+15551234567" className="hover:text-nil-orange">(555) 123-4567</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} NIL Hispanic. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 text-sm hover:text-nil-orange">Privacy Policy</a>
              <a href="#" className="text-gray-400 text-sm hover:text-nil-orange">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
