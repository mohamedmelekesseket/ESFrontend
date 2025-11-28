import React,{useState,useEffect,useMemo} from 'react'
import back1 from '../images/hero-6.jpg'
import back2 from '../images/hero-4.jpg'
import back4 from '../images/hero-2.jpg'
import back3 from '../images/hero-5.jpg'
import EsL from '../images/Es4.png'
import { Menu,UserRound,Smartphone,Footprints ,Shirt ,X ,LogOut,User,Mail, CreditCard, ArrowLeft ,Truck, MapPin,ShoppingBag,ShieldUser,Edit2,Trash2 ,Dot,MoveRight,MoveLeft   } from 'lucide-react';
import { Link, useNavigate,useLocation  } from 'react-router-dom';

import mobile1 from '../images/vetment/pontalon-6-0.png'
import mobile2 from '../images/vetment/pontalon-5-1.png'
import mobile3 from '../images/product-32-0.png'
import mobile4 from '../images/Chaussures/baskets-14-1.png'


const desktopBackgrounds = [back1, back3, back2, back4];
const mobileBackgrounds = [mobile1, mobile2, mobile3,mobile4];

const ChangeComp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const backgrounds = isMobile ? mobileBackgrounds : desktopBackgrounds;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [backgrounds.length]);
  const navigate = useNavigate();
    const items = [
    { icon: <MapPin size={18} style={{ marginRight: "6px" }} />, text: "Livraison rapide sur toute la Tunisie" },
    { icon: <Mail size={18} style={{ marginRight: "6px" }} />, text: "EsBrand@gmail.com" },
    { icon: <CreditCard size={18} style={{ marginRight: "6px" }} />, text: "Tous les paiements sont acceptés" },
    { icon: <Truck size={18} style={{ marginRight: "6px" }} />, text: "Livraison gratuite à partir de 120 DT" }
  ];
  return (
    <div className='ChangeComp'>
       {location.pathname === "/" && (
        <div className="InfoBar">
          <div className="scrolling-wrapper">
            {items.map((item, i) => (
              <div className="scrolling-item" key={i}>
                {item.icon} {item.text}
              </div>
            ))}
            {items.map((item, i) => (
              <div className="scrolling-item" key={`dup-${i}`}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className='fade-slides'>
        {backgrounds.map((src, index) => (
          <div
            key={index}
            className={`fade-slide ${index === currentIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `url('${src}')`,
              backgroundAttachment: isMobile ? 'scroll' : 'fixed',
            }}
          />
        ))}
      </div>
      
      <div className='hero-overlay' />
        <div className='hero-content'>
          <img src={EsL} className='hero-title' alt='Brand logo' />
          <p className='hero-subtitle'>URBAN STREETWEAR COLLECTION</p>
          <div className='hero-divider'>
            {Array(7).fill(null).map((_, i) => <span key={i} />)}
          </div>
        </div>
    </div>
  )
}


export default ChangeComp