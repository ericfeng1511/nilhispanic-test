
import { Button } from "@/components/ui/button";
import { ContactForm } from "./ContactForm";

const ContactSection = () => {

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">GET IN TOUCH</h2>
          <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg">
            Ready to learn more about how NIL Hispanic can help your brand connect with Hispanic student-athletes? Let's start a conversation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-nil-navy rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-nil-orange mb-1">Email</p>
                <p>contact@nilhispanic.com</p>
              </div>
              <div>
                <p className="font-semibold text-nil-orange mb-1">Phone</p>
                <p>(555) 123-4567</p>
              </div>
              <div>
                <p className="font-semibold text-nil-orange mb-1">Follow Us</p>
                <div className="flex space-x-4 mt-2">
                  <a href="#" className="text-white hover:text-nil-orange">
                    <span className="sr-only">Instagram</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
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
                  <a href="#" className="text-white hover:text-nil-orange">
                    <span className="sr-only">Twitter</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
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
                  <a href="#" className="text-white hover:text-nil-orange">
                    <span className="sr-only">LinkedIn</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
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
            </div>
            
            <div className="mt-10">
              <h4 className="text-xl font-bold mb-4">Schedule a Meeting</h4>
              <p className="mb-4">Interested in learning more? Schedule a virtual consultation with our team to discuss how NIL Hispanic can help your brand.</p>
              <Button className="bg-nil-orange hover:bg-opacity-90 text-white">Book Meeting</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-6 text-nil-navy">Send Us a Message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
