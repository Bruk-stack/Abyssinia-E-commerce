"use client";

import { useState, useEffect, useRef } from "react";
import { Send, CheckCircle, Loader2, Sparkles, X, Wand2 } from "lucide-react";

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

  const [suggestion, setSuggestion] = useState<string>("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!formData.message || formData.message.length < 20) {
      setSuggestion("");
      setShowSuggestion(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      setSuggestionLoading(true);
      setSuggestionError(null);

      try {
        const res = await fetch("/api/feedback-suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: formData.message }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to get suggestions");

        if (data.success && data.suggestion) {
          setSuggestion(data.suggestion);
          setShowSuggestion(true);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("❌ Vocabulary suggestion error:", err);
          setSuggestionError("Could not load suggestions");
        }
      } finally {
        setSuggestionLoading(false);
      }

      return () => controller.abort();
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setFormState("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setSuggestion("");
    setShowSuggestion(false);

    setTimeout(() => setFormState("idle"), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "message" && showSuggestion) {
      setShowSuggestion(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      setFormData((prev) => ({ ...prev, message: suggestion }));
      setSuggestion("");
      setShowSuggestion(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formData.message.length}/500 characters
                  </p>

                  {formData.message.length >= 20 &&
                    !showSuggestion &&
                    !suggestionLoading && (
                      <button
                        type="button"
                        onClick={() => {
                          setSuggestionLoading(true);
                          const current = formData.message;
                          setFormData((prev) => ({ ...prev, message: "" }));
                          setTimeout(() => {
                            setFormData((prev) => ({
                              ...prev,
                              message: current,
                            }));
                          }, 10);
                        }}
                        className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                      >
                        <Wand2 className="w-3 h-3" />
                        Improve wording
                      </button>
                    )}
                </div>

                {showSuggestion && (
                  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-orange-800 dark:text-orange-300 mb-1">
                          💡 Suggested improvement:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {suggestionLoading ? (
                            <span className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Polishing your message...
                            </span>
                          ) : suggestionError ? (
                            <span className="text-red-600 dark:text-red-400">
                              {suggestionError}
                            </span>
                          ) : (
                            suggestion
                          )}
                        </p>

                        {suggestion && !suggestionLoading && (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={applySuggestion}
                              className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/60 transition flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Use this
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowSuggestion(false);
                                setSuggestion("");
                              }}
                              className="text-xs px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
