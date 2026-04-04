"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";

export function ContactForm() {
  const [formState, setFormState] = useState<"idle" | "sending" | "success">(
    "idle",
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");

    // TODO: Replace with your actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setFormState("success");
    setFormData({ name: "", email: "", subject: "", message: "" });

    // Reset success state after 5 seconds
    setTimeout(() => setFormState("idle"), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
            GET IN TOUCH
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
            Let's Start a Conversation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Share your thoughts, questions, or feedback. Our team reads every
            message and responds personally.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-800 shadow-sm">
          {formState === "success" ? (
            // ✅ Success State
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Message Sent!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for reaching out. We'll get back to you within 24
                hours.
              </p>
              <button
                onClick={() => setFormState("idle")}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium text-sm"
              >
                Send another message →
              </button>
            </div>
          ) : (
            // 📝 Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name + Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Order inquiry, styling help, or general feedback"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
                  {formData.message.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  formState === "sending" ||
                  !formData.name ||
                  !formData.email ||
                  !formData.message
                }
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-md hover:shadow-orange-500/30 disabled:shadow-none transition-all duration-200 active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed"
              >
                {formState === "sending" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              {/* Trust Note */}
              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                We respect your privacy. Your information is never shared or
                sold.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
