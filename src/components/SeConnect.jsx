import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CircleX, Mail, House, Shirt, Lock, Phone, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'

import mobile1 from '../images/vetment/pontalon-6-0.png'
import mobile2 from '../images/vetment/pontalon-5-1.png'
import mobile3 from '../images/product-32-0.png'
import mobile4 from '../images/Chaussures/baskets-14-1.png'
import { motion } from "framer-motion";

const Login = () => {
    const [from, setForm] = useState(true)
    const [email, setEmail] = useState('')
    const [emailerror, setEmailError] = useState('')
    const [phoneNumber, setphoneNumber] = useState('')
    const [phoneError, setphoneNumberError] = useState('')
    const [password, setPassword] = useState('')
    const [showpassword, setShowPassword] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const navigate = useNavigate()

    function isNumber(phoneNumber) {
        var pattern = /^\d+\.?\d*$/;
        return pattern.test(phoneNumber);
    }

    const SignUP = async () => {
        var checkPhone = isNumber(phoneNumber)
        console.log(email);
        console.log(phoneNumber);
        console.log(password);

        if (!email || !phoneNumber || !password) {
            return toast.error("All fields are required")
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return setEmailError(<>Invalid Email <CircleX size={15} style={{ position: 'relative', top: "5px" }} /></>)
        }
        if (!checkPhone) {
            setphoneNumberError(<>Invalid Phone Number <CircleX size={15} style={{ position: 'relative', top: "5px" }} /></>)
        }
        if (password.length < 6) {
            setPasswordError(<>Invalid password <CircleX size={15} style={{ position: 'relative', top: "5px" }} /></>)
            return
        }
        try {
            const res = await axios.post('http://192.168.1.17:2025/api/SignUp', {
                email,
                phoneNumber,
                password
            })
            console.log(res)

            if (res.status === 201) {
                console.log(res.data);
                toast.success('Welcome Account created')
                localStorage.setItem('user', JSON.stringify(res.data))
                setTimeout(() => {
                    navigate("/", { replace: true });
                    window.location.reload();
                }, 1000);
                setEmail('')
                setPassword('')
                setphoneNumber('')
                setEmailError('')
                setphoneNumberError('')
                setPasswordError('')
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Server error occurred');
        }
    }

    const SignIn = async () => {
        if (!email || !password) {
            toast.error("All fields are required")
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError(<>Invalid Email <CircleX size={15} style={{ position: 'relative', top: "5px" }} /></>)
        }
        if (password.length < 6) {
            setPasswordError(<>Invalid password <CircleX size={15} style={{ position: 'relative', top: "5px" }} /></>)
            return
        }
        try {
            const res = await axios.post('http://192.168.1.17:2025/api/SignIn', {
                email,
                phoneNumber,
                password
            })
            if (res.status === 200) {
                toast.success('Welcome Back')
                localStorage.setItem('user', JSON.stringify(res.data))
                setTimeout(() => {
                    navigate("/", { replace: true });
                    window.location.reload();
                }, 1000);
                setEmail('')
                setPassword('')
                setEmailError('')
                setPasswordError('')
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Server error occurred');
        }
    }

    const DisplayForm = () => {
        if (from === false) {
            return (
                <div className='DivDisplay' style={{height:"auto"}}>
                    <House onClick={() => navigate("/")} size={23} strokeWidth={3} style={{ position: "absolute", cursor: 'pointer', top: "10px", right: "10px" }} />
                    <Toaster />
                    <h1 style={{ marginTop: "4%" }}>Welcome</h1>
                    <h4>Create your Account</h4>
                    <p>E-mail</p>
                    <div style={{ position: "relative", width: "100%" }}>
                        <Mail id='MobileIC' size={19} style={{ position: "absolute",  top: "52%", transform: "translateY(-50%)", color: "gray" }} />
                        <input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Es@gmail.com"
                            style={{
                                paddingLeft: "35px",
                                height: "40px",
                                width: "60%",
                            }}
                        />
                    </div>
                    {emailerror && <p id='errorP' style={{ color: 'red', fontSize: '12px' }}>{emailerror}</p>}
                    <p>Phone Number</p>
                    <div style={{ position: "relative", width: "100%" }}>
                        <Phone id='MobileIC' size={19} style={{ position: "absolute",  top: "52%", transform: "translateY(-50%)", color: "gray" }} />
                        <input
                            type="text"
                            onChange={(e) => setphoneNumber(e.target.value)}
                            placeholder="+216"
                            style={{
                                paddingLeft: "35px",
                                height: "40px",
                                width: "60%",
                            }}
                        />
                    </div>
                    {phoneError && <p id='errorP' style={{ color: 'red', fontSize: '12px' }}>{phoneError}</p>}
                    <p>Password</p>
                    <div style={{ position: "relative", width: "100%" }}>
                        <Lock id='MobileIC' size={19} style={{ position: "absolute",  top: "52%", transform: "translateY(-50%)", color: "gray" }} />
                        <input
                            type={showpassword ? "text" : "password"}
                            placeholder="*********"
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                paddingLeft: "35px",
                                height: "40px",
                                width: "60%",
                            }}
                        />
                        <Eye id='MobileIC1' onClick={() => setShowPassword(!showpassword)} size={19} style={{ cursor: "pointer", position: "absolute",  top: "52%", transform: "translateY(-50%)", color: "gray" }} />
                    </div>
                    {passwordError && <p id='errorP' style={{ color: 'red', fontSize: '12px' }}>{passwordError}</p>}
                    <button className='seconnectBt' onClick={SignUP}>Sign Up</button>
                    <h5 style={{ color: "rgb(184, 183, 183)" }}>
                        {from ? "You don't have Account?" : "Already have Account?"}
                        <span style={{ cursor: "pointer", color: "black", textDecoration: "underline", fontWeight: "600" }} onClick={() => (setForm(!from), setEmail(''), setPassword(''), setphoneNumber(''))}>
                            {from ? 'Sign Up' : 'Sign In'}
                        </span>
                    </h5>
                </div>
            )
        } else {
            return (
                <div className='DivDisplay'>
                    <House onClick={() => navigate("/")} size={23} strokeWidth={3} style={{ position: "absolute", cursor: 'pointer', top: "10px", right: "10px" }} />
                    <Toaster />
                    <h1 style={{ marginTop: "4%" }}> Welcome Back</h1>
                    <h4>Sign in to continue to your account</h4>
                    <p>E-mail</p>
                    <div style={{ position: "relative", width: "100%" }}>
                        <Mail id='MobileIC' size={19} style={{ position: "absolute",  top: "52%", transform: "translateY(-50%)", color: "gray" }} />
                        <input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Es@gmail.com"
                            style={{
                                paddingLeft: "35px",
                                height: "40px",
                                width: "60%",
                            }}
                        />
                    </div>
                    {emailerror && <p id='errorP' style={{ color: 'red', fontSize: '12px' }}>{emailerror}</p>}
                    <p>Password</p>
                    <div style={{ position: "relative", width: "100%" }}>
                        <Lock id='MobileIC' size={19} style={{ position: "absolute",  top: "52%", transform: "translateY(-50%)", color: "gray" }} />
                        <input
                            type={showpassword ? "text" : "password"}
                            placeholder="*********"
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                paddingLeft: "35px",
                                height: "40px",
                                width: "60%",
                            }}
                        />
                        <Eye id='MobileIC1' onClick={() => setShowPassword(!showpassword)} size={19} style={{ cursor: "pointer", position: "absolute",  top: "52%", transform: "translateY(-50%)", color: "gray" }} />
                    </div>
                    {passwordError && <p id='errorP' style={{ color: 'red', fontSize: '12px' }}>{passwordError}</p>}
                    <Link to='/ResetPassword' style={{ textDecoration: "none", color: "black" }}>
                        <h4 id='Resetph4'>Forgot password?</h4>
                    </Link>
                    <button className='seconnectBt' onClick={SignIn}>Sign In</button>
                    <h5 style={{ color: "rgb(184, 183, 183)" }}>
                        {from ? "You don't have Account?" : "Already have Account?"}
                        <span style={{ cursor: "pointer", color: "black", textDecoration: "underline", fontWeight: "600" }} onClick={() => (setForm(!from), setEmail(''), setPassword(''), setphoneNumber(''))}>
                            {from ? 'Sign Up' : 'Sign In'}
                        </span>
                    </h5>
                </div>
            )
        }
    }

    return (
        <div className='SeConnect'>
            <div className="SeConnect-1">
                <div className="pc-page">
                    <div className="pc-wrap">
                        <div className="pc-card">
                            <p className="pc-prompt">
                                We are passionate about creating high-quality, stylish clothing that empowers individuals to express their unique personality
                            </p>

                            <div className="pc-controls">
                                <div className="pc-left">
                                    <button className="pc-btn pc-btn-icon pc-plus" aria-label="add">+</button>

                                    <div className="pc-tag">
                                        <span className="pc-tag-icon">⚡</span>
                                        <span className="pc-tag-text">Inspiration</span>
                                        <span className="pc-tag-caret">▾</span>
                                    </div>
                                </div>

                                <div className="pc-center">
                                    <div className="pc-variant">Es 1.0</div>
                                </div>

                                <div className="pc-right">
                                    <button className="pc-btn pc-btn-icon pc-mic" aria-label="mic"><Shirt /></button>
                                    <button className="pc-send" aria-label="send">Es</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="SeConnect-2">
                <House onClick={() => navigate("/")} size={23} strokeWidth={3} style={{ position: "absolute", cursor: 'pointer', top: "10px", right: "10px" }} />
                <div key={from ? "sign-in" : "sign-up"} className="fade-in">
                    <Toaster />
                    {DisplayForm()}
                </div>
            </div>
            <div className='MobileConnect'>
            {DisplayForm()}
            <div className='ImagesConnect'>
            <motion.img
                src={mobile1}
                className='ImagesConnect1'
                alt=''
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            />
            <motion.img
                src={mobile4}
                className='ImagesConnect2'
                alt=''
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            />
            <motion.img
                src={mobile2}
                className='ImagesConnect2'
                alt=''
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
            />
            <motion.img
                src={mobile3}
                className='ImagesConnect3'
                alt=''
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
            />
            </div>
            </div>
        </div>
    )
}

export default Login
