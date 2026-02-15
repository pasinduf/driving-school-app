import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="contact" className="bg-gray-900 text-white pt-10 pb-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-8">
                    {/* Brand Column */}
                    <div>
                        <Link to="/" className="text-3xl font-bold text-white tracking-tight inline-block mb-6">
                            DRIVING<span className="text-primary">SCHOOL</span>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Empowering new drivers with confidence and safety skills for a lifetime of journey. Join us today.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-primary pl-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block flex items-center">
                                    <ArrowRight size={14} className="mr-2 text-primary" /> Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/services" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block flex items-center">
                                    <ArrowRight size={14} className="mr-2 text-primary" /> Services
                                </Link>
                            </li>
                            <li>
                                <Link to="/booking" className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block flex items-center">
                                    <ArrowRight size={14} className="mr-2 text-primary" /> Book Lesson
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-primary pl-4">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="text-primary mt-1 mr-4 shrink-0" size={20} />
                                <span className="text-gray-400">123 Driving Street, Safe Town, NSW 2000, Australia</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="text-primary mr-4 shrink-0" size={20} />
                                <span className="text-gray-400">(02) 1234 5678</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="text-primary mr-4 shrink-0" size={20} />
                                <span className="text-gray-400">info@drivingschool.com.au</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    {/* <div>
                        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-l-4 border-primary pl-4">Newsletter</h3>
                        <p className="text-gray-400 mb-4">Subscribe to get latest updates and offers.</p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your Email Address"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-primary text-gray-300 placeholder-gray-500"
                            />
                            <button className="w-full px-4 py-3 bg-primary text-white font-bold rounded hover:bg-red-700 transition-colors uppercase tracking-widest">
                                Subscribe
                            </button>
                        </form>
                    </div> */}
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Driving School. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
