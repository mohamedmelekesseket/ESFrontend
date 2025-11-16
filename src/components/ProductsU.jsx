import React, { useState, useEffect, useMemo } from 'react';
import { useParams,Link ,useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Slider from "@mui/material/Slider";
import { SlidersHorizontal, Eraser, X, Mail, Instagram, Twitter, Youtube,Package } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import Loader from './Loader';

function valuetext(value) {
  return `${value}°C`;
}

const Index = () => {
  const { subcategoryName } = useParams();
  const location = useLocation();
  const { parentCategoryId, subcategoryId, genre } = location.state || {};
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const effectiveSubcategoryId = subcategoryId || searchParams.get("subcategoryId");
  const effectiveGenre = genre || searchParams.get("genre");
  const activeGenre = effectiveGenre || null;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subCatSelected, setSubcatSelected] = useState(effectiveSubcategoryId || null);
  const [FunnelIC, setFunnel] = useState(false);
  const [selectedColors, setSelectedColors] = useState({});
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [value, setValue] = useState([0, 300]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all categories
  useEffect(() => {
    const getCategory = async () => {
      try {
        const res = await axios.get('https://142.93.171.166/api/Admin/Get-category');
        setCategories(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching categories");
      }
    };
    getCategory();
  }, []);

  // Fetch subcategories
  useEffect(() => {
    if (!parentCategoryId) return;
    const getSubCategory = async () => {
      try {
        const res = await axios.get(`https://142.93.171.166/api/Admin/Get-Subcategory/${parentCategoryId}`);
        setSubcategories(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching subcategories");
      }
    };
    getSubCategory();
  }, [parentCategoryId]);

  // Fetch all products
  useEffect(() => {
    const getProducts = async () => {
      
      try {
        const res = await axios.get('https://142.93.171.166/api/Admin/Get-products');
        setProducts(res.data);
      } catch (error) {
        toast.error("Failed to fetch products");
      }
    };
    getProducts();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // 4000ms = 4 seconds

    return () => clearTimeout(timer); // cleanup on unmount
  }, []);

  // Normalize size array from DB
  const normalizeSizes = (raw) => {
    if (!raw) return [];
    try {
      if (Array.isArray(raw)) {
        if (typeof raw[0] === "string" && raw[0].startsWith("[")) {
          return JSON.parse(raw[0]);
        }
        return raw;
      }
      if (typeof raw === "string" && raw.startsWith("[")) {
        return JSON.parse(raw);
      }
    } catch {
      return [];
    }
    return [];
  };

  // Products scoped by category / subcategory / genre (used for filters)
  const scopedProducts = useMemo(() => {
    let filtered = Array.isArray(products) ? products : [];

    if (subCatSelected) {
      filtered = filtered.filter(p => p?.subcategoryId === subCatSelected);
    } else if (parentCategoryId) {
      filtered = filtered.filter(p => p?.categoryId === parentCategoryId);
    }

    if (activeGenre) {
      filtered = filtered.filter(p => p?.genre === activeGenre);
    }

    return filtered;
  }, [products, parentCategoryId, subCatSelected, activeGenre]);

  // Available filters computed from scoped products
  const availableFilters = useMemo(() => {
    const colorMap = new Map();
    const sizeMap = new Map();

    scopedProducts.forEach((product) => {
      // Colors from images
      if (Array.isArray(product?.images)) {
        product.images.forEach((img) => {
          const color = img?.color?.trim()?.toLowerCase();
          if (color) {
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }
        });
      }

      // Sizes
      const sizes = normalizeSizes(product?.size);
      sizes.forEach((sz) => {
        if (sz) {
          sizeMap.set(sz, (sizeMap.get(sz) || 0) + 1);
        }
      });
    });

    return {
      colors: Array.from(colorMap.entries()).map(([color, count]) => ({ _id: color, count })),
      sizes: Array.from(sizeMap.entries()).map(([size, count]) => ({ _id: size, count })),
    };
  }, [scopedProducts]);

  // Filtered Products Logic (applies price / color / size selection)
  const filteredProducts = useMemo(() => {
    let filtered = scopedProducts;

    if (Array.isArray(value) && value.length === 2) {
      filtered = filtered.filter(
        p => typeof p?.price === "number" && value[0] <= p.price && p.price <= value[1]
      );
    }

    if (selectedColor) {
      filtered = filtered.filter(
        p =>
          Array.isArray(p?.images) &&
          p.images.some(img => img.color?.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    if (selectedSize) {
      filtered = filtered.filter(p => {
        const sizes = normalizeSizes(p.size);
        return sizes.includes(selectedSize);
      });
    }

    return filtered;
  }, [scopedProducts, value, selectedColor, selectedSize]);

  // Helpers
  const getImageByColor = (product, color, index = 0) => {
    if (!product?.images?.length) return '';
    const match = product.images.find((img) => img.color?.toLowerCase() === color?.toLowerCase());
    if (match?.urls?.[index]) return `https://142.93.171.166/${match.urls[index]}`;
    const fallback = product.images.find((img) => img.urls?.[index]);
    return fallback ? `https://142.93.171.166/${fallback.urls[index]}` : '';
  };

  const handleChange = (event, newValue) => setValue(newValue);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => {
    const {
      parentCategoryId: newParent,
      subcategoryId: newSubcat,
      genre: newGenre,
    } = location.state || {};

    if (newParent) {
      setSubcatSelected(newSubcat || null);
    }

  }, [location.state]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.state]);


  return (
    <div style={{ width: '100%', height: "auto",overflowY:"none" }}>
      {loading && <Loader isLoading={loading} />}

      {/* Header */}
      {FunnelIC && (
        <div onClick={() => setFunnel(!FunnelIC)} className='overflow-2'>
        </div>
      )}
      <div className='CategoriesPU'>
        <h1>{categories.find(cat => cat._id === parentCategoryId)?.name}</h1>
        <h3>Discover our latest collection of premium denim</h3>

        {/* Subcategories */}
        <div className='SubcategorisPU'>
          <div
            style={{
              backgroundColor: !subCatSelected ? 'black' : 'white',
              color: !subCatSelected ? 'white' : '',
            }}
            onClick={() => {
              setSubcatSelected(null);
              setSelectedColor(null);
              setSelectedSize(null);
            }}
            className='subcatPU'
          >
            See-All
          </div>
          {subcategories.filter(subcat => subcat.genre === activeGenre).map(Subcat => (
            <div
              style={{
                backgroundColor: Subcat._id === subCatSelected ? 'black' : 'white',
                color: Subcat._id === subCatSelected ? 'white' : '',
              }}
              onClick={() => {
                setSubcatSelected(Subcat._id);
                setSelectedColor(null);
                setSelectedSize(null);
              }}
              className='subcatPU'
              key={Subcat._id}
            >
              {Subcat.name}
            </div>
          ))}
        </div>

        <div className='FunnelIcon' onClick={() => setFunnel(!FunnelIC)}>
          <SlidersHorizontal size={12} /> Filters
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {FunnelIC && (
          <motion.div
            className="filter-panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="filter-header">
              <h2>Filters</h2>
              <X size={22} className="close-btn" onClick={() => setFunnel(false)} />
            </div>

            {/* PRICE RANGE */}
            <div className="filter-block">
              <h4>Price</h4>
              <Slider
                value={value}
                onChange={handleChange}
                color='black'
                valueLabelDisplay="auto"
                min={0}
                max={300}
              />
              <div className="price-values">
                <span>{value[0]} TND</span> - <span>{value[1]} TND</span>
              </div>
            </div>

            {/* SIZE */}
            <div className="filter-block">
              <h4>Size</h4>
              <div className="size-grid">
                {availableFilters.sizes.map((s) => (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    key={s._id}
                    onClick={() => setSelectedSize(s._id)}
                    className={`size-btn ${selectedSize === s._id ? "active" : ""}`}
                  >
                    {s._id}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* COLOR */}
            <div className="filter-block">
              <h4>Color</h4>
              <div className="color-grid">
                {(availableFilters.colors || []).map((c) => c?._id?.trim()?.toLowerCase()).filter(Boolean).map((color, i) => (
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      key={i}
                      className={`color-circle ${selectedColor === color ? "active" : ""}`}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        backgroundColor: color,
                        border: color === "white" || color === "blanc" ? "1px solid #000" : "none",
                      }}
                      title={color}
                    />
                  ))}
              </div>
            </div>
            {/* RESET */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="reset-btn"
              onClick={() => {
                setSelectedColor(null);
                setSelectedSize(null);
                setValue([0, 300]);
              }}
            >
              <Eraser size={16} />
              Reset Filters
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="result-btn"
              onClick={() => setFunnel(!FunnelIC)}
            >
              see result
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      <motion.div
        className="ProductsU"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >        
        {filteredProducts.length === 0 ? (
                  <div>
                    <div className="no-products-container">
                      <div className="no-products-content">
                        <div className="icon-wrapper">
                          <Package size={64} />
                        </div>
                        <h2>No Products Yet</h2>
                        <p>
                          We're currently working on adding products to this category.
                          <br />
                          Check back soon for exciting new arrivals!
                        </p>
                        <span className="coming-soon">Coming Soon</span>
                      </div>
                    </div>
                    <h1 style={{
                      fontSize: '19px',
                      fontWeight: 400,
                      marginTop: '0%',
                      marginLeft: '40%'
                    }}>You might be interested in</h1>

                    <div className='ProductsU'>
                      {products.map((product, index) => {
                        const color = selectedColors[product._id];
                        const mainImg = getImageByColor(product, color,3);
                        const secondImg = getImageByColor(product, color, 0);
                        const isHovered = hoveredProductId === product._id;

                        let sizes = [];
                        try {
                          if (Array.isArray(product.size)) {
                            sizes =
                              typeof product.size[0] === "string"
                                ? JSON.parse(product.size[0])
                                : product.size;
                          }
                        } catch (err) {
                          console.error("Error parsing sizes:", err);
                        }

                        return (
                          <div
                            className="productU"
                            style={{height:"450px"}}
                            key={product._id || index}
                            onClick={() =>
                              navigate(`/PorductSelecte/${product._id}`, {
                                state: {
                                  parentCategoryId: product.categoryId,
                                  subcategoryId: product.subcategoryId,
                                  genre: product.genre,
                                },
                              })
                            }
                          >
                            <div
                              className="hoverImg"
                              onMouseEnter={() => setHoveredProductId(product._id)}
                              onMouseLeave={() => setHoveredProductId(null)}
                            >
                              <img
                                src={isHovered && secondImg ? secondImg : mainImg}
                                alt={product.name}
                                onError={(e) => (e.target.src = "/default.png")}
                              />

                              {/* If you want to show sizes on hover, uncomment below */}
                              {isHovered && (
                                <div className="sizesPU">
                                  <h4>Sizes</h4>
                                  <div className="sizes-container">
                                    {sizes.map((s, indx) => (
                                      <div key={indx} className="size-box">{s}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <p>{product.name}</p>
                            <h3>{product.price} TND</h3>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
            
            filteredProducts.map((product, index) => {
              const color = selectedColors[product._id];
              const mainImg = getImageByColor(product, color);
              const secondImg = getImageByColor(product, color, 1);
              const isHovered = hoveredProductId === product._id;

              let sizes = [];
              try {
                if (Array.isArray(product.size)) {
                  sizes =
                    typeof product.size[0] === "string"
                      ? JSON.parse(product.size[0])
                      : product.size;
                }
              } catch (err) {
                console.error("Error parsing sizes:", err);
              }

                return (
                  <motion.div
                    className="productU"
                    key={product._id || index}
                    onClick={() =>
                      navigate(`/PorductSelecte/${product._id}`, {
                        state: {
                          parentCategoryId: product.categoryId,
                          subcategoryId: product.subcategoryId,
                          genre: product.genre,
                        },
                      })
                    }
                    onMouseEnter={() => setHoveredProductId(product._id)}
                    onMouseLeave={() => setHoveredProductId(null)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ height: "550px" }}
                  >
                    <div className="hoverImg">
                      <motion.img
                        src={isHovered && secondImg ? secondImg : mainImg}
                        alt={product.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        onError={(e) => (e.target.src = "/default.png")}
                      />

                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            className="sizesPU"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4>Sizes</h4>
                            <div className="sizes-container">
                              {sizes.map((s, indx) => (
                                <div key={indx} className="size-box">{s}</div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {product.name}
                    </motion.p>
                    <motion.h3
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {product.price} TND
                    </motion.h3>
                  </motion.div>
                );
            })
          )}

      </motion.div>
      <div className="SearchMobileProductS" id="ProductsUMobile" style={{ marginTop: "4%" }}>
        {filteredProducts.length === 0 ? (
          <div>
            <div className="no-products-container">
              <div className="no-products-content">
                <div className="icon-wrapper">
                  <Package size={64} />
                </div>
                <h2>No Products Yet</h2>
                <p>
                  We're currently working on adding products to this category.
                  <br />
                  Check back soon for exciting new arrivals!
                </p>
                <span className="coming-soon">Coming Soon</span>
              </div>
            </div>
            <div className='SearchMobileProductS'>
              {products.map((prod, index) => (
                <div
                  key={prod._id || index}
                  id="FeaturedProductCard"
                  className="FeaturedProductCard"
                  style={{height:"300px"}}
                  onClick={() => (
                    navigate(`/PorductSelecte/${prod._id}`, {
                      state: {
                        parentCategoryId: prod.categoryId,
                        subcategoryId: prod.subcategoryId,
                        genre: prod.genre,
                      },
                    }),
                    setSearchMobile(false)
                  )}
                >
                  <img
                    src={`https://142.93.171.166/${prod.images[0]?.urls[3]}`}
                    alt={prod.name}
                  />
                  <h2>{prod.name}</h2>
                  <h3>{prod.price} TND</h3>
                </div>
              ))}
            </div>

          </div>
        ) : (
          filteredProducts.map((prod, index) => (
            <div
              key={prod._id || index}
              id="FeaturedProductCard"
              className="FeaturedProductCard"
              onClick={() => (
                navigate(`/PorductSelecte/${prod._id}`, {
                  state: {
                    parentCategoryId: prod.categoryId,
                    subcategoryId: prod.subcategoryId,
                    genre: prod.genre,
                  },
                }),
                setSearchMobile(false)
              )}
            >
              <img
                src={`https://142.93.171.166/${prod.images[0]?.urls[0]}`}
                alt={prod.name}
              />
              <h2>{prod.name}</h2>
              <h3>{prod.price} TND</h3>
            </div>
          ))
        )}
      </div>
      {/* Footer */}
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
              <Mail /><Instagram /><Twitter /><Youtube />
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
  );
};

export default Index;
