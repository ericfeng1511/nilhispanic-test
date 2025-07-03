import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Paperclip, X } from "lucide-react";

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    message: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    console.log("Attachments:", attachments);
    toast.success("Thank you for your message. We'll be in touch soon!");
    setFormData({
      name: "",
      email: "",
      phone: "",
      title: "",
      message: "",
    });
    setAttachments([]);
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
      
      <div>
        <label htmlFor="attachments" className="block mb-2 text-nil-navy font-semibold">
          Attachments
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="attachments" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Paperclip className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (MAX. 10MB each)</p>
              </div>
              <input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
          </div>
          
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-nil-navy">Selected files:</p>
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Button type="submit" className="btn-primary">Send Message</Button>
    </form>
  );
};
