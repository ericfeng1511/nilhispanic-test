import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    toast.success("Thank you for your message. We'll be in touch soon!");
    setFormData({
      name: "",
      email: "",
      phone: "",
      title: "",
      message: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block mb-2 text-nil-navy font-semibold">
          Name <span className="text-nil-orange">*</span>
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          required
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block mb-2 text-nil-navy font-semibold">
          Email <span className="text-nil-orange">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your email address"
          required
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block mb-2 text-nil-navy font-semibold">
          Phone
        </label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Your phone number"
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="title" className="block mb-2 text-nil-navy font-semibold">
          Title/Company
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Your job title and company"
          className="w-full"
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block mb-2 text-nil-navy font-semibold">
          Message
        </label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="How can we help you?"
          className="w-full"
          rows={4}
        />
      </div>
      
      <Button type="submit" className="btn-primary">Send Message</Button>
    </form>
  );
};
