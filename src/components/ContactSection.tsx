import { Button } from "@/components/ui/button";
import { Mail, /* Phone, */ MapPin } from 'lucide-react';
// import { SchedulingModal } from "./SchedulingModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm } from "./ContactForm";

const ContactSection = () => {

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-gradient">GET IN TOUCH</h2>
          <p className="text-nil-dark-gray max-w-3xl mx-auto text-lg">
            Ready to learn more about how ÑILHispanic™ can help your brand connect with Hispanic student-athletes? Let's start a conversation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-nil-navy rounded-lg p-6 md:p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-nil-orange mb-1">Email</p>
                <p>contact@nilhispanic.com</p>
              </div>
              {/* <div>
                <p className="font-semibold text-nil-orange mb-1">Phone</p>
                <p>(555) 123-4567</p>
              </div> */}
              <div>
                <p className="font-semibold text-nil-orange mb-1">Follow Us</p>
                <div className="flex items-center space-x-4 mt-2">
                  <a href="https://www.instagram.com/NILHISPANIC" target="_blank" rel="noopener noreferrer" className="text-white hover:text-nil-orange">
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
                  <a href="https://www.tiktok.com/@NILHISPANIC" target="_blank" rel="noopener noreferrer" className="text-white hover:text-nil-orange">
                    <span className="sr-only">TikTok</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg"
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM16.9723 10.8705C17.0707 10.8698 17.1692 10.8648 17.2676 10.8554L17.269 10.8547V8.85796C15.7233 8.7452 14.4807 7.54139 14.3184 6H12.5996L12.5816 14.3771C12.5816 15.4049 11.6737 16.2144 10.6459 16.2144C9.61878 16.2144 8.7856 15.3819 8.7856 14.3541C8.7856 13.327 9.61806 12.4938 10.6459 12.4938C10.701 12.4938 10.7545 12.5012 10.808 12.5085C10.8291 12.5114 10.8502 12.5143 10.8714 12.5168V10.7197C10.8503 10.7185 10.8292 10.717 10.808 10.7156C10.7543 10.7119 10.7005 10.7082 10.6459 10.7082C8.63189 10.7082 7 12.3401 7 14.3541C7 16.3681 8.63189 18 10.6459 18C12.6599 18 14.2918 16.3674 14.2918 14.3541V9.4218C14.8844 10.3261 15.8921 10.8705 16.9723 10.8705Z"></path>
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/nil-hispanic/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-white hover:text-nil-orange">
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
            </div>
            
            <div className="mt-10">
              <h4 className="text-xl font-bold mb-4">Schedule a Meeting</h4>
              <p className="mb-4">Interested in learning more? Schedule a virtual consultation with our team to discuss how ÑIL Hispanic can help your brand.</p>
              {/* <SchedulingModal 
                title="Book a Meeting"
                description="Let's discuss how ÑIL Hispanic can help you connect with Hispanic student-athletes and grow your brand."
                source="About Page - Book Meeting Button"
              >
                <Button className="bg-nil-orange hover:bg-opacity-90 text-white w-full h-12 touch-manipulation">Book Meeting</Button>
              </SchedulingModal> */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-nil-orange hover:bg-opacity-90 text-white w-full h-12 touch-manipulation">Book Meeting</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Contact Us</DialogTitle>
                    <DialogDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </DialogDescription>
                  </DialogHeader>
                  <ContactForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="w-full">
            <h3 className="text-2xl font-bold mb-6 text-nil-navy">Send Us a Message</h3>
            <div className="w-full">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
