import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Plus,X } from 'lucide-react';
import { data } from 'react-router-dom';

const AddProduct = () => {
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
      const res = await axios.get("http://192.168.1.17:2025/api/Admin/Get-category",{
        headers: {
          'Authorization': `Bearer ${user.token}`
          }
      });
      setCategories(res.data);     
      console.log(res.data);
       
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
      const res = await axios.get(`http://192.168.1.17:2025/api/Admin/Get-Subcategory/${id}`,{
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

  const AddProduct = async (e) => {
    e.preventDefault();

    if (!name || !price || !categoryId || !genre) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (Object.values(colorImages).every(arr => arr.length === 0)) {
      toast.error("Please upload at least one image for each color");
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
    if (size.length) formData.append("size", JSON.stringify(size));
    if (color.length) formData.append("color", JSON.stringify(color));
    
    // Append images per color
    Object.entries(colorImages).forEach(([colorKey, files]) => {
      files.forEach(file => {
        formData.append(`images[${colorKey}][]`, file);
      });
    });
    
    console.log("=== FRONTEND FORM DATA ===");
    console.log("name:", name);
    console.log("color:", color);
    console.log("price:", price);
    console.log("size:", size);
    console.log("images count:", Object.values(colorImages).flat().length);
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, ":", value);
    }
    
    try {
      const res= await axios.post('http://192.168.1.17:2025/api/Admin/Add-Product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });
      if (res.status === 200) {
        toast.success("Product created successfully");
      }

      // Reset
      setName('');
      setPrice('');
      setCategoryId('');
      setSubcategoryId('');
      setGenre('');
      setStock(0);
      setIsFeatured(false);
      setSize([]);
      setColor([]);
      setColorImages({});
      setSizeInput('');
      setColorInput('');
    } catch (error) {
      console.log("Frontend error:", error);
      console.log("Error response:", error.response?.data);
        toast.error(error.response?.data?.message || 'Server error');
    } 
  };

  return (
    <div className='AddProduct'>
      <Toaster />
      <div className="imagesadd" style={{ display: "flex", flexWrap: "wrap",width:"50%", gap: "10px", marginTop: "10px" }}>
        {Object.entries(colorImages).length === 0 || Object.values(colorImages).every(files => files.length === 0) ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center", 
            width: "100%", 
            marginTop:"30%",
            height: "300px",
            borderRadius: "15px",
            color: "white",
            gap: "15px"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "rgba(255, 255, 255, 0.6)"
            }}>
              📷
            </div>
            <div style={{
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.8)"
            }}>
              Aucune image pour le moment
            </div>
            <div style={{
              textAlign: "center",
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.5)",
              maxWidth: "250px",
              lineHeight: "1.4"
            }}>
              Ajoutez des couleurs et sélectionnez des images pour voir un aperçu ici
            </div>
          </div>
        ) : (
          Object.entries(colorImages).map(([color, files]) =>
            files.map((file, idx) => (
              <div key={color + idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <X style={{color:"white",position:"relative",left:"40%"}}/>
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
          )
        )}
      </div>
      <div className='AddDonner'>
        <h1>Add New Product</h1>
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
                    <div key={c}>
                      <span>{c}</span>
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handleColorImageChange(c, e)}
                      />
                      <button type="button" className='BtAddImg' onClick={triggerFileSelect} style={{ marginBottom: '10px' }}>
                        Choose Images
                      </button> 
                    <button type="button" onClick={() => removeColorImage(c, idx, false)}>×</button>

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
              onClick={AddProduct}
            >
            Create Product
            </button>
          </div>
      </div>
    </div>
  );
};

export default AddProduct;
