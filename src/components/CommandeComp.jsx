import React,{useState,useEffect,useMemo,useRef,useLayoutEffect} from 'react'
import { Link ,useNavigate} from 'react-router-dom'
import {ShoppingBag,Truck,ChevronDown,ChevronUp  ,MoveRight, Edit2, Trash2  } from 'lucide-react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';

const CommandeComp = () => {
const [value, setValue] = useState(""); // you can remove this if unused
const [nom, setNom] = useState("");
const [prenom, setPrenom] = useState("");
const [email, setEmail] = useState("");
const [telephone, setTelephone] = useState("");
const [rue, setRue] = useState("");
const [ville, setVille] = useState(""); // ✅ fixed lowercase setter
const [complement, setComplement] = useState(""); // ✅ added
const [postal, setPostal] = useState(""); // ✅ added
const navigate=useNavigate()

const provinces = [
  "Ariana",
  "Béja",
  "Ben Arous",
  "Bizerte",
  "Gabès",
  "Gafsa",
  "Jendouba",
  "Kairouan",
  "Kasserine",
  "Kébili",
  "Le Kef",
  "Mahdia",
  "La Manouba",
  "Médenine",
  "Monastir",
  "Nabeul",
  "Sfax",
  "Sidi Bouzid",
  "Siliana",
  "Sousse",
  "Tataouine",
  "Tozeur",
  "Tunis",
  "Zaghouan",
];

const [open, setOpen] = useState(false);
const [province, setprovince] = useState("");
const [selected, setSelected] = useState("Province");
const [productCart, setProductCart] = useState([]);
const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null
  } catch {
    return null
  }
})
const [confirmDelete, setConfirmDelete] = useState(null);
const commandeRef = useRef(null);
const filteredProvinces = provinces.filter((prov) =>
  prov.toLowerCase().includes(province.toLowerCase())
);

