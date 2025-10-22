import Link from "next/link"
import Image from "next/image"
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 p-4 text-center py-4 px-6 w-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
            <Image src="/logorb.png" alt="Linq Logo" width={80} height={80} className="mb-4 object-contain opacity-80" />
            <p className="text-sm">
              Linq is a modern, real-time chat application designed for instant and secure global communication.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm hover:text-white transition">About Us</Link></li>
              <li><Link href="/features" className="text-sm hover:text-white transition">Features</Link></li>
              <li><Link href="/privacy" className="text-sm hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <p className="text-sm">Email: <a href="mailto:support@linqchat.com" className="hover:text-white transition">support@linqchat.com</a></p>
            <p className="text-sm mt-2">Follow Us:</p>
            <span className="flex  justify-center items-end space-x-6 mt-2">
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition"><FaXTwitter /></a>
              <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition"><FaLinkedin/></a>
            </span>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-4 pt-4 text-center text-sm container mx-auto">
        <p>
          &copy; {new Date().getFullYear()} Linq Corp. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
};