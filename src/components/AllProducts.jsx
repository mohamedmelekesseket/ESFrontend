import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import ModifyProduct from './ModifyProduct';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AllProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [Categorys, setCategorys] = useState([]);
  const [SubCategorys, setSubCategorys] = useState([]);
  const [filteredSubCategorys, setFilteredSubCategorys] = useState([]);
  const [Products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});
  const [modify, setModify] = useState(false);
  const [IdProduct, setIdProduct] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [hoveredProductId, setHoveredProductId] = useState(null);

  const getCategory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-category`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setCategorys(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch categories");
    }
  };

  const getSubCategory = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-Subcategory/${id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setSubCategorys(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch subcategories");
    }
  };

  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-products`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      setProducts(res.data);
      setFilteredProducts(res.data);

      const initialColors = {};
      res.data.forEach(product => {
        initialColors[product._id] = Array.isArray(product.color) ? product.color[0] : '';
      });
      setSelectedColors(initialColors);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    }
  };

  useEffect(() => {
    getCategory();
    getProducts();
  }, [modify]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    if (e.target.value) {
      getSubCategory(e.target.value);
    } else {
      setSubCategorys([]);
    }
    setSelectedSubCategory('');
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setSelectedSubCategory('');
  };

  useEffect(() => {
    if (SubCategorys.length > 0) {
      let filtered = SubCategorys;
      if (selectedGenre) {
        filtered = filtered.filter(sub => sub.genre === selectedGenre);
      }
      setFilteredSubCategorys(filtered);
    }
  }, [SubCategorys, selectedGenre]);

  useEffect(() => {
    let filtered = Products;

    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(product => product.subcategoryId === selectedSubCategory);
    }

    if (selectedGenre) {
      filtered = filtered.filter(product => product.genre === selectedGenre);
    }

    setFilteredProducts(filtered);
  }, [Products, selectedCategory, selectedSubCategory, selectedGenre]);

const getSafeImageUrl = (imagePath) => {
  if (!imagePath) return '';

  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Normalize slashes
  let normalizedPath = imagePath.replace(/\\/g, '/');

  // Remove 'server/' prefix if present
  normalizedPath = normalizedPath.replace(/^server\//, '');

  // Remove leading slashes
  normalizedPath = normalizedPath.replace(/^\/+/, '');

  // Ensure path starts with 'uploads/'
  if (!normalizedPath.startsWith('uploads/')) {
    normalizedPath = 'uploads/' + normalizedPath;
  }

  // Return full URL
  return `https://esseket.duckdns.org/${normalizedPath}`;
};


const getImageByColor = (product, color) => {
  if (!product?.images?.length) return '';

  const firstItem = product.images[0];

  if (typeof firstItem === 'string') {
    return getSafeImageUrl(firstItem);
  }

  if (typeof firstItem === 'object') {
    const match = product.images.find(img =>
      img.color?.toLowerCase() === color?.toLowerCase()
    );
    if (match?.urls?.[0]) {
      return getSafeImageUrl(match.urls[0]);
    }

    const fallback = product.images.find(img => img.urls?.[0]);
    if (fallback) {
      return getSafeImageUrl(fallback.urls[0]);
    }
  }

  return '';
};



const getSecondImageByColor = (product, color) => {
  if (!product?.images?.length) return '';
  const firstItem = product.images[0];
  if (typeof firstItem === 'object') {
    const match = product.images.find(img =>
      img.color?.toLowerCase() === color?.toLowerCase()
    );
    if (match?.urls?.[1]) {
      return getSafeImageUrl(match.urls[1]);
    }
  }
  return '';
};

  return (
    <div className='AllProduct'>
      <Toaster />
      <div className="HeaderMangment">
        <h2>Products Management Dashboard</h2>
      </div>

      <div className='FilterDiv'>
        <div className='SearchPrd'>
          <Search />
          <input type="text" placeholder='Search By Name' />
        </div>

        <div className='Sub-Category'>
          <div style={{ width: "33%" }}>
            <h3>Category</h3>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              {Categorys.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div style={{ width: "33%" }}>
            <h3>Genre</h3>
            <select value={selectedGenre} onChange={handleGenreChange}>
              <option value="">All Genres</option>
              <option value="women">Femme</option>
              <option value="men">Homme</option>
            </select>
          </div>

          <div style={{ width: "33%" }}>
            <h3>SubCategory</h3>
            <select
              value={selectedSubCategory}
              onChange={e => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory}
            >
              <option value="">All SubCategories</option>
              {filteredSubCategorys.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {modify && (
        <div className='MProductblur'>
          <div className='MProduct'>
            <ModifyProduct setModify={setModify} id={IdProduct} />
          </div>
        </div>
      )}

      <div className='CardsProducts'>
        {filteredProducts.map((product) => {
          const color = selectedColors[product._id];
          const mainImg = getImageByColor(product, color);
          const secondImg = getSecondImageByColor(product, color);
          const isHovered = hoveredProductId === product._id;
          return (
            <div  onClick={() => { setModify(true); setIdProduct(product._id); }} className="product" key={product._id}>
              <div style={{overflow:"hidden",position:"relative",height:"80%"}}>
              <img
                src={isHovered && secondImg ? secondImg : mainImg}
                alt={product.name}
                onMouseEnter={() => setHoveredProductId(product._id)}
                onMouseLeave={() => setHoveredProductId(null)}
                />
                </div>
              <p>{product.name}</p>
              <h3 style={{ color: "blue" }}>{product.price}</h3>
              <div className='Colors'>
                {product.color.map((color, index) => {
                  const imgUrl = getImageByColor(product, color);
                  const safeImgUrl = imgUrl ? imgUrl.replace(/\\/g, '/') : undefined;
                  return (
                    <div
                      key={index}
                      className='color'
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColors(prev => ({
                          ...prev,
                          [product._id]: color
                        }));
                      }}
                      style={{
                        width: "24px",
                        height: "24px",
                        margin: "5px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        border: `1px solid black`,
                        backgroundColor: color,
                        backgroundImage: safeImgUrl ? `url(${safeImgUrl})` : undefined,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        boxShadow: "0 0 0 2px #fff inset"
                      }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllProducts;
