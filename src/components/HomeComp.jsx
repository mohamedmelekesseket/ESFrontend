import React, { useState, useEffect } from 'react'
import ChangeComp from './ChangeComp'
import { Instagram,Shirt,X ,Smartphone,CircleCheckBig ,Youtube,Twitter,BookOpen,Trophy,Mail,MapPin,Phone,Clock ,ArrowRight} from 'lucide-react';
import product2 from '../images/product-32-0.png'
import Accessories from '../images/stoush.jpg'
import veste from '../images/vetment/product-28-3.jpg.png'
import pontalon from '../images/vetment/pontalon-6-0.png'
import Hoodiessoon from '../images/houdies.png'
import { Link, useNavigate } from 'react-router-dom';
import toast,{Toaster}  from 'react-hot-toast'
import vd from '../images/vd.mp4'

import axios from 'axios'

const DROP_DATE = new Date('2025-12-01T00:00:00Z')

const HomeComp = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showcontact,setShowContact]=useState(false)
  const [showSpinner, setShowSpinner] = useState(true); // Spinner state
  localStorage.setItem('selecteMenu', 'Dashbord');
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [Products, setProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [dropCountdown, setDropCountdown] = useState(() => {
  const initial = DROP_DATE.getTime() - Date.now()
    return getCountdownObject(initial)
  })

  const navigate = useNavigate();

  function getCountdownObject(distance) {
    if (distance <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00' }
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    const pad = (value) => value.toString().padStart(2, '0')

    return {
      days: pad(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    }
  }

  const updateCountdown = () => {
    const distance = DROP_DATE.getTime() - Date.now()
    setDropCountdown(getCountdownObject(distance))
  }
const isValid = () => {
  return name && email && phone && message && subject;
};
  
const isNumber = (value) => /^\d+(\.\d+)?$/.test(value); // Optional decimal

const sendMail = async () => {
  console.log(phone, email, message, subject);

  if (!isValid()) {
    toast.error("All fields are required");
    return;
  }

  if (!isNumber(phone)) {
    toast.error("Invalid phone number");
    return;
  }

  if (phone.length !== 8) {
    toast.error("Phone number must be 8 digits long");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.error("Invalid email address");
    return;
  }
  
  // API call
  try {
    const res = await axios.post("http://142.93.171.166/api/Contactez-nous", {
      name,
      subject,
      email,
      message,
      phone,
    });

    if (res.status === 200) {
      toast.success("Message sent successfully ✅");
      setShowContact(false)
      console.log("Message sent successfully");
    }
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error("Failed to send message ❌");
  }
};

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  const getProducts = async () => {
    try {
      const res = await axios.get("http://142.93.171.166/api/GetProduct");
       const featuredProducts = res.data
        .filter(p => p.isFeatured)
        .slice(0, 4);
       setProducts(featuredProducts);
      
    } catch (error) {
      console.log(error);
      
      toast.error(error.response?.data?.message || "Failed to fetch products");
    }
  };

  const Subscribe = async () => {
    if (!email) {
      return toast.error("Email field is required")
    }
    
    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email address")
    }

    setIsSubscribing(true)
    try {
      const res = await axios.post('http://142.93.171.166/api/Subscribe', {
        email,
      })
      
      if (res.status === 201) {                
        setEmail('')
        toast.success('Successfully Subscribed!')
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Server error occurred');
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleCardClick = (index) => {
    setSelectedCard(selectedCard === index ? null : index);
  };

  const getCardWidth = (index) => {
    return selectedCard === index ? "39%" : "15%";
  };
  useEffect(() => {
    if (showcontact) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to restore overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showcontact]);

  useEffect(() => {
    getProducts()
    const timer = setTimeout(() => setShowSpinner(false), 5000);
    return () => clearTimeout(timer);
    
  }, []);

  useEffect(() => {
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='HomeComp' onClick={()=>setShowContact}>
      {showSpinner && (
        <div className="spinner-overlay">
          <div className="spinner" />
          <div className="spinner-message">
            Welcome! Please wait while we load your experience...
          </div>
        </div>
      )}
      
      <ChangeComp/>
      <div className="homediv-0">

        {Products.slice(0, 5).map((prod, index) => {
          // ✅ FIX only this line
          const imagePath = prod?.images?.[0]?.urls?.[0]?.replace(/\\/g, "/");

          return (
            <div 
              key={prod._id}
              className="selectCard"
              style={{
                backgroundImage: `url("http://142.93.171.166/uploads/${imagePath}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: getCardWidth(index),
                cursor: "pointer"
              }}
              onClick={() => navigate(`/PorductSelecte/${prod._id}`, {
                state: {
                  parentCategoryId: prod.categoryId,
                  subcategoryId: prod.subcategoryId,
                  genre: prod.genre,
                }
              })}
              onMouseEnter={() => handleCardClick(index)}
              onMouseLeave={() => handleCardClick(null)}
            >
              <div className="card-info" onClick={(e) => {
                e.stopPropagation();
                navigate(`/PorductSelecte/${prod._id}`, {
                  state: {
                    parentCategoryId: prod.categoryId,
                    subcategoryId: prod.subcategoryId,
                    genre: prod.genre,
                  },
                });
              }}>
                <div className="ci-row">
                  <div className="ci-text">
                    <h4 className="ci-title">{prod.name || 'Product'}</h4>
                    {prod.price && <span className="ci-sep">•</span>}
                    {prod.price && <span className="ci-price">{prod.price} DT</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      </div>
      {/* Categories Section */}
      <div className='categories-section'>
        <div className="categories-header">
          <h2>Collections</h2>
          <p>Find your perfect style</p>
        </div>
        <div className="categories-grid">
          <div className="category-card"onClick={() => {
                    navigate(`/ProductU/Pontalon`, {
                      state: {
                        parentCategoryId: '691607d9f85af644092ddd9f',
                        subcategoryId: null,
                        genre: 'men',
                      }
                    });
                  }}>
            <div className="category-image">
              <img src={pontalon} alt="Hoodies" />
            </div>
            <div className="category-info">
              <h3>Pontalon</h3>
              <p>Comfortable & Stylish</p>
            </div>
          </div>
          <div className="category-card" onClick={() => {
                    navigate(`/ProductU/Blousons et manteaux`, {
                      state: {
                        parentCategoryId: '691607a9f85af644092ddd86',
                        subcategoryId: null,
                        genre: 'men',
                      }
                    });
                  }}>
            <div className="category-image">
              <img src={veste} alt="Hoodies" />
            </div>
            <div className="category-info">
              <h3>Blousons et manteaux</h3>
              <p>Comfortable & Stylish</p>
            </div>
          </div>
          <div className="category-card"  onClick={() => {
                    navigate(`/ProductU/Chaussures`, {
                      state: {
                        parentCategoryId: '69160810f85af644092dddb3',
                        subcategoryId: null,
                        genre: 'men',
                      }
                    });
                  }}>
            <div className="category-image">
              <img src={product2} alt="T-Shirts" />
            </div>
            <div className="category-info">
              <h3>Chaussures</h3>
              <p>Classic & Versatile</p>
            </div>
          </div>
          <div className="category-card"   
                    onClick={() => {
                    navigate(`/ProductU/Accessories`, {
                      state: {
                        parentCategoryId: '69160816f85af644092dddb8',
                        subcategoryId: null,
                        genre: 'men',
                      }
                    });
                  }}
                  >
            <div className="category-image">
              <img  src={Accessories} alt="Accessories" />
            </div>
            <div className="category-info">
              <h3>Accessories</h3>
              <p>Complete Your Look</p>
            </div>
          </div>
        </div>
      </div>
     
      <div className='Featured'>
        <h1>Featured Collection</h1>
        <p>Explore our carefully curated selection of premium streetwear and contemporary fashion</p>
        <div className='FeaturedProductCards'>
          {Products.slice(0, 5).map((prod, index) => 
          <div className='FeaturedProductCard' onClick={() => (navigate(`/PorductSelecte/${prod._id}`, {
                state: {
                  parentCategoryId: prod.categoryId,
                  subcategoryId: prod.subcategoryId,
                  genre: prod.genre,
                }
              }))}>
            <img src={`http://142.93.171.166/${prod.images[0]?.urls[3]}`} alt="" />
            <h2>{prod.name}</h2>
            <h3>{prod.price} TND</h3>

          </div>
          )}
        </div>
      </div>

      {/* About Section */}



      {showcontact && (
        <div className='divcontactHome' >
        <Toaster/>
          <div style={{width:"100%",height:"100%",zIndex:"222",paddingBottom:'39%'}}>
          <ArrowRight size={30} id='ArrowContact' onClick={()=>setShowContact(false)} />
            <h1>Contact-<span style={{color:"#03F7EB"}}>us</span></h1>
            <p>Join our Sport Booking partner network and make your pitch easily accessible – we’d love to hear from you!</p>
            <div style={{display:"flex",justifyContent:"center",gap:"5%"}}>
              <div id='ContacnMobileHide' className='InformationsContact'>
                <h1> <Mail color='#03F7EB'/> Information de contact</h1>
                <h2> <MapPin size={19} color='#03F7EB'/> Adresse</h2>
                <p>123 Avenue du Sport</p>
                <p>75001 Paris, France</p>
                <h2> <Phone size={19} color='#03F7EB'/> Telephone</h2>
                <p>+216 99993286</p>
                <h2> <Mail size={19} color='#03F7EB'/> Email</h2>
                <p>Es@gmail.com</p>
                <h2> <Clock size={19} color='#03F7EB'/> Hours of operation</h2>
                <p>Lun - Ven: 8h00 - 01h00</p>
              </div>
              <div className='InformationsContact' style={{height:"660px"}}>
                <h3>Send us a message</h3>
                <div className='FormContact' id='FormContact1'>
                  <div style={{marginLeft:"4%"}}>
                    <h4>Full name </h4>
                    <input type="text" onChange={(e)=>setName(e.target.value)} placeholder='your name' name="" id='inputsContact1' />
                  </div>
                  <div style={{marginLeft:"4%"}}>
                    <h4>Telephone </h4>
                    <input type="text" id='inputsContact1' onChange={(e)=>setPhone(e.target.value)} name="" placeholder="+216 99993286" />
                  </div>
                </div>
                <div className='FormContact'>
                  <div style={{marginLeft:"4%"}}>
                    <h4>Email</h4>
                    <input id='inputsContact'  onChange={(e)=>setEmail(e.target.value)} placeholder='voter@email.com' type="text"  />
                  </div>
                </div>
                <div className='FormContact'>
                  <div style={{marginLeft:"4%"}}>
                    <h4>subject</h4>
                    <input id='inputsContact' onChange={(e)=>setSubject(e.target.value)} placeholder='subject' type="text" name=""  />
                  </div>
                </div>
                <div className='FormContact'>
                  <div style={{marginLeft:"4%"}}>
                    <h4>Message</h4>
                    <textarea name="" onChange={(e)=>setMessage(e.target.value)} placeholder="Message..."></textarea>
                  </div>
                </div>
                <button onClick={sendMail}><Mail size={17}/> Send Message</button>
              </div>
            </div>
            <div className='rejoindre'>
              <h1>Trendy & Fashion-Focused</h1>
              <h3><CircleCheckBig size={19} color='#03F7EB'/> Showcase your style to a wider audience</h3>
              <h3><CircleCheckBig size={19} color='#03F7EB'/> Easy product management and updates</h3>
              <h3><CircleCheckBig size={19} color='#03F7EB'/> Dedicated brand support team</h3>
              <h3><CircleCheckBig size={19} color='#03F7EB'/> Earn attractive profits</h3>
              <h3><CircleCheckBig size={19} color='#03F7EB'/> Automated secure payments</h3>
            </div>
          </div>
        </div>
      )}

      {/* Drop Announcement Section */}
      <section className="drop-announcement">
        <div className="drop-announcement__visual">
          <img src={Hoodiessoon} alt="Upcoming ES winter drop" className="drop-announcement__visual-bg" />
          <div className="drop-announcement__visual-card">
            <span className="drop-announcement__badge">Don't miss it</span>
            <h3>HIVER</h3>
            <p>Winter Drop</p>
          </div>
        </div>
        <div className="drop-announcement__content">
          <video
          className="drop__background-video"
          id='dropvd'
          src={vd}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        ></video>
          <span className="drop-announcement__label">Exclusive Drop</span>
          <h2>Coming Soon</h2>
          <p>
            Discover the Hiver capsule engineered for cold city nights. Tailored silhouettes,
            insulated linings, and signature ES finishes crafted in limited quantities.
          </p>
          <div className="drop-announcement__countdown">
            <div>
              <strong>{dropCountdown.days}</strong>
              <span>Days</span>
            </div>
            <div>
              <strong>{dropCountdown.hours}</strong>
              <span>Hours</span>
            </div>
            <div>
              <strong>{dropCountdown.minutes}</strong>
              <span>Min</span>
            </div>
            <div>
              <strong>{dropCountdown.seconds}</strong>
              <span>Sec</span>
            </div>
          </div>
          <div className="drop-announcement__actions">
            <button type="button" className="drop-announcement__secondary" onClick={() => setShowContact(true)}>
              Notify Me
            </button>
            <button type="button" className="drop-announcement__secondary" onClick={() => navigate('/ProductU/Hoodies')}>
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <div className='Subscribe-section'>
        <Toaster/>
        <div className="Subscribe-content">
          <h2>Subscribe to our newletter</h2>
          <p>Stay informed about Es Brand's news, special offers and trends!</p>
          <form className="Subscribe-form" onSubmit={e => e.preventDefault()}>
            <input 
              type="email" 
              value={email}
              onChange={(e)=> setEmail(e.target.value)} 
              placeholder="Votre email" 
              required 
              disabled={isSubscribing}
            />
            <button 
              type="submit" 
              onClick={Subscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

        <footer className="footer">
          <div className="footer-sections">
            <div className="footer-col">
              <h4>About ES</h4>
              <ul>
                <Link to='/AboutEs' className='footerLinks' >Our Story</Link>
                <Link to='/AboutEs' className='footerLinks'>Careers</Link>
                <Link to='/AboutEs' className='footerLinks'>Sustainability</Link>
                <Link to='/AboutEs' className='footerLinks'>Store Locator</Link>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Customer Service</h4>
              <ul>
                <li onClick={()=>setShowContact(!showcontact)}>Contact Us</li>
                <li>Shipping & Returns</li>
                <li>Size Guide</li>
                <li>FAQ</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Shop</h4>
              <ul>
                <li>New Arrivals</li>
                <li onClick={() => {
                    navigate(`/ProductU/Accessories`, {
                      state: {
                        parentCategoryId: '69160810f85af644092dddb3',
                        subcategoryId: '6916099bf85af644092dddf9',
                        genre: 'men',
                      }
                    });
                  }} >Baggy</li>
                <li onClick={() => {
                    navigate(`/ProductU/Accessories`, {
                      state: {
                        parentCategoryId: '691607d9f85af644092ddd9f',
                        subcategoryId: '69160937f85af644092dddec',
                        genre: 'men',
                      }
                    });
                  }} >Basketball</li>
                <li onClick={() => {
                    navigate(`/ProductU/Accessories`, {
                      state: {
                        parentCategoryId: '691607a9f85af644092ddd86',
                        subcategoryId: '691614d6f85af644092de02c',
                        genre: 'men',
                      }
                    });
                  }}>similicuir</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Stay Connected</h4>

              <div className="social-icons">
                <Mail />
                <Instagram />
                <Twitter />
                <Youtube />
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 ES. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </footer>
    </div>
  )
}

export default HomeComp