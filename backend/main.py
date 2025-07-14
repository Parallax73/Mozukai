from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()


origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Product(BaseModel):
    id: int
    name: str
    price: str
    description: str
    sourceImage: str
    sourceModel: str 


products_db = [
    {
        "id": 1,
        "name": "Bonsai Tradicional",
        "price": "R$ 199,90",
        "description": """Características: Planta arbustiva muito ramificada, de ramos finos e que pode chegar a 1,0 m de altura se não controlado por podas.
As folhas são compostas, paripinadas com folíolos bem pequenos, dando às folhas o aspecto de uma pena de ave. As flores são bem pequenas, com estames longos de cor rosa, vermelho ou branco, reunidas em inflorescência. A aparência da inflorescência é de um pompom.
Floresce da primavera ao fim do verão e pode ser cultivada em todo o país e em regiões de calor mais ameno tem uma floração abundante.
Modo de Cultivo: É de fácil cultivo e necessita de sol direto, solo permeável e rico em matéria orgânica. Planta frágil quanto a adubação, não exagerar.
Rega: Esta espécie requer regularmente muita água devido à sua folhagem densa e frondosa. Em períodos quentes pode ser necessário molhar mais de uma vez ao dia, desde que a terra tenha uma boa drenagem, pois estas espécies não toleram o solo constantemente encharcado. No viveiro deve-se regar somente quando o solo estiver levemente seco. Borrifar as folhas com frequência, principalmente se a árvore encontra-se em um ambiente muito seco e exposto ao sol.
Adubação: Aduba-se uma vez a cada dois meses, utilizando fertilizantes orgânicos ou osmocote, sempre intercalando um com o outro. Pode-se utilizar adubos líquidos (foliares) químicos ou orgânicos. Uma boa dica é utilisar o adubo foliar fosway em suas folha uma vez por mes. Isso aumenta e muito a quantidade de flores.
Fotos reais das plantas. Não trabalhamos com anúncios de plantas parecidas.
COMO NOSSOS PRODUTOS SÃO ENVIADOS
Enviamos os nossos produtos via Correios ou transportadora. Possuímos experiência no envio de plantas, ferramentas, insumos e acessórios de Bonsai para todo o Brasil, garantindo que ele chegue com total segurança:
• Caixa reforçada e embalagem interna que garantem proteção contra impactos.""",
        "sourceImage": "/models/bonsai_tree/picture.png",
        "sourceModel": "/models/bonsai_tree/scene.gltf", 
    },
    {
        "id": 2,
        "name": "Ficus Bonsai",
        "price": "R$ 249,90",
        "sourceImage": "/models/chinese_elm/picture.png",
        "sourceModel": "/models/chinese_elm/scene.gltf", 
    },
    
]

@app.get("/products", response_model=List[Product])
async def get_all_products():
    return products_db

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    for product in products_db:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")

