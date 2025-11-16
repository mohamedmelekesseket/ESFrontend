import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShoppingBag, Mail, Instagram, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";

const ProductSelect = ({ setShowBag }) => {
  const location = useLocation();
  const { parentCategoryId, subcategoryId, genre } = location.state || {};
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [AllProducts, setAlProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const subcategoriesScrollRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [isFavorite, setIsFavorite] = useState(false);

  const navigate = useNavigate();

  const getSafeImageUrl = (img) => {
    if (!img) return '/default.png';
    if (typeof img === 'string') return `http://142.93.171.166/${img}`;
    if (typeof img === 'object' && img.urls?.length) return `http://142.93.171.166/${img.urls[0]}`;
    return '/default.png';
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://142.93.171.166/api/Admin/Get-products');
      const filtered = res.data.filter(p => p.subcategoryId === subcategoryId && p.genre === genre);
      setAllProducts(filtered);
      setAlProducts(res.data);
      const selectedProduct = filtered.find(p => p._id === id);
      if (selectedProduct) {
        setProduct(selectedProduct);
        setName(selectedProduct.name || '');
        setPrice(selectedProduct.price || '');
        setDescription(selectedProduct.description || '');
        setColors(Array.isArray(selectedProduct.color) ? selectedProduct.color : []);
        setSizes(() => {
          try {
            const raw = Array.isArray(selectedProduct.size) ? selectedProduct.size[0] : selectedProduct.size;
            return JSON.parse(raw);
          } catch {
            return [];
          }
        });
        setImages(selectedProduct.images || []);
        if (Array.isArray(selectedProduct.color) && selectedProduct.color.length > 0) {
          setSelectedColor(selectedProduct.color[0]);
        }
        if (Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0) {
          setImage(getSafeImageUrl(selectedProduct.images[0]));
        }
        setCurrentImageIndex(0);
      }
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message || "Failed to fetch products");
      }
      console.error(error);
    }
  };

  useEffect(() => {
    if (subcategoryId && genre) {
      fetchProducts();
    }
  }, [subcategoryId, genre, id]);

  const getImageByColor = (product, color, index = 0) => {
    if (!product?.images?.length) return '';
    const firstItem = product.images[0];
    if (typeof firstItem === 'string') {
      return `http://142.93.171.166/${firstItem}`;
    }
    if (typeof firstItem === 'object') {
      const match = product.images.find(img => img.color?.toLowerCase() === color?.toLowerCase());
      if (match?.urls?.[index]) {
        return `http://142.93.171.166/${match.urls[index]}`;
      }
      const fallback = product.images.find(img => img.urls?.[index]);
      if (fallback) {
        return `http://142.93.171.166/${fallback.urls[index]}`;
      }
    }
    return '';
  };

  useEffect(() => {
    if (!selectedColor || !images.length) return;
    const colorObj = images.find(img => img.color?.toLowerCase() === selectedColor?.toLowerCase());
    if (colorObj?.urls?.length > 0) {
      const idx = Math.max(0, Math.min(currentImageIndex, colorObj.urls.length - 1));
      setImage(`http://142.93.171.166/${colorObj.urls[idx]}`);
    } else {
      setImage(getSafeImageUrl(images[0]));
    }
  }, [selectedColor, images, currentImageIndex]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  const scrollSubcategories = (direction) => {
    if (!subcategoriesScrollRef.current) return;
    const scrollAmount = direction === 'left' ? -180 : 180;
    subcategoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setShowBag]);
  const handleNextImage = () => {
    const colorObj = images.find(img => img.color?.toLowerCase() === selectedColor?.toLowerCase());
    if (colorObj?.urls?.length > 0) {
      setCurrentImageIndex(prev => (prev + 1) % colorObj.urls.length);
    }
  };

  const handlePrevImage = () => {
    const colorObj = images.find(img => img.color?.toLowerCase() === selectedColor?.toLowerCase());
    if (colorObj?.urls?.length > 0) {
      setCurrentImageIndex(prev => (prev - 1 + colorObj.urls.length) % colorObj.urls.length);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/SeConnect');
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    try {
      const cartData = {
        userId: user.id || user._id,
        products: [{ productId: id, quantity: 1, size: selectedSize, color: selectedColor }]
      };

      const res = await axios.post('http://142.93.171.166/api/AddToCart', cartData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Product added to cart successfully!");
      }
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message || "Failed to add product to cart");
      }
      console.error("Error adding to cart:", error);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }
  };

  const handleMobileImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const clickPosition = y / rect.height;
    
    if (clickPosition < 0.5) {
      handlePrevImage();
    } else {
      handleNextImage();
    }
  };

  const getTotalImages = () => {
    const colorObj = images.find(img => img.color?.toLowerCase() === selectedColor?.toLowerCase());
    return colorObj?.urls?.length || 0;
  };

  return (
    <div className="ProductSelect">
      {product && (
        <div style={{ display: 'flex', justifyContent: "center", alignItems: "flex-end", width: "100%", gap: "48px" }}>
          <div className="gallery">
            <div className='Arrow-1' onClick={handlePrevImage}>
              <ArrowLeft style={{ cursor: "pointer", zIndex: '-1' }} />
            </div>
            <div className="image-wrapper">
              <AnimatePresence mode="wait">
                <motion.img
                  key={image}
                  src={image}
                  className='mainImage'
                  alt={name}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>
            <div className='Arrow-2' onClick={handleNextImage}>
              <ArrowRight style={{ cursor: "pointer", zIndex: '-1' }} />
            </div>
          </div>

          <div className="ProductSelect-details">
            <h1 className="name">{name}</h1>
            <p className="price">{price} TND</p>

            <div className="colorSection">
              <span>Couleur:</span>
              <div className="colorSwatches">
                {colors.map((color, index) => {
                  const imgUrl = getImageByColor(product, color);
                  const safeImgUrl = imgUrl ? imgUrl.replace(/\\/g, '/') : undefined;
                  return (
                    <div
                      key={index}
                      className='color'
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        margin: '5px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: color === selectedColor ? '2px solid #7c2232' : '2px solid black',
                        backgroundColor: color,
                        backgroundImage: safeImgUrl ? `url(${safeImgUrl})` : undefined,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        boxShadow: '0 0 0 2px #fff inset',
                      }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            <div className="sizeSection">
              <span>Taille:</span>
              <div className="sizeOptions">
                {sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      backgroundColor: selectedSize === size ? 'black' : '',
                      color: selectedSize === size ? 'white' : ''
                    }}
                    className="sizeBtn"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button className="addToCartBtn" onClick={handleAddToCart}>
              AJOUTER AU PANIER <ShoppingBag />
            </button>

            <div className="description">
              <h3>Description</h3>
              <p>{description}</p>
            </div>
          </div>
        </div>
      )}

      <div className='SubcategoryProduct' style={{ display: 'flex', alignItems: 'center', marginTop: 32 }}>
        <div className='Arrow' onClick={() => scrollSubcategories('left')}>
          <ArrowLeft size={30} style={{ cursor: 'pointer' }} />
        </div>
        <div className="productsSub" ref={subcategoriesScrollRef}>
          {allProducts.map((prod) => {
            const imgUrl = getSafeImageUrl(prod.images[0]);
            return (
              <div key={prod._id} onClick={() => {
                navigate(`/PorductSelecte/${prod._id}`, {
                  state: {
                    parentCategoryId: product.categoryId,
                    subcategoryId: product.subcategoryId,
                    genre: product.genre,
                  }
                });
                scrollToTop();
              }} className='PS'>
                <img src={imgUrl} alt={prod.name} style={{ width: "100%", height: '80%', objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ fontSize: 12, marginTop: '8%' }}>{prod.name}</div>
              </div>
            );
          })}
        </div>
        <div className='Arrow' onClick={() => scrollSubcategories('right')}>
          <ArrowRight size={30} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* mobile */}
      <div className="mobile-view">
        {product && (
          <>
            <div className="mobile-image-container">
              <button
                className="favorite-btn"
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label="Add to favorites"
              >
                <Heart className={isFavorite ? 'filled' : ''} />
              </button>

              <div
                className="mobile-image-wrapper"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleMobileImageClick}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={image}
                    src={image}
                    className="mobile-product-image"
                    alt={name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>

              <div className="image-indicators">
                {Array.from({ length: getTotalImages() }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`indicator-dot ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </div>

            <div className="mobile-details">
              <div className="mobile-header">
                <div>
                  <h1 className="mobile-product-name">{name}</h1>
                  <p className="mobile-product-price">{price} TND</p>
                </div>
              </div>

              <div className="mobile-color-selector">
                {colors.map((color, index) => {
                  const imgUrl = getImageByColor(product, color);
                  const safeImgUrl = imgUrl ? imgUrl.replace(/\\/g, '/') : undefined;
                  return (
                    <div
                      key={index}
                      className={`mobile-color-option ${color === selectedColor ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        backgroundColor: color,
                        backgroundImage: safeImgUrl ? `url(${safeImgUrl})` : undefined,
                      }}
                    />
                  );
                })}
                {colors.length > 3 && <div className="more-colors">+{colors.length - 3}</div>}
              </div>

              <button
                className="mobile-select-size-btn"
                onClick={()=>(scrollToTop(),handleAddToCart())}
              >
                {selectedSize ? `AJOUTER AU PANIER - ${selectedSize}` : 'SÉLECTIONNER UNE TAILLE'}
              </button>

              {!selectedSize && (
                <div className="mobile-size-selector">
                  <p className="size-label">Sélectionner une taille:</p>
                  <div className="mobile-size-grid">
                    {sizes.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size)}
                        className={`mobile-size-option ${selectedSize === size ? 'selected' : ''}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        <div className='SearchMobileProductS'>
          {AllProducts.map((prod, index) =>
            <div key={prod._id || index} id='FeaturedProductCard' className='FeaturedProductCard'
              onClick={() => (navigate(`/PorductSelecte/${prod._id}`, {
                state: {
                  parentCategoryId: prod.categoryId,
                  subcategoryId: prod.subcategoryId,
                  genre: prod.genre,
                }
              }), scrollToTop())}>
              <img src={`http://142.93.171.166/${prod.images[0]?.urls[3]}`} alt="" />
              <h2>{prod.name}</h2>
              <h3>{prod.price} TND</h3>
            </div>
          )}
        </div>
      </div>
    <footer className="footer-2">
      <div className="footer-links">
        <a href="#">Conditions générales d'achat</a>
        <span>•</span>
        <a href="#">Conditions générales de #esbeandstyle</a>
        <span>•</span>
        <a href="#">Politique de confidentialité</a>
        <span>•</span>
        <a href="#">Politique de cookies</a>
      </div>
      <div className="footer-copy">© 2025 ESBEAND CLOTHES</div>
    </footer>
    </div>
  );
};

export default ProductSelect;
