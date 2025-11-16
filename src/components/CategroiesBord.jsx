import React, { useState, useEffect, useRef } from 'react';
import { Eye , SquareArrowRight,Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { ScaleLoader } from "react-spinners"; // Import ScaleLoader

import axios from 'axios'
const CategroiesBord = () => {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [categoryId,setIdCategory]=useState('')
  const [Categorys, setCategorys] = useState([]);
  const [SubCategorys, setSubCategorys] = useState([]);
  const [loading, setLoading] = useState(true); 
  const user=JSON.parse(localStorage.getItem("user"))
  const [showModal,SetShowModal]=useState(false)
  const [showModals,SetShowModals]=useState(false)
  const [showSub,SetShowSub]=useState(false)
  const fileInputRef = useRef(null); 
  const [genre, setGenre] = useState('');



  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };
  const triggerFileSelect = () => {
    fileInputRef.current.click(); // 👈 Trigger file picker
  };
  const AddCategory = async()=>{
    if (!name) {
      toast.error("Category Name required")
      return
    }
    const formadata= new FormData()
    formadata.append('name',name)
    formadata.append('icon',icon)
    images.forEach((image)=>{
      formadata.append('images',image)
    })
    try {
      const res= await axios.post('https://142.93.171.166/api/Admin/Add-category',
        formadata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      if (res.status === 200) {
        toast.success("Category Created successfully")
        SetShowModal(false)
        setImages([])
        setImagePreviews([])
        setName('')
        getCategory() // Refresh the categories list
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status != 200) {
        toast.error(error.response?.data?.message)
      }
      
    }
  }
  const AddSubCategory = async()=>{
    if (!subCategoryName || !genre) {
      toast.error("SubCategory Name required")
      return
    }
    const formadata= new FormData()
      formadata.append('name',subCategoryName)
      formadata.append('genre',genre)
      formadata.append('categoryId',categoryId)
      if (images.length > 0) {
        images.forEach((image)=>{
        formadata.append('images',image)
      })
      }
    try {
      const res= await axios.post('https://142.93.171.166/api/Admin/Add-CategorySub',
        formadata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      if (res.status === 201) {
        toast.success("SubCategory Created successfully")
        // SetShowSub(false)
        setImages([])
        setImagePreviews([])
        setSubCategoryName('')
        getSubCategory(categoryId)
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status != 201) {
        toast.error(error.response?.data?.message)
      }
      
    }
  }
    const getCategory = async () => {  
    try {
      const res = await axios.get("https://142.93.171.166/api/Admin/Get-category",{
        headers: {
          'Authorization': `Bearer ${user.token}`
          }
      });
      setCategorys(res.data);      
      setLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message)
      }
      setLoading(false);
    }
  };
    const getSubCategory = async (id) => {  
    try {
      const res = await axios.get(`https://142.93.171.166/api/Admin/Get-Subcategory/${id}`,{
        headers: {
          'Authorization': `Bearer ${user.token}`
          }
      });
      setSubCategorys(res.data);      
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
    getCategory();
  }, []);
  const deleteUser = async (id) => {
    toast((t) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "white" }}>
        <p>Are you sure you want to delete this SubCategor?</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={() => confirmDelete(id, t.id)}
            style={{ background: "red", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "gray", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            No
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const confirmDelete = async (id, toastId) => {
    try {
      // TODO: Replace hardcoded API URL with environment variable for production
      const res = await axios.delete(`https://142.93.171.166/api/Admin/Delete-SubCategory/${id}`,{
        headers: {
          'Authorization': `Bearer ${user.token}`
          }
      });
      if (res.status === 200) {
        toast.dismiss(toastId);
        toast.success("SubCategory deleted successfully!");
        getSubCategory();
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message || 'Server error occurred');
      }
    }
  };
  return (
    <div className='CategroiesDashBord'>
      <Toaster/>

      {showModal ?(
        <div className='Modal'>
          <h2>Add New Category</h2>
          <input type="text" onChange={(e)=>setName(e.target.value)} placeholder='Category Name'/>
          <input type="text"  onChange={(e)=>setIcon(e.target.value)} placeholder='Icon'/>
          <div>
            <button type="button" className='ChooseimgCategor' onClick={triggerFileSelect} style={{ marginBottom: '10px' }}>
              Choose Images
            </button>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                {imagePreviews.map((preview, index) => (
                  <img key={index} src={preview} alt={`Preview ${index}`} style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                ))}
              </div>
            )}
          </div> 
          <div style={{display:"flex",justifyContent:"space-around",width:"100%",marginTop:"4%"}}>
            <button className='AddCancel' onClick={()=>SetShowModal(false)}>Cancel</button>
            <button className='AddCancel'onClick={AddCategory} style={{backgroundColor:"green"}}>Add</button>
          </div>
        </div>
      ):('')}
      {showSub ?(
        <div className='SubModal'>
        <h3>{name} </h3>
        <select className='SubMSelecte'   onChange={(e) => setGenre(e.target.value)} name="" id="">
          <option value="">Select genre</option>
          <option value="men">men</option>
          <option value="women">women</option>
        </select>
        <div style={{display:"flex"}}>
          <div className='ListSub'>
            {SubCategorys.filter((subcategory) => subcategory.genre === genre ).map((subcategory)=>{
              return <p style={{display:"flex",justifyContent:"space-between"}} onClick={()=>deleteUser(subcategory._id)} key={subcategory._id}>{subcategory.name}  <Trash2 size={15} style={{color:"red",cursor:"pointer",marginRight:"15px"}}/></p>
            })}
          </div>  
          <div className='AddSub'>
            <h3>Add New SubCategory</h3>
            <input type="text" onChange={(e)=>setSubCategoryName(e.target.value)} placeholder='SubCategory Name'/>
            {genre ? (
              <p style={{ color: '#8bc34a', marginTop: '8px' }}>
                This subcategory will be added to: <strong>{genre}</strong>
              </p>
            ) : (
              <p style={{ color: '#f44336', marginTop: '8px' }}>
                Please select a genre to continue
              </p>
            )}
          </div>
        </div>
        <div style={{display:"flex",width:"100%",justifyContent:"flex-end"}}>
          <button className='AddCancel' onClick={()=>(SetShowSub(false),setGenre(''))}>Cancel</button>
          <button className='AddCancel'onClick={AddSubCategory} style={{backgroundColor:"green"}}>Add</button>
        </div>
        </div>
      ):('')}
      <div className="HeaderMangment">
          <h2>Categories Mangment Dashbord</h2>
          {/* <div className='recherche-categorie'>
            <input onChange={(e) =>setSearchTerm(e.target.value)} type="text" placeholder='Search with E-mail' />
            <Search style={{cursor:"pointer",color:"black"}}/>
          </div> */}
            <button className='ADDCatg' onClick={()=>SetShowModal(true)}>Add Categoie</button>
      </div>
      {loading ? (
        <ScaleLoader style={{position:"absolute",top:"50%",marginLeft:"40%",fontSize:"xx-large"}} color="white" />
        ) :( 
          <div className='div-categories'>
            {Categorys.map((category) => 
            <div key={category._id} className='categorie'>
              <div style={{width:"80%",height:"100%",}}>
                <h3>{category.name}</h3>
                <button className='viewSub' onClick={()=>(getSubCategory(category._id),SetShowSub(true),setIdCategory(category._id),setName(category.name))}>View Subcategories</button>
              </div>
            </div>)}
          </div>)
      }
    </div>
  )
}

export default CategroiesBord