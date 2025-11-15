import React,{useState,useEffect,useMemo,useRef} from 'react'
import EsL from '../images/Es42.png'
import vd from '../images/vd.mp4'
import { Shirt, Award, Leaf, Users,Mail,SlidersHorizontal, Eraser, X, Truck, ShieldCheck, RefreshCcw, Sparkles  } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';

const AboutComp = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // 👇 Add this to make sure page opens at top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error('Ajoutez votre email pour rejoindre la prochaine drop.');
      return;
    }
    toast.success('Vous êtes sur la liste. Rendez-vous pour la prochaine drop !');
    setNewsletterEmail('');
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const values = [
    { icon: <Shirt size={28} color="#fff" />, title: "Timeless Design", text: "We create pieces that transcend trends, designed to be worn and loved for years to come." },
    { icon: <Award size={28} color="#fff" />, title: "Quality First", text: "Every stitch, every seam is executed with precision and care by skilled artisans." },
    { icon: <Leaf size={28} color="#fff" />, title: "Sustainable Practice", text: "We're committed to responsible production that respects both people and planet." },
    { icon: <Users size={28} color="#fff" />, title: "Community Driven", text: "Built on the values of transparency, authenticity, and connection with our customers." },
  ];
  return (
    <div className='AboutComp'>
        <div className='AboutComp1'>
          <video
            className="AboutComp1__background-video"
            src={vd}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          ></video>
            <img src={EsL} alt="" />
            <h3>Where timeless design meets modern craftsmanship</h3>
            <p>
                We believe in creating pieces that transcend fleeting trends.
                Each garment is thoughtfully designed to become an essential part of your wardrobe,
                crafted with meticulous attention to detail and uncompromising quality.
            </p>
            <p>
                From sustainable materials to timeless silhouettes, 
                Es represents a commitment to conscious fashion that honors both style and substance.
            </p>
        </div>
        <div className='AboutComp2'>
            <h2>Our story</h2>
            <p>
                Es was born from a simple belief: that exceptional clothing should be both timeless and accessible.
                Founded in 2024, we've dedicated ourselves to creating pieces that transcend seasonal trends,
                focusing instead on quality, comfort, and enduring style
            </p>
            <p>
                Every garment we create is a testament to our commitment to craftsmanship.
                We work with carefully selected materials, sustainable practices,
                and skilled artisans who share our vision for quality that lasts.
            </p>
            <p>
                We believe that true luxury lies in simplicity—in the perfect cut,
                the right fabric, and the attention to detail that transforms everyday pieces into wardrobe essentials.
            </p>
        </div>
        <div className="values-section" ref={ref}>
            <motion.h2
                className="values-title"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
            >
                Our Values
            </motion.h2>
            <div className="values-grid">
                {values.map((val, i) => (
                <motion.div
                    key={i}
                    className="value-card"
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                >
                    <motion.div
                    className="value-icon"
                    whileHover={{
                        rotate: 360,
                        transition: { duration: 0.8, ease: "easeInOut" },
                    }}
                    >
                    {val.icon}
                    </motion.div>
                    <h3 className="value-heading">{val.title}</h3>
                    <p className="value-text">{val.text}</p>
                </motion.div>
                ))}
            </div>
        </div>
        <footer className="products-footer">
          <div className="products-footer__inner">
            <section className="products-footer__intro">
              <span className="products-footer__label">ESBRAND DENIM LAB</span>
              <h2>Premium denim engineered for movement.</h2>
              <p>
                Chaque capsule est développée en séries limitées avec des matières flexibles,
                des coutures renforcées et une silhouette pensée pour la ville comme pour la scène.
              </p>
              <div className="products-footer__badges">
                <div className="products-footer__badge">
                  <Sparkles size={18} />
                  <div>
                    <h4>Limited Drops</h4>
                    <span>Moins de 300 pièces par release</span>
                  </div>
                </div>
                <div className="products-footer__badge">
                  <ShieldCheck size={18} />
                  <div>
                    <h4>Finitions premium</h4>
                    <span>Garantie qualité 30 jours</span>
                  </div>
                </div>
              </div>
            </section>
  
            <section className="products-footer__services">
              <h3>Pourquoi choisir ESBrand</h3>
              <div className="products-footer__services-grid">
                <article>
                  <Truck size={24} />
                  <h4>Livraison express</h4>
                  <p>Expédition 48h partout en Tunisie avec suivi en temps réel.</p>
                </article>
                <article>
                  <RefreshCcw size={24} />
                  <h4>Échanges faciles</h4>
                  <p>Échange de taille offert sous 14 jours, sans paperasse.</p>
                </article>
                <article>
                  <ShieldCheck size={24} />
                  <h4>Paiement sécurisé</h4>
                  <p>Transactions protégées et assistance client dédiée.</p>
                </article>
              </div>
            </section>
  
            <section className="products-footer__newsletter">
              <h3>Rejoignez la Denim Drop</h3>
              <p>
                Accédez en avant-première aux sorties limitées, aux réassorts secrets et aux events privés.
              </p>
              <form className="products-footer__form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                />
                <button type="submit">
                  <Sparkles size={16} />
                  Rejoindre la liste
                </button>
              </form>
              <small>On n’envoie que l’essentiel, promis.</small>
            </section>
          </div>
  
          <div className="products-footer__bottom">
            <span>© {new Date().getFullYear()} ESBrand — Denim, streetwear & confiance.</span>
            <div className="products-footer__bottom-links">
              <button type="button" onClick={scrollToTop}>Retour en haut</button>
              <span>•</span>
              <span>Conçu à Tunis</span>
            </div>
          </div>
        </footer>

    </div>
  )
}

export default AboutComp