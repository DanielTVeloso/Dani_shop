import React, {useContext, useState} from 'react';
import {GlobalState} from '../../GlobalState';
import Menu from './icon/menu.svg';
import Close from './icon/close.svg';
import Cart from './icon/cart.svg';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Header() {
    const state = useContext(GlobalState);
    const [isLogged] = state.userAPI.isLogged;
    const [isAdmin] = state.userAPI.isAdmin;
    const [cart] = state.userAPI.cart;
    const [menu, setMenu] = useState(false);

    const logoutUser = async () => {
        await axios.get('/user/logout');
        localStorage.removeItem('firstLogin');
        window.location.href = "/";
    }

    const adminRouter = () => {
        return (
            <>
                <li><Link to="/create_product">Criar Produtos</Link></li>
                <li><Link to="/category">Categorias</Link></li>
            </>
        )
    }

    const loggedRouter = () => {
        return (
            <>
                <li><Link to="/history">Histórico</Link></li>
                <li><Link to="/" onClick={logoutUser}>Logout</Link></li>
            </>
        )
    }

    const toggleMenu = () => {
        setMenu(!menu)
        console.log(menu)
    }
    const styleMenu = {
        left: menu ? 0 : "-100%"
    }
    return (
        <header>
            <div className="menu" onClick={toggleMenu}>
                <img src={Menu} alt="" width="30"></img>
            </div>

            <div className="logo">
                <h1>
                    <Link to="/">{isAdmin ? 'Admin' : 'Shop do Dani'}</Link>
                </h1>
            </div>

            <ul style={styleMenu}>
                <li><Link to="/">{isAdmin ? 'Produtos' : 'Shop'}</Link></li>
                {isAdmin && adminRouter()}
                {
                    isLogged ? loggedRouter() : <li><Link to="/login">Login | Registre</Link></li>
                }

                <li onClick={toggleMenu}>
                    <img src={Close} alt="" width="30" className="menu"></img>
                </li>
            </ul>

            {
                isAdmin ? '' :
                    <div className="cart-icon">
                        <span>{cart.length}</span>
                        <Link to="/cart">
                            <img src={Cart} alt="" width="30"></img>
                        </Link>
                    </div>
            }


        </header>
    )
}

export default Header
