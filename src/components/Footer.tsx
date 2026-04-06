import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-20">
    <div className="container py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3 className="font-display text-3xl font-semibold mb-4">SOLURA</h3>
          <p className="text-primary-foreground/70 max-w-sm leading-relaxed">
            Premium, chemical-free cosmetics crafted for your daily glow. Born from a passion for natural beauty and a startup pitch competition.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-primary-foreground/70 text-sm">
            <li><Link to="/shop" className="hover:text-primary-foreground transition-colors">Shop</Link></li>
            <li><Link to="/blog" className="hover:text-primary-foreground transition-colors">Blog</Link></li>
            <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-2 text-primary-foreground/70 text-sm">
            <li>hello@soluracosmo.com</li>
            <li>Hyderabad, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-12 pt-6 text-center text-primary-foreground/50 text-xs">
        © {new Date().getFullYear()} Solura Cosmetics. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
