import React, {useState, useContext, useEffect} from 'react';
import axios from 'axios';
import {GlobalState} from '../../../GlobalState';
import Loading from '../utils/loading/Loading';
import {useHistory, useParams} from 'react-router-dom';

const initialState = {
    product_id: '',
    title: '',
    price: 0,
    description: 'Essa a descrição do seu produto, a descrição do seu produto vai aqui',
    content: 'Esse é o conteúdo do seu produto, o conteúdo do seu produto vai aqui',
    category: '',
    _id: ''

}


function CreateProduct() {
    const state = useContext(GlobalState);
    const [product, setProduct] = useState(initialState);
    const [categories] = state.categoriesAPI.categories;
    const [images, setImages] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(false);

    const [isAdmin] = state.userAPI.isAdmin;
    const [token] = state.token;

    const history = useHistory();
    const param = useParams();

    const [products] = state.productsAPI.products;
    const [onEdit, setOnEdit] = useState(false);
    const [callback, setCallback] = state.productsAPI.callback;
    var formDataAux = new FormData();
    var reader = new FileReader();
    var imageAux = {
        url: "url"
      };

    useEffect(() => {
        if(param.id) {
            setOnEdit(true);
            products.forEach(product => {
                if(product._id === param.id) {
                    setProduct(product);
                    setImages(product.images);  
                }
            })
        } else {
            setOnEdit(false);
            setProduct(initialState);
            setImages(false);
        }
    }, [param.id, products])

    const handleUpload = async e => {
        e.preventDefault()
        
          
       
        try {
            if(!isAdmin) {
                return alert("Você não é administrador");
            }
            const file = e.target.files[0];
            
            if(!file) {
                return alert("O arquivo não existe");
            }

            if(file.size > 1024 * 1024) {  // 1MB
                return alert("O arquivo deve ser menor que 1MB!");
            }

            if(file.type !== 'image/jpeg' && file.type !== 'image/png') {  // 1MB
                return alert("O formato do arquivo está incorreto");
            }

            setLoading(true);
            formDataAux = new FormData();
            formDataAux.append('file', file);
            setFormData(formDataAux);
            //const res = await axios.post('/api/upload', formData, {
            //    headers: {
            //        'content-type' : 'multipart/form-data',
            //        Authorization: token 
            //    }
            //});
            reader.onload = function(e) {
                imageAux.url = e.target.result;
                setImages(imageAux);
            }
            reader.readAsDataURL(e.target.files[0]); // convert to base64 string
            
            setLoading(false);
        } catch (err) {
            alert(err.response.data.msg)
        }
    }

    const handleDestroy = async () => {
        try {
            if(!isAdmin) {
                return alert("Você não é administrador");
            }
            setLoading(true);
            //await axios.post('/api/destroy', {public_id: images.public_id}, {
            //    headers: {Authorization: token}
            //});
            setImages(false);
            setLoading(false);
            //window.location.reload(false);
            
        } catch (err) {
            alert(err.response.data.msg);
        }
    }

    const handleChangeInput = e => {
        const {name, value} = e.target
        setProduct({...product, [name]: value})
    }

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            if(!isAdmin) {
                return alert("Você não é administrador");
            }
            if(!images) {
                return alert("Por favor faça upload de uma imagem");
            }

            if(onEdit) {
                await axios.put(`/api/products/${product._id}`, {...product, images}, {
                    headers: {Authorization: token}
                })
            }else{
                const res = await axios.post('/api/upload', formData, {
                headers: {
                    'content-type' : 'multipart/form-data',
                    Authorization: token 
                }      
            });
                setImages(res.data);
                alert("Produto criado com sucesso!");
                await axios.post('/api/products', {...product, images:res.data}, {
                    headers: {Authorization: token}
                })
            }      
            setCallback(!callback);   
            history.push("/");
        } catch (err) {
            alert(err.response.data.msg)
        }
    }

    const styleUpload = {
        display: images ? "block" : "none"
    }



    return (
        <div className="create_product">
            <div className="upload">
                <input type="file" name="file" id="file_up" onChange={handleUpload}/>
                {
                    loading ? 
                    <div id="file_img"><Loading /></div>

                    :<div id="file_img" style={styleUpload}>
                        <img src={images ? images.url : ''} alt=""/>
                        <span onClick={handleDestroy}>X</span>
                    </div>

                }
                
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <label htmlFor="product_id">ID do Produto</label>
                    <input type="text" name="product_id" id="product_id" required
                    value={product.product_id} onChange={handleChangeInput} disabled={onEdit}/>
                </div>

                <div className="row">
                    <label htmlFor="title">Título</label>
                    <input type="text" name="title" id="title" required
                    value={product.title} onChange={handleChangeInput} />
                </div>

                <div className="row">
                    <label htmlFor="price">Preço</label>
                    <input type="number" name="price" id="price" required
                    value={product.price} onChange={handleChangeInput} />
                </div>

                <div className="row">
                    <label htmlFor="description">Descrição</label>
                    <textarea type="text" name="description" id="description" required
                    value={product.description} rows="5" onChange={handleChangeInput} />
                </div>

                <div className="row">
                    <label htmlFor="content">Conteúdo</label>
                    <textarea type="text" name="content" id="content" required
                    value={product.content} rows="7" onChange={handleChangeInput} />
                </div>

                <div className="row">
                    <label htmlFor="categories">Categorias: </label>
                    <select name="category" value={product.category} onChange={handleChangeInput}>
                        <option value="">Por favor selecione a categoria</option>
                        {
                            categories.map(category => (
                                <option value={category._id} key={category._id}>
                                    {category.name}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <button type="submit">{onEdit ? "Editar" : "Criar"}</button>
            </form>
        </div>
    )
}

export default CreateProduct