const handleSelect = (prov) => {
  setSelected(prov);
  setOpen(false);
  setprovince(prov);
};
// Helpers copied from header to resolve product images consistently
const getSafeImageUrl = (imagePath) => {
  if (!imagePath) return '';
  let normalizedPath = imagePath.replace(/\\/g, '/');
  return normalizedPath.startsWith('http')
    ? normalizedPath
    : `http://142.93.171.166/uploads/${normalizedPath.replace(/^\//, '')}`;
};
const getImageByColor = (product, color, index = 0) => {
  if (!product?.images?.length) {
    return '';
  }
  const match = product.images.find(img =>
    img.color?.toLowerCase() === color?.toLowerCase()
  );
  if (match?.urls?.[index]) {
    return getSafeImageUrl(match.urls[index]);
  }
  const fallback = product.images.find(img => img.urls?.[index]);
  if (fallback) {
    return getSafeImageUrl(fallback.urls[index]);
  }
  return '';
};
const handleGoToProduct = (item) => {
  const id = item.productId?._id;
  if (!id) return;
  navigate(`/PorductSelecte/${id}`, {
    state: {
      parentCategoryId: item.productId?.categoryId,
      subcategoryId: item.productId?.subcategoryId,
      genre: item.productId?.genre,
    }
  });
};
const DeletePrdCart = async (productToDelete) => {
  if (!user?.id) return;
  try {
    const res = await axios.delete('http://142.93.171.166/api/DeletePrdCart', {
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
      toast.success('Produit supprimé du panier');
    }
  } catch (error) {
    console.log(error);
    toast.error('Suppression impossible');
  }
};
const confirmDeleteItem = async () => {
  if (!confirmDelete) return;
  await DeletePrdCart(confirmDelete);
  setConfirmDelete(null);
};
const getProductCart = async () => {  
  if (!user?.id) return;
  try {
    const res = await axios.get(`http://142.93.171.166/api/GetProductCart/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      }
    });

    // Normalize: keep only the array of products
    const products = res.data?.cart?.products || [];
    setProductCart(products);
  } catch (error) {
    console.log(error);
  }
};
const handleOrder = async () => {
  console.log(user.id);
  
  try {
    const res = await axios.post(
      `http://142.93.171.166/api/create-order/${user.id}`,
      {
        nom,
        prenom,
        email,
        telephone,
        rue,
        complement,
        ville,
        province,
        postal
      },
      {
        headers: { Authorization: `Bearer ${user.token}` }
      }
    );

    toast.success('Commande envoyée avec succès');
    navigate('/order-confirmation', { state: { order: res.data.order } });
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Erreur lors de la commande');
  }
};


const total = useMemo(() => {
  return productCart.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0);
}, [productCart]);

  useEffect(() => {
    if (user?.id) {
      getProductCart();
    }
  }, [user?.id]);

  // Update body min-height and overflow based on component height to fix scrollbar
  useLayoutEffect(() => {
    const updateBodyHeight = () => {
      if (commandeRef.current) {
        const height = commandeRef.current.offsetHeight;
        // Use requestAnimationFrame to ensure this runs after other effects
        requestAnimationFrame(() => {
          // Ensure body can scroll (override any other settings)
          document.body.style.overflow = 'auto';
          document.body.style.overflowX = 'hidden';
          // Set min-height to match component height
          document.body.style.minHeight = `${height}px`;
          document.documentElement.style.minHeight = `${height}px`;
        });
      }
    };

    if (!commandeRef.current) {
      // Retry after a short delay if ref isn't ready
      const retryTimer = setTimeout(() => {
        if (commandeRef.current) {
          updateBodyHeight();
        }
      }, 100);
      return () => clearTimeout(retryTimer);
    }

    // Update immediately
    updateBodyHeight();

    // Use ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(() => {
      updateBodyHeight();
    });

    resizeObserver.observe(commandeRef.current);
    
    // Also listen for resize events
    window.addEventListener('resize', updateBodyHeight);
    
    // Update when cart data changes (with a small delay to ensure DOM is updated)
    const timer = setTimeout(updateBodyHeight, 200);
    
    // Continuously ensure overflow is set correctly (in case HeaderBar changes it)
    // Check every 300ms to avoid performance issues
    const overflowCheckInterval = setInterval(() => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = 'auto';
        document.body.style.overflowX = 'hidden';
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
      clearInterval(overflowCheckInterval);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBodyHeight);
      // Cleanup on unmount - restore defaults
      document.body.style.minHeight = '';
      document.documentElement.style.minHeight = '';
    };
  }, [productCart]);

  // Initial mount effect to ensure scrollbar appears immediately
  useEffect(() => {
    // Ensure body can scroll on mount
    requestAnimationFrame(() => {
      document.body.style.overflow = 'auto';
      document.body.style.overflowX = 'hidden';
    });
    
    const timer = setTimeout(() => {
      if (commandeRef.current) {
        const height = commandeRef.current.offsetHeight;
        document.body.style.minHeight = `${height}px`;
        document.documentElement.style.minHeight = `${height}px`;
      }
    }, 150);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
  <div className="Commande" ref={commandeRef}>
    <Link className="h1" to="/" style={{ textDecoration: "none", color: "black" }}>
      <MoveRight  style={{position:"absolute",right:"10px",cursor:"pointer"}}/>
    </Link>
    <Toaster/>
      <h1>Finaliser votre commande</h1>
    <h4>Quelques étapes simples pour recevoir vos produits</h4>

    <div className="facturation">
      {/* FORMULAIRE */}
      <div className="facturation-1">
        {/* Infos destinataire */}
        <div id="Form">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="ICON">
              <ShoppingBag size={21} />
            </div>
            <h3 style={{ margin: "0", marginLeft: "1%" }}>
              Informations sur le destinataire
            </h3>
          </div>
          <div className="form">
            <div className="input-group">
              <input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="nom" className={nom ? "active" : ""}>
                Nom
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                id="prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="prenom" className={prenom ? "active" : ""}>
                Prénom
              </label>
            </div>
            <div className="input-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="email" className={email ? "active" : ""}>
                E-mail
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="telephone" className={telephone ? "active" : ""}>
                Téléphone
              </label>
            </div>
          </div>
        </div>

        {/* Adresse livraison */}
        <div id="Form" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="ICON">
              <Truck size={21} />
            </div>
            <h3 style={{ margin: "0", marginLeft: "1%" }}>Adresse de livraison</h3>
          </div>
          <div className="form">
            <div className="input-group">
              <input
                type="text"
                id="rue"
                value={rue}
                onChange={(e) => setRue(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="rue" className={rue ? "active" : ""}>
                Numéro et nom de rue *
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                id="complement"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="complement" className={complement ? "active" : ""}>
                Escalier, étage... (Facultatif)
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                id="ville"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="ville" className={ville ? "active" : ""}>
                Ville
              </label>
            </div>

            {/* Dropdown provinces */}
            <div className="dropdown">
              <div className="dropdown-btn" onClick={() => setOpen(!open)}>
                {selected} <span>{open ? <ChevronUp /> : <ChevronDown />}</span>
              </div>
              {open && (
                <div className="dropdown-content">
                  <input
                    type="text"
                    placeholder="Cherche ici"
                    value={province}
                    onChange={(e) => setprovince(e.target.value)}
                  />
                  {filteredProvinces.map((prov, i) => (
                    <div
                      key={i}
                      className="dropdown-item"
                      onClick={() => handleSelect(prov)}
                    >
                      {prov}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group">
              <input
                type="text"
                id="postal"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                placeholder=" "
              />
              <label htmlFor="postal" className={postal ? "active" : ""}>
                Code postal
              </label>
            </div>
          </div>
        </div>
        {/* Détails des produits dans le panier */}
        <div className="cart-details" style={{ marginTop: "40px" }}>
          <h3>Produits dans votre panier</h3>
          <div className="cart-list">
            {productCart.map((item, index) => (
              <div
                key={index}
                className="cart-item"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #ddd",
                  padding: "10px 0",
                }}
              >
                <div style={{ flex: 1, cursor: item.productId?._id ? "pointer" : "default" }} onClick={() => handleGoToProduct(item)}>
                  <p><strong>Nom :</strong> {item.productId?.name}</p>
                  <p><strong>Taille :</strong> {item.size}</p>
                  <p><strong>Couleur :</strong> {item.color}</p>
                  <p><strong>Quantité :</strong> {item.quantity}</p>
                </div>
                {/* Image in the middle */}
                <div style={{ flex: 0, minWidth: "130px", textAlign: "center" }} onClick={() => handleGoToProduct(item)}>
                  {(() => {
                    const src = getImageByColor(item.productId, item.color, 0);
                    return src ? (
                      <img
                        src={src}
                        alt={item.productId?.name || "product"}
                        style={{ width: "110px", height: "130px", objectFit: "cover", borderRadius: "6px", cursor: "pointer" }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null;
                  })()}
                </div>
                <div style={{ textAlign: "right", minWidth: "100px" }}>
                  <p style={{ marginBottom: "8px" }}><strong>{item.productId?.price} DT</strong></p>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <Edit2 size={18} style={{ cursor: "pointer" }} onClick={() => handleGoToProduct(item)} title="Modifier" />
                    <Trash2 size={18} style={{ cursor: "pointer",color:"red" }} onClick={() => setConfirmDelete(item)} title="Supprimer" />
                  </div>
                </div>
              </div>
            ))}
          </div>   
        </div>
      </div>

      
      

      {/* RÉSUMÉ ACHAT */}
      <div id='facturation-2' className="facturation-2">
        <h3>Résumé de l’achat ({productCart.length})</h3>
        <div className="Continuer">
        <h4>Total {total.toFixed(2)} DT</h4>
          <div className="btC">
            <button onClick={handleOrder} className="btContinuer">  Continuer la commande</button>
          </div>
        </div>
      </div>
    </div>

    {/* Confirm Delete Modal */}
    {confirmDelete && (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "18px 20px",
          width: "92%",
          maxWidth: "380px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "8px" }}>Supprimer l’article</h3>
          <p style={{ marginTop: 0, color: "#555" }}>
            Voulez-vous vraiment supprimer
            {" "}
            <strong>{confirmDelete?.productId?.name}</strong>
            {" "}
            du panier ?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
            <button onClick={() => setConfirmDelete(null)} style={{ padding: "8px 12px", background: "#eee", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Annuler
            </button>
            <button onClick={confirmDeleteItem} style={{ padding: "8px 12px", background: "#e53935", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    )}

    {/* FOOTER */}
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

  )
}

export default CommandeComp