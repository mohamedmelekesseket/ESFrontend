import React,{useState,useEffect,useMemo,useRef} from 'react'
import * as LucideIcons from "lucide-react";
import { Menu,Search,UserRound,Smartphone,Footprints ,Shirt ,X ,LogOut,User,Mail, CreditCard, ArrowLeft ,Truck, MapPin,ShoppingBag,ShieldUser,Edit2,Trash2 ,Dot,MoveRight,MoveLeft,Minus,Plus   } from 'lucide-react';
import { Link, useNavigate,useLocation  } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import EsL from '../images/Es4.png'

import axios from 'axios'
function HeaderBar({showBag,setShowBag}   ) {
  const [categorySelected,setCategorySelected]=useState('')
  const [categorySelectedName,setCategorySelectedName]=useState('')
  const [showMenu,setShowMenu]=useState(false)
  const [showSearch,setShowSearch]=useState(false)
  const [genre,setGenre]=useState('men')
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })
  const [ShowUser,setShowUser] =useState(false)
  const [HoverCat,setHoverCat] =useState(null)
  const [HoverSub,setHoverSub] =useState(null)
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [Allsubcategories, setAllSubcategories] = useState([]);
  const [productCart, setProductCart] = useState([]);
  const [product, setProduct] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [quantity, setquantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [image, setImage] = useState('');
  const [SearchGenre, setSearchGenre] = useState('Tous');
  const [name, setName] = useState('');
  const [images, setImages] = useState([]);
  const [colors, setColors] = useState([]);
  const [showBagEdit, setShowBagEdit] = useState(false)
  const [editingCartItem, setEditingCartItem] = useState(null)
  const [originalSize, setOriginalSize] = useState('')
  const [originalColor, setOriginalColor] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [Products, setProducts] = useState([]);
  const [AllProducts, setAllProducts] = useState([]);
  const [SearchMobile, setSearchMobile] = useState(false); // LIFTED STATE
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const subcategoriesScrollRef = useRef(null);


  const icons = {
    Shirt,
    ShoppingBag,
    Footprints,
    Smartphone
    // add more icons here
  };
  // Calculate total using useMemo
  const total = useMemo(() => {
    if (!productCart?.cart?.products) return 0;
    return productCart.cart.products.reduce((sum, product) => {
      return sum + (product.productId?.price * product.quantity);
    }, 0);
  }, [productCart]);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlHeader = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      // scrolling down → hide header
      setShowHeader(false);
    } else {
      // scrolling up → show header
      setShowHeader(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlHeader);

    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [lastScrollY]);

  
  
  const getProducts = async () => {
    try {
      const res = await axios.get("https://142.93.171.166/api/GetProduct");
      setAllProducts(res.data)
       const featuredProducts = res.data
        .filter(p => p.isFeatured)
        .slice(0, 4);
       setProducts(featuredProducts);
      
    } catch (error) {
      console.log(error);
      
      toast.error(error.response?.data?.message || "Failed to fetch products");
    }
  };
  const getCategory = async () => {  
    try {
      const res = await axios.get("https://142.93.171.166/api/Admin/Get-category",{
      });
      setCategories(res.data);            
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message)
      }
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };
  const getProductCart = async () => {  
    if (!user?.id) return;
    try {
      const res = await axios.get(`https://142.93.171.166/api/GetProductCart/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      setProductCart(res.data);
             
    } catch (error) {
      console.log(error);
    }
  };
  const getAllSubCategory = async (id) => {  
    try {
      const res = await axios.get(`https://142.93.171.166/api/getAllSubCategory`);
      setAllSubcategories(res.data);     
       
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message)
      }
    }
  };
  const getSubCategory = async (id) => {  
    try {
      const res = await axios.get(`https://142.93.171.166/api/Admin/Get-Subcategory/${id}`);
      setSubcategories(res.data);     
       
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message)
      }
    }
  };
  const scrollSubcategories = (direction) => {
    if (!subcategoriesScrollRef.current) return;
    const container = subcategoriesScrollRef.current;
    const scrollAmount = container.offsetWidth * 0.7;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };
  const GetPById = async (id) => {  
    
    try {
      const res = await axios.get(`https://142.93.171.166/api/Admin/Get-product/${id}`);     
      setName(res.data.name)
      setProduct(res.data)  
      // console.log('Product data:', res.data);
      // console.log('Product images:', res.data.images);
      setColors(Array.isArray(res.data.color) ? res.data.color : []);
      setSizes(() => {
        try {
          const raw = Array.isArray(res.data.size) ? res.data.size[0] : res.data.size;
          return JSON.parse(raw);
        } catch {
          return [];
        }
      });
      setImages(res.data.images || []);
      if (Array.isArray(res.data.color) && res.data.color.length > 0) {
        setSelectedColor(res.data.color[0]);
      }
      // Set initial image based on the first color
      if (Array.isArray(res.data.color) && res.data.color.length > 0) {
        const initialImage = getImageByColor(res.data, res.data.color[0]);
        setImage(initialImage);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message)
      }
    }
  };
  const getSafeImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // Normalize the path to use forward slashes
    let normalizedPath = imagePath.replace(/\\/g, '/');
    return normalizedPath.startsWith('https')
      ? normalizedPath
      : `https://142.93.171.166/${normalizedPath.replace(/^\//, '')}`;
  };

  const getImageByColor = (product, color, index = 0) => {
    if (!product?.images?.length) {
      return '';
    }
    
    // Find the image object that matches the color
    const match = product.images.find(img => 
      img.color?.toLowerCase() === color?.toLowerCase()
    );
    
    
    if (match?.urls?.[index]) {
      const url = getSafeImageUrl(match.urls[index]);
      return url;
    }
    
    // Fallback to first available image
    const fallback = product.images.find(img => img.urls?.[index]);
    if (fallback) {
      const url = getSafeImageUrl(fallback.urls[index]);
      console.log('Returning fallback URL:', url);
      return url;
    }
    
    console.log('No image found');
    return '';
  };
  useEffect(() => {
    getCategory();
    getAllSubCategory()
  }, []);
  useEffect(() => {
    getProductCart();
  }, [showBag, user?.id]);
  useEffect(() => {
    getProducts()
  }, []);
  // Handle body overflow when shopping bag is open
  useEffect(() => {
    if (showBag || showBagEdit || showMenu || showSearch || SearchMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to restore overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showBag, showBagEdit,showMenu,showSearch,SearchMobile]);


  useEffect(() => {
    setHoverCat('')
    setHoverSub('')
    setCategorySelected('')
  }, [showMenu]);

  // Update image when selected color changes
  useEffect(() => {
    if (product && selectedColor) {
      const newImage = getImageByColor(product, selectedColor);
      console.log('Setting new image:', newImage);
      setImage(newImage);
    }
  }, [selectedColor, product]);
  
  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const newUser = JSON.parse(localStorage.getItem('user')) || null;
        setUser(newUser);
      } catch (error) {
        setUser(null);
      }
    }

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', handleStorageChange)
    
    // Also check for changes when the component mounts or when navigating
    const checkUser = () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user')) || null;
        if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
          setUser(currentUser);
        }
      } catch (error) {
        setUser(null);
      }
    }

    // Check user state periodically
    const interval = setInterval(checkUser, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [user])

  const DeletePrdCart = async (productToDelete) => {
    if (!user?.id) return;
    try {
      const res = await axios.delete('https://142.93.171.166/api/DeletePrdCart', {
        data: {
          userId: user.id,
          productId: productToDelete.productId._id,
          size: productToDelete.size,
          color: productToDelete.color
        },
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200) {
        getProductCart();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updateCartItem = async () => {
    if (!user?.id || !editingCartItem) return;
    try {
      const res = await axios.put('https://142.93.171.166/api/cart-update', {
          userId: user.id,
          cartItemId: editingCartItem._id, // Send the cart item ID for reliable lookup
          productId: product._id,
          size: selectedSize,
          quantity: quantity,
          color: selectedColor,
          originalSize: originalSize, // Original size to find item if cartItemId fails
          originalColor: originalColor // Original color to find item if cartItemId fails
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200) {
        getProductCart();
        setShowBagEdit(false);
        setEditingCartItem(null);
        setOriginalSize('');
        setOriginalColor('');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update cart item");
    }
  };
  const filteredProducts = AllProducts.filter(product =>
    product.name.toLowerCase().includes(searchInput.toLowerCase())
  );
  const filteredSubcategory = Allsubcategories.filter(subc =>
    subc.name.toLowerCase().includes(searchInput.toLowerCase())
  );

    const items = [
    { icon: <MapPin size={18} style={{ marginRight: "6px" }} />, text: "Livraison rapide sur toute la Tunisie" },
    { icon: <Mail size={18} style={{ marginRight: "6px" }} />, text: "EsBrand@gmail.com" },
    { icon: <CreditCard size={18} style={{ marginRight: "6px" }} />, text: "Tous les paiements sont acceptés" },
    { icon: <Truck size={18} style={{ marginRight: "6px" }} />, text: "Livraison gratuite à partir de 120 DT" }
  ];
  return (
    <div>
      <AnimatePresence>
        {showBag && (
          <motion.div
            className='overflow-2'
            onClick={() => {
              setShowBagEdit(false);
              setEditingCartItem(null);
              setOriginalSize('');
              setOriginalColor('');
              setShowBag(false); // CLOSE IMMEDIATELY
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {showSearch && showMenu && (
        <div className='overflow'>
        </div>
      )}
      {location.pathname === "/" && (
        <div className='SearchMobile' onClick={() => setSearchMobile(true)}>
          <Search style={{ cursor: "pointer", position: "absolute", left: "2%" }} />
          <input type="text" placeholder="Search..." />
        </div>
      )}
      {SearchMobile && (
        <div className='SearchMobileComp'>
            <div className='FetchMobile'>
              <Search style={{cursor:"pointer",position:"absolute",left:"2%"}}/>
              <input id="FetchMobile" type="text" placeholder="Search..." />
            </div>
            <X style={{position:'absolute',right:"10px",cursor:"pointer"}} onClick={()=>setSearchMobile(false)} size={20}/>
            <div
              className='SearchMobileCompGenre'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px'
              }}
            >
              <MoveLeft
                size={22}
                onClick={() => scrollSubcategories('left')}
                style={{ cursor: 'pointer' }}
              />
              <div
                ref={subcategoriesScrollRef}
                className='SearchMobileCompGenreList'
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '0px',
                  padding: '4px 0',
                  paddingRight: '24px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {Allsubcategories.map((subcategory, index) => (
                  <h4
                    key={subcategory._id || index}
                    onClick={() => setSearchGenre(subcategory.genre || 'Homme')}
                    style={{
                      flex: '0 0 auto',
                      minWidth: '100px',
                      margin: '0',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      color: '#303030',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {subcategory.name}
                  </h4>
                ))}
              </div>
              <MoveRight
                size={22}
                onClick={() => scrollSubcategories('right')}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <h1>You might be interested in</h1>

            <div className='SearchMobileProductS'>
              {AllProducts.map((prod, index) => 
                <div key={prod._id || index} id='FeaturedProductCard'  className='FeaturedProductCard'
                onClick={()=>(navigate(`/PorductSelecte/${prod._id}`, {
                state: {
                  parentCategoryId: prod.categoryId,
                  subcategoryId: prod.subcategoryId,
                  genre: prod.genre,
                }}),setSearchMobile(false))}>
                  <img src={`https://142.93.171.166/${prod.images[0]?.urls[3]}`} alt="" />
                  <h2>{prod.name}</h2>
                  <h3>{prod.price} TND</h3>

                </div>
              )}
            </div>
        </div>  
      )}

      <div className={`Search ${showSearch ? "open" : ""}`}>
        <div className='divshowSearch'>
          <Search style={{cursor:"pointer",position:"absolute",left:"2%",color:"black"}}/>
          <input 
            id="SearchDesktop"
            type="text"
            className="SearchInput"
            placeholder="Search..."
            onChange={(e)=>setSearchInput(e.target.value)}
            style={{
              opacity: showSearch ? 1 : 0,
              pointerEvents: showSearch ? "auto" : "none",
              transition: "opacity 0.4s ease"
            }}
          />
        </div>
        <X 
          style={{
            position:'absolute',
            right:"10px",
            top: "20px",
            cursor:"pointer",
            color: "black"
          }} 
          onClick={() => setShowSearch(false)} 
          size={20}
        />
        {showSearch && (
          <>
            <div
              className='SearchMobileCompGenre'
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px'
              }}
            >
              <MoveLeft
                size={22}
                onClick={() => scrollSubcategories('left')}
                style={{ cursor: 'pointer' }}
              />
              <div
                ref={subcategoriesScrollRef}
                className='SearchMobileCompGenreList'
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '0px',
                  padding: '4px 0',
                  paddingRight: '24px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {filteredSubcategory.map((subcategory, index) => (
                  <h4
                    key={subcategory._id || index}
                    onClick={() => setSearchGenre(subcategory.genre || 'Homme')}
                    style={{
                      flex: '0 0 auto',
                      minWidth: '100px',
                      margin: '0',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      color: '#303030',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {subcategory.name}
                  </h4>
                ))}
              </div>
              <MoveRight
                size={22}
                onClick={() => scrollSubcategories('right')}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <h1 style={{
              fontSize: '19px',
              fontWeight: 400,
              marginTop: '7%',
              marginLeft: '2%'
            }}>You might be interested in</h1>

            <div className='SearchMobileProductS'>
              {filteredProducts.map((prod, index) => 
                <div 
                  key={prod._id || index} 
                  id='FeaturedProductCard'  
                  className='FeaturedProductCard'
                  onClick={()=>{
                    navigate(`/PorductSelecte/${prod._id}`, {
                      state: {
                        parentCategoryId: prod.categoryId,
                        subcategoryId: prod.subcategoryId,
                        genre: prod.genre,
                      }
                    });
                    setShowSearch(false);
                  }}
                >
                  <img src={`https://142.93.171.166/${prod.images[0]?.urls[3]}`} alt="" />
                  <h2>{prod.name}</h2>
                  <h3>{prod.price} TND</h3>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div   className='HeaderBar slide-down'>
        <Toaster/>
        <div className='HeaderBar-1'>
          <Menu className='IconMenuHead' onClick={()=>(setShowMenu(!showMenu),setShowUser(false),setShowBag(false))} size={25} strokeWidth={3} style={{color:"white",cursor:"pointer",backgroundColor:"transparent"}}/>
          {/* <Menu className='IconMenuHead' onClick={()=>(setShowMenu(!showMenu),setShowUser(false),setShowBag(false))} size={45} strokeWidth={3} style={{color:"white",cursor:"pointer"}}/> */}
          <Link className='esLogoHead'  to='/' style={{textDecoration:"none",color:"white"}}>
            <img src={EsL} onClick={()=>(setShowMenu(false),setShowBag(false))} width={'70px'} height={'70px'}  alt="" />
          </Link>
          <div className='HeaderBar-3'> 
            <div className='HeaderIcons'>
              <div className="HeaderBar-4">
                {user ? (
                  <User  onClick={()=>(setShowMenu(false),setShowUser(!ShowUser),setIsDropdownOpen(true),setShowBag(false))} style={{cursor:"pointer",color:"white"}}/> 
                ):(
                  <Link to='/Seconnect'onClick={()=>(setShowMenu(false),setShowBag(false))}>
                  <button >Se Connect <UserRound size={15} style={{position:"relative",left:"5px",top:"2px"}}/></button>
                  </Link>
                )}
              </div>
              <Search className='SearchX' onClick={()=>(setShowSearch(!showSearch))} style={{color:"white",cursor:"pointer"}}/>
              <ShoppingBag onClick={()=>(setShowMenu(false),setShowUser(false),setShowBag(!showBag))} style={{cursor:"pointer",color:"white"}}/>
              {
                productCart.cart?.products?.length === 0 ?(
                  ''
                ):(
                  <div className='CountPCart' style={{display:!user?'none':''}} onClick={()=>(setShowMenu(false),setShowBag(!showBag))}>{productCart.cart?.products?.length}</div>
                )
              }  
            </div>

          </div>
        </div> 
        
        <AnimatePresence>
          {showMenu && (
            <motion.div
              className='MenuUser'
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "90vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3, ease: "easeOut" }
              }}
              style={{
                paddingBottom: "2%",
                overflow: "hidden"
              }}
            >
          <div>
          <X onClick={()=>setShowMenu(false)} style={{display: showMenu ?"":"none",cursor:"pointer", marginLeft:"90%"}}/>
          {/* <div className='MenuGenre' style={{display: showMenu ?"":"none"}}>
            <h2 onClick={()=>setGenre('men')} style={{fontWeight: genre === 'men' ?'':'300',color: genre === "men" ?"white":'gray'}}>Men</h2>
            <h2 onClick={()=>setGenre('women')}  style={{fontWeight: genre === 'women' ?'':'300',color: genre === "women" ?"white":'gray'}}>women</h2>
          </div> */}
          </div>
          <div style={{display:"flex",width:"100%"}}>
            <div className="list-1" >
              {categorySelected === '' ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4 }}
                  >
                {categories.map((category, index) => {
                  const iconName = typeof category.icon === 'string' ? category.icon.trim() : ''
                  const IconComponent = LucideIcons[iconName] || LucideIcons.Dot; // fallback to Dot if invalid

                  return (
                    <motion.span
                      key={category._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                      style={{
                        display: showMenu === false ? "none" : "",
                      }}
                      className="SpanList"
                    >
                      {HoverCat === category._id ? (
                        <MoveRight style={{color:"#d2b285"}} />
                      ) : (
                        IconComponent && <IconComponent size={19}  />
                      )}

                      <h2
                        style={{
                          fontWeight: category._id === categorySelected ? "700" : "",
                        }}
                        onMouseEnter={() => setHoverCat(category._id)}
                        onMouseLeave={() => setHoverCat(null)}
                        onClick={() => {
                          getSubCategory(category._id);
                          setCategorySelectedName(category.name);
                          setCategorySelected(category._id);
                        }}
                      >
                        {category.name}
                      </h2>
                    </motion.span>
                  );
                })}


                  </motion.div>
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="subcategories"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span style={{ paddingBottom: "4%" }}>
                      <span
                        style={{ display: showMenu === false ? "none" : "", transition: "all 0.5s", padding: "2px" }}
                        className="SpanList"
                      >
                        <MoveLeft
                          style={{ cursor: "pointer",color:"#FBCA00" }}
                          onClick={() => {
                            setCategorySelected("");
                            setHoverCat("");
                          }}
                        />
                        <h3 style={{ margin: "0", marginLeft: "5%",color:"#FBCA00" }}>{categorySelectedName}</h3>
                      </span>

                      {subcategories.filter((subcategory) => subcategory.genre === genre).map((subcategory) => {
                        const parentCategory = categories.find((cat) => cat._id === subcategory.categoryId);
                        return (
                          <span
                            key={subcategory._id}
                            style={{ display: showMenu === false ? "none" : "", transition: "all 0.5s" }}
                            className="SpanList"
                          >
                            {HoverSub === subcategory._id ? <MoveRight /> : <Dot />}
                            <h2
                              onClick={() => {
                                navigate(
                                  `/ProductU/${subcategory.name}?subcategoryId=${subcategory._id}&genre=${genre}`,
                                  {
                                    state: {
                                      parentCategoryId: parentCategory ? parentCategory._id : "unknown",
                                      subcategoryId: subcategory._id,
                                      genre: genre,
                                    },
                                  }
                                );
                                setShowMenu(false);
                              }}
                              onMouseEnter={() => setHoverSub(subcategory._id)}
                              onMouseLeave={() => setHoverSub(null)}
                            >
                              {subcategory.name}
                            </h2>
                          </span>
                        );
                      })}
                    </span>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
       
        <AnimatePresence>
          {showBag && (
          <motion.div
            id="ShoppingBag"
            className={`ShoppingBag ${showBag ? "open" : ""}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{
              opacity: { duration: 0.3, ease: "easeOut" },
              x: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
            }}
            style={{ overflow: "hidden" }}
>

          {productCart.cart?.products?.length === 0 || !user ?(          
            <div>
              <X className='XMobileBag' onClick={()=>setShowBag(false)} style={{display: showBag ?"":"none",cursor:"pointer", marginLeft:"90%"}}/>
              <ArrowLeft className='IconMobileShoppingCard'  onClick={()=>setShowBag(false)} style={{display: showBag ?"initial":"none",cursor:"pointer", marginLeft:"2%"}}/>
              <h3 style={{textAlign:"center",position:"relative",top:"-10px",display: showBag ?"":"none"}}>ShoppingBag</h3>
              
              {/* Empty Cart Message */}
              <div className='EmptyBag' style={{ display: showBag ? "flex" : "none",}}>
                <ShoppingBag size={60} style={{color: "#ccc", marginBottom: "15px"}}/>
                <h4 style={{color: "#666", marginBottom: "10px", fontSize: "18px"}}>Your cart is empty</h4>
                <p style={{color: "#999", fontSize: "14px", lineHeight: "1.4"}}>
                  Looks like you haven't added any items to your cart yet. 
                  Start shopping to see your items here!
                </p>
                <Link to="/" onClick={() => setShowBag(false)}>
                  <button  onClick={()=>setShowMenu(true)}>Start Shopping</button>
                </Link>
              </div>
              {/* <div className='MobileBagProduct'>
                <h1>you might be interested in</h1>
                <div id='FeaturedProductCards' className='FeaturedProductCards'>
                  {Products.slice(0, 4).map((prod, index) => 
                  <div key={prod._id || index} id='FeaturedProductCard' className='FeaturedProductCard'>
                    <img src={`https://142.93.171.166/${prod.images[0]?.urls[3]}`} alt="" />
                    <h2>{prod.name}</h2>
                    <h3>{prod.price} TND</h3>

                  </div>
                  )}
                </div>
              </div> */}
            </div>
          ):(
            <div className='PdSb'>
              <div className='PdSbHeader'>
                <h3 style={{display: showBag ?"":"none"}}>Shopping Bag <ShoppingBag size={20} /> </h3>
                <X onClick={() => {
                  setShowBagEdit(false); // first
                  setEditingCartItem(null);
                  setOriginalSize('');
                  setOriginalColor('');
                  setTimeout(() => {
                    setShowBag(false); // after 0.5s
                  }, 400);
                }} style={{display: showBag ?"":"none",marginRight:"2%",cursor:"pointer"}}/>
              </div>
              <div className='PdSb-1'>
              {productCart?.cart?.products?.map((product, index) => {
                // Use getImageByColor to get the correct image for the product's color
                const imageUrl = getImageByColor(product.productId, product.color, 0);
                
                return (
                  <motion.div
                    className='PdSp-2'
                    key={product._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3, ease: "easeOut" }}
                  >
                    {imageUrl && <img src={imageUrl} alt="Product" onError={(e) => {
                      console.log('Image failed to load:', imageUrl);
                      e.target.style.display = 'none';
                    }} />}
                    <div className='PdSp-3'>
                      <div className='PdSp-4'>
                        <h4>{ product.productId?.price}TND</h4>
                        <Edit2 size={19} onClick={() => {
                          setEditingCartItem(product);
                          setShowBagEdit(true);
                          setquantity(product.quantity);
                          setSelectedSize(product.size);
                          setSelectedColor(product.color);
                          setOriginalSize(product.size); // Store original size
                          setOriginalColor(product.color); // Store original color
                          GetPById(product.productId._id);
                        }} style={{cursor:"pointer"}} />
                        <Trash2 size={19} style={{cursor:"pointer",color:"red"}} onClick={() => DeletePrdCart(product)} />
                      </div>
                      <p>{product.productId?.name}</p>
                      <p>Size: {product.size}</p>
                      <p>Color: {product.color}</p>
                      <p>Quantity: {product.quantity}</p>
                    </div>
                  </motion.div>
                );
              })}
              </div>
              <div className='detailsTotal'>
                <div className='total' style={{display: showBag ?"":"none"}}>
                  <h2>Subtotal</h2>
                  <h2 style={{fontWeight:"600",color:"black"}}>{total}.00 TND</h2>
                </div>
                <div className='total' style={{display: showBag ?"":"none"}}>
                  <h2>Shipping</h2>
                  <h2 style={{fontWeight:"600",color:"black"}}>9.9 TND</h2>
                </div>
                <div className='TotlaPDSBborder'></div>
                <div className='total' style={{display: showBag ?"":"none"}}>
                  <h2 style={{color:"black",fontSize:"16px"}}>Total</h2>
                  <h2 style={{fontWeight:"600",color:"black"}}>{total+9.9} TND</h2>
                </div>
                <button style={{display: showBag ?"":"none"}} className='PdSb-bt' onClick={()=>(navigate('/Commande'),setShowBag(false))}>Passer Commande</button>
              </div>

            </div>
          )}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showBagEdit && (
            <motion.div
              className={`ShoppingBag-Edit ${showBagEdit ? 'open' : ''}`}
              initial={{ width: 0, opacity: 0, x: 100 }}
              animate={{ width: "29%", opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 100 }}
              transition={{
                width: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3, ease: "easeOut" },
                x: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
              }}
              style={{ overflow: "hidden" }}
            >
          <X onClick={() => {
            setShowBagEdit(false);
            setEditingCartItem(null);
            setOriginalSize('');
            setOriginalColor('');
          }} style={{display: showBagEdit ?"":"none",cursor:"pointer", marginLeft:"90%"}}/>
          <h3 style={{display: showBagEdit ?"":"none",position:"absolute"}}>{name}</h3>
          {image && <img style={{display: showBagEdit ?"":"none"}} src={image} alt="Product" />}
          <div className="colorSwatches">
            {colors.map((color, index) => {
              const imgUrl = getImageByColor(product, color);
              return (
                <div
                  key={index}
                  className='color'
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '24px',
                    height: '24px',
                    margin: '5px',
                    display: showBagEdit ?"":"none",
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: color === selectedColor ? '2px solid #303030ff' : '2px solid black',
                    backgroundColor: color,
                    backgroundImage: imgUrl ? `url(${imgUrl})` : undefined,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    boxShadow: '0 0 0 2px #fff inset',
                  }}
                  title={color}
              />
              );
            })}
                </div>
          <div className="sizeOptions-ShopingBag">
            {sizes.map((size, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSize(size)}
                style={{
                  backgroundColor: selectedSize === size ? 'black' : '',
                  display: showBagEdit ?"":"none",
                  color: selectedSize === size ? 'white' : ''
                }}
                className="sizeBtn-ShopingBag"
              >
                {size}
              </button>
            ))}
          </div>
          <div className="quantitySelector" style={{ display: showBagEdit ? "" : "none" }}>
            <h4 >Quantity</h4>

            <div className="controls">
              <button
                onClick={() => {
                  if (quantity > 1) setquantity(quantity - 1);
                }}
                disabled={quantity <= 1}
                className={`btn ${quantity <= 1 ? "disabled" : ""}`}
              >
                <Minus size={18} />
              </button>

              <span className="value">{quantity}</span>

              <button
                onClick={() => {
                  setquantity(quantity + 1);
                }}
                className="btn"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <div className='EditShopBorder' style={{display: showBagEdit ?"":"none"}}>
            <button className='Update' onClick={updateCartItem} >Update</button>
          </div>
            </motion.div>
          )}
        </AnimatePresence>


        {user && ShowUser && (
              <div className="user-menu">
                <div className='user-header'>
                  <div className="user-info">
                    <div className="user-name">{user?.firstName} {user?.lastName}</div>
                    <div className="user-email">{user?.email}</div>
                    <div className="user-role">
                      {user?.role === 'Admin' && 'Administrateur'}
                      {user?.role === 'Technician' && 'Technicien'}
                      {user?.role === 'client' && 'Client'}
                    </div>
                  </div>
                  
                </div>
                <Link to="/profile" onClick={()=>(setIsDropdownOpen(false),setShowUser(false))} className="dropdown-item"><User size={16} /> Mon Profil</Link>
                {(user?.role === 'Admin' || user?.role === 'Owner') && (
                  <Link
                    to="/ManagementDashboard"
                    onClick={() => (setIsDropdownOpen(false),setShowUser(false))}
                    className="dropdown-item"
                  >
                    <ShieldUser size={16} /> Administration
                  </Link>
                )}
                  <button onClick={handleLogout} className="dropdown-item"><LogOut size={16} /> Déconnexion</button>
              </div>
            )}
      </div>
    </div>

  )
}

export default HeaderBar