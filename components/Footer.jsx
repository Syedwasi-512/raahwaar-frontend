import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaArrowRight } from "react-icons/fa";

const Footer = () => {
  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "FAQs", href: "/faqs" },
    { name: "Become a Supplier", href: "/become-a-supplier" },
    { name: "Job Opportunities", href: "/career" }
  ];

  const supportLinks = [
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Return & Exchange", href: "/return-exchange-policy" },
    { name: "Size Guide", href: "/size-guides" },
    { name: "Track Your Order", href: "/track-your-order" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy-policy" }
  ];

  const socials = [
    { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
    { icon: FaInstagram, href: "https://instagram.com/raahwaar_store", label: "Instagram" },
    { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
    { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-[#121212] text-[#f5f5f5] font-sans border-t border-white/10">
      <div className="max-w-[1300px] mx-auto px-6 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-5">
            <h1 className="text-xl font-black tracking-[0.2em] uppercase text-white">
              RAAHWAAR
            </h1>
            <p className="text-[#b0b0b0] text-[13px] leading-relaxed max-w-[260px] font-normal">
              The most trusted thrift store for imported premium footwear and curated items. Quality products, delivered to your doorstep.
            </p>
            <div className="flex gap-5 pt-1">
              {socials.map(({ icon: Icon, href, label }) => (
                <a 
                  key={label} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#b0b0b0] hover:text-white transition-colors duration-300"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <nav aria-labelledby="footer-navigation">
            <h2 id="footer-navigation" className="text-sm font-semibold uppercase tracking-widest mb-6 text-white">
              Quick Links
            </h2>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-[#b0b0b0] hover:text-white transition-all duration-200 text-[13px] inline-block hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Customer Care */}
          <nav aria-labelledby="footer-support">
            <h2 id="footer-support" className="text-sm font-semibold uppercase tracking-widest mb-6 text-white">
              Support
            </h2>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-[#b0b0b0] hover:text-white transition-all duration-200 text-[13px] inline-block hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Newsletter */}
          <div className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white">
              Stay in the loop
            </h2>
            <p className="text-[#b0b0b0] text-[13px] leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="relative mt-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full bg-transparent border-b border-white/30 py-2 pr-10 text-[13px] focus:outline-none focus:border-white transition-colors placeholder:text-gray-600"
                required
              />
              <button 
                type="submit" 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                aria-label="Subscribe"
              >
                <FaArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          <div className="space-y-1">
            <p className="text-[#777777] text-[12px] uppercase tracking-wider">
              &copy; {new Date().getFullYear()} RAAHWAAR STORE.
            </p>
            <p className="text-[#555555] text-[11px]">Powered by Premium Quality.</p>
          </div>

          {/* Payment Icons - Clean Shopify Style */}
          <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             {/* Replace these divs with your actual payment SVG icons if available */}
             <div className="px-2 py-1 border border-white/10 rounded bg-white/5 text-[10px] font-bold text-white uppercase tracking-tighter">Visa</div>
             <div className="px-2 py-1 border border-white/10 rounded bg-white/5 text-[10px] font-bold text-white uppercase tracking-tighter">Mastercard</div>
             <div className="px-2 py-1 border border-white/10 rounded bg-white/5 text-[10px] font-bold text-white uppercase tracking-tighter">COD</div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;