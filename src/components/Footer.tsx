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
          <div className="mt-4 text-sm text-primary-foreground/60">
            <p>184, South Manthai Street, Pallapatti</p>
            <p>Karur, Tamil Nadu - 639205</p>
            <p className="mt-1">GST: 33AFUFS3776C1ZM</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-primary-foreground/70 text-sm">
            <li><Link to="/shop" className="hover:text-primary-foreground transition-colors">Shop</Link></li>
            <li><Link to="/blog" className="hover:text-primary-foreground transition-colors">Blog</Link></li>
            <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link></li>
            <li><Link to="/my-orders" className="hover:text-primary-foreground transition-colors">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-2 text-primary-foreground/70 text-sm">
            <li>
              <a href="mailto:contact@soluracosmo.com" className="hover:text-primary-foreground transition-colors">
                contact@soluracosmo.com
              </a>
            </li>
            <li>
              <a href="https://wa.me/917857905819" target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors flex items-center gap-1">
                WhatsApp: +91 7857905819
              </a>
            </li>
            <li>Karur, Tamil Nadu, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-12 pt-6 text-center text-primary-foreground/50 text-xs space-y-1">
        <p>© {new Date().getFullYear()} Solura Cosmetics. All rights reserved.</p>
        <p>Built & Marketed By <a href="https://wa.me/917857905819" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-primary-foreground transition-colors font-medium">BrandHype Solutions</a></p>
      </div>
    </div>
  </footer>
);

export default Footer;
