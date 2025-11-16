import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const ModifyProduct = ({id,setModify}) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [genre, setGenre] = useState('');
  const [stock, setStock] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);

  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  const [colorImages, setColorImages] = useState({}); // { Red: [File, File], Blue: [File] }
  const [existingColorImages, setExistingColorImages] = useState({}); // For existing images
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setColorImages(prev => ({
      ...prev,
      global: [...(prev.global || []), ...files]
    }));
  };

  const getCategory = async () => {  
    try {
      const res = await axios.get("http://142.93.171.166/api/Admin/Get-category",{
        headers: {
          'Authorization': `Bearer ${user.token}`
          }
      });
      setCategories(res.data);     
       
      setLoading(false);
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message)
      }
      setLoading(false);
    }
  };

  const getSubCategory = async (id) => {  
    try {
      const res = await axios.get(`http://142.93.171.166/api/Admin/Get-Subcategory/${id}`,{
        headers: {
          'Authorization': `Bearer ${user.token}`
          }
      });
      setSubcategories(res.data);      
      setLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message)
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = subcategories.filter(sub => sub.genre === genre);
    setFilteredSubcategories(filtered);
  }, [subcategoryId, genre, subcategories]);

  useEffect(() => {
    GetProduct();
    getCategory();
  }, []);

  const handleColorImageChange = (colorKey, e) => {
    const files = Array.from(e.target.files);
    setColorImages(prev => ({
      ...prev,
      [colorKey]: [...(prev[colorKey] || []), ...files]
    }));
  };

  const addSize = () => {
    const trimmed = sizeInput.trim();
    if (trimmed && !size.includes(trimmed)) {
      setSize([...size, trimmed]);
      setSizeInput('');
    }
  };

  const removeSize = (index) => {
    setSize(size.filter((_, i) => i !== index));
  };

  const addColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && !color.includes(trimmed)) {
      setColor([...color, trimmed]);
      setColorInput('');
      setColorImages(prev => ({ ...prev, [trimmed]: [] }));
    }
  };

  const removeColor = (index) => {
    const colorToRemove = color[index];
    setColor(color.filter((_, i) => i !== index));
    setColorImages(prev => {
      const newColorImages = { ...prev };
      delete newColorImages[colorToRemove];
      return newColorImages;
    });
    setExistingColorImages(prev => {
      const newExistingColorImages = { ...prev };
      delete newExistingColorImages[colorToRemove];
      return newExistingColorImages;
    });
  };

  const removeColorImage = (colorKey, idx, isExisting) => {
    if (isExisting) {
      setExistingColorImages(prev => ({
        ...prev,
        [colorKey]: prev[colorKey].filter((_, i) => i !== idx)
      }));
    } else {
      setColorImages(prev => ({
        ...prev,
        [colorKey]: prev[colorKey].filter((_, i) => i !== idx)
      }));
    }
  };

  const GetProduct = async () => {
    try {
      const res = await axios.get(`http://142.93.171.166/api/Admin/Get-product/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const product = res.data;
      

      setName(product.name || '');
      setPrice(product.price || '');
      setCategoryId(product.categoryId || '');
      setSubcategoryId(product.subcategoryId || '');
      setGenre(product.genre || '');
      setSize(Array.isArray(product.size) ? product.size : []);
      setColor(Array.isArray(product.color) ? product.color : []);
      setStock(product.stock || 0);
      setIsFeatured(product.isFeatured || false);

      // Handle existing images
      if (Array.isArray(product.images)) {
        const existingImages = {};
        product.images.forEach(img => {
          if (img.color && img.urls) {
            existingImages[img.color] = img.urls;
          }
        });
        setExistingColorImages(existingImages);
      }



      // Get subcategories if categoryId exists
      if (product.categoryId) {
        getSubCategory(product.categoryId);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Erreur lors du chargement du produit');
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name || !price || !categoryId || !genre) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("categoryId", categoryId);
    formData.append("genre", genre);
    formData.append("stock", stock);
    formData.append("isFeatured", isFeatured);

    if (subcategoryId) formData.append("subcategoryId", subcategoryId);
    if (size.length) {
      size.forEach(s => formData.append("size[]", s));
    }
    if (color.length) {
      color.forEach(c => formData.append("color[]", c));
    }

    // Append new images per color
    Object.entries(colorImages).forEach(([colorKey, files]) => {
      files.forEach(file => {
        formData.append(`images[${colorKey}][]`, file);
      });
    });

    // Append existing images
    Object.entries(existingColorImages).forEach(([colorKey, urls]) => {
      formData.append(`existingImages[${colorKey}]`, JSON.stringify(urls));
    });


    for (let [key, value] of formData.entries()) {
      console.log(key, ":", value);
    }
    
    try {
      const res = await axios.put(`http://142.93.171.166/api/Admin/UpdateProduct/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });
      
      if (res.status === 200) {
        toast.success("Product updated successfully");
      setModify(false);
      }
    } catch (error) {
      console.log("Frontend error:", error);
      console.log("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };
  const DeleteProduct = async () => {
    try {
      const res = await axios.delete(`http://142.93.171.166/api/Admin/Delete-Product/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.status === 200) {
        setModify(false)
        window.location.reload();
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Erreur lors du chargement du produit');
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className='AddProduct'>
        <div style={{ textAlign: 'center', color: 'white', marginTop: '20px' }}>
          Chargement des données du produit...
        </div>
      </div>
    );
  }

  return (
    <div className='AddProduct'>
      <Toaster />
      <div className="imagesadd" style={{ display: "flex", flexWrap: "wrap",width:"50%", gap: "10px", marginTop: "10px" }}>
        {(() => {
          const hasExistingImages = Object.values(existingColorImages).some(urls => urls.length > 0);
          const hasNewImages = Object.values(colorImages).some(files => files.length > 0);
          
          
          
          return (
            <>
              {/* Existing Images */}
              {Object.entries(existingColorImages).map(([color, urls]) =>
                urls.map((url, idx) => (
                  <div key={`existing-${color}-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <X 
                      style={{color:"white",position:"relative",left:"40%", cursor: "pointer"}}
                      onClick={() => removeColorImage(color, idx, true)}
                    />
                    <img
                      src={`http://142.93.171.166/uploads/${url}`}
                      alt={`${color} ${idx}`}
                      style={{
                        width: "160px",
                        height: "190px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: `2px solid ${color}`,
                        marginBottom: "4px"
                      }}
                    />
                    <span style={{ fontSize: "10px", color:"white" }}>{color}</span>
        </div>
                ))
              )}
              
              {/* New Images */}
              {Object.entries(colorImages).map(([color, files]) =>
                files.map((file, idx) => (
                  <div key={`new-${color}-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <X 
                      style={{color:"white",position:"relative",left:"40%", cursor: "pointer"}}
                      onClick={() => removeColorImage(color, idx, false)}
                    />
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{
                        width: "160px",
                        height: "190px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: `2px solid ${color}`,
                        marginBottom: "4px"
                      }}
                    />
                    <span style={{ fontSize: "10px", color:"white" }}>{color}</span>
                  </div>
                ))
              )}
            </>
          );
        })()}
      </div>
      <div className='AddDonner'>
        <X onClick={()=>setModify(false)} style={{position:"absolute",right:"10px",cursor:"pointer"}}/>
        <h1>Modifier le produit</h1>
          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner'>
              <p>Name *</p>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
        </div>
            <div className='donner'>
              <p>Price *</p>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder='Price' />
        </div>
        </div>

          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner'>
              <p>Category *</p>
              <select value={categoryId} onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId('');
                getSubCategory(e.target.value);
              }}>
                <option value="">Select Category</option>
            {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
            <div className='donner'>
              <p>Genre *</p>
              <select value={genre} onChange={(e) => {
                setGenre(e.target.value);
                setSubcategoryId('');
              }}>
                <option value="">Genre</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
            </div>
        </div>

          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner'>
              <p>SubCategory</p>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                disabled={!categoryId || !genre}
              >
                <option value="">Select SubCategory</option>
                {filteredSubcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
          </select>
            </div>
            <div className='donner'>
              <p>Stock</p>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" />
            </div>
        </div>

          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner'>
              <p>Sizes</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder='Add size (e.g., S, M, L)'
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <button type="button" onClick={addSize} className='plus'><Plus /></button>
              </div>
              {size.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                  {size.map((s, i) => (
                    <span key={i} style={{ background: "#e0e0e0", color: "black", padding: "2px 10px", borderRadius: "12px", fontSize: "12px" }}>
                      {s} <button type="button" onClick={() => removeSize(i)} style={{ border: "none", background: "none", cursor: "pointer" }}>×</button>
                    </span>
                  ))}
                </div>
              )}
        </div>

            <div className='donner'>
              <p>Colors</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder='Add color (e.g., Black, Red)'
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <button type="button" onClick={addColor} className='plus'><Plus /></button>
              </div>
              {color.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                  {color.map((c, i) => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ background: "#e0e0e0", color: "black", padding: "2px 10px", borderRadius: "12px", fontSize: "12px" }}>
                        {c}
                      </span>
              <input
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handleColorImageChange(c, e)}
                        id={`file-${c}`}
                      />
                      <button 
                        type="button" 
                        className='BtAddImg' 
                        onClick={() => document.getElementById(`file-${c}`).click()}
                        style={{ marginBottom: '10px' }}
                      >
                        Choose Images
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeColor(i)}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "red" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner' style={{display:"flex",}}>
              <p>Featured Product</p>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ marginTop: '10px' }}
              />
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button style={{
                padding: "10px 60px",
                borderRadius: "8px",
                border: "none",
                background: "#a50505ff",
                color: "white",
                marginRight:"3%",
                cursor: "pointer"
              }} onClick={DeleteProduct}>delete</button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#4CAF50",
                color: "white",
                cursor: "pointer"
              }}
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
            
          </div>
        </div>
    </div>
  );
};

export default ModifyProduct;
