import os
import json
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="GovTech Auditor API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    filenames: str
    text: str

# Schema definitions
CITATION_STRING = {"type": "STRING", "description": "Referência exata: 'NomeArquivo > Item X.Y'."}

CITATION_ITEM_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "descricao": {"type": "STRING", "description": "Texto fiel à exigência do edital."},
        "citation": CITATION_STRING,
        "status": {"type": "STRING", "enum": ["critical", "warning", "info"]},
    },
    "required": ["descricao", "citation", "status"],
}

DOC_ITEM_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "requisito": {"type": "STRING", "description": "Descrição detalhada do documento ou qualificação exigida."},
        "citation": CITATION_STRING,
    },
    "required": ["requisito", "citation"],
}

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "metadata": {
            "type": "OBJECT",
            "properties": {
                "filename": {"type": "STRING"},
                "orgao": {"type": "STRING"},
                "numero": {"type": "STRING"},
                "objeto": {"type": "STRING"},
                "data_abertura": {"type": "STRING"},
                "horario_abertura": {"type": "STRING"},
                "modo_disputa": {"type": "STRING"},
                "portal": {"type": "STRING", "description": "Portal onde ocorrerá o pregão (ex: Compras.gov, Licitações-e)."},
                "valor_estimado": {"type": "STRING", "description": "Valor total estimado da licitação (R$)."},
            },
            "required": ["filename", "orgao", "numero", "objeto"],
        },
        "go_no_go": {
            "type": "OBJECT",
            "properties": {
                "garantia_proposta": CITATION_ITEM_SCHEMA,
                "patrimonio_liquido": CITATION_ITEM_SCHEMA,
                "visita_tecnica": CITATION_ITEM_SCHEMA,
                "amostra": CITATION_ITEM_SCHEMA,
            },
            "required": ["garantia_proposta", "patrimonio_liquido", "visita_tecnica", "amostra"],
        },
        "regras": {
            "type": "OBJECT",
            "properties": {
                "prazo_entrega": {"type": "OBJECT", "properties": {"value": {"type": "STRING"}, "citation": CITATION_STRING}},
                "vigencia": {"type": "OBJECT", "properties": {"value": {"type": "STRING"}, "citation": CITATION_STRING}},
                "condicao_equipamentos": {
                    "type": "OBJECT", 
                    "properties": {
                        "value": {"type": "STRING", "description": "Se os equipamentos devem ser novos/primeiro uso ou se aceita usados."}, 
                        "citation": CITATION_STRING
                    }
                },
            },
            "required": ["prazo_entrega", "vigencia", "condicao_equipamentos"],
        },
        "habilitacao": {
            "type": "OBJECT",
            "properties": {
                "juridica": {"type": "ARRAY", "items": DOC_ITEM_SCHEMA},
                "fiscal_trabalhista": {"type": "ARRAY", "items": DOC_ITEM_SCHEMA},
                "qualificacao_tecnica": {"type": "ARRAY", "items": DOC_ITEM_SCHEMA},
                "qualificacao_economica": {"type": "ARRAY", "items": DOC_ITEM_SCHEMA},
                "equipe_tecnica": {
                    "type": "ARRAY", 
                    "items": DOC_ITEM_SCHEMA, 
                    "description": "Exigências de Engenheiros, Técnicos, Certificações de Pessoas (CAT)."
                },
            },
            "required": ["juridica", "fiscal_trabalhista", "qualificacao_tecnica", "qualificacao_economica", "equipe_tecnica"],
        },
        "itens": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "id": {"type": "INTEGER"},
                    "nome": {"type": "STRING"},
                    "quantidade": {"type": "STRING"},
                    "unidade": {"type": "STRING"},
                    "citation": CITATION_STRING,
                    "specs": {
                        "type": "ARRAY", 
                        "items": {"type": "STRING"}, 
                        "description": "Lista exaustiva das especificações técnicas linha a linha."
                    },
                },
                "required": ["id", "nome", "specs", "quantidade", "citation"],
            },
        },
    },
    "required": ["metadata", "go_no_go", "regras", "habilitacao", "itens"],
}

def get_api_keys():
    """Extracts a list of API keys from the environment variable, supporting comma-separation."""
    keys_str = os.environ.get("API_KEY", "")
    # Split by comma and strip whitespace
    keys = [k.strip() for k in keys_str.split(",") if k.strip()]
    if not keys:
        print("Warning: No API Keys found in API_KEY environment variable.")
    return keys

@app.post("/analyze")
async def analyze_bid(request: AnalyzeRequest):
    api_keys = get_api_keys()
    if not api_keys:
        raise HTTPException(status_code=500, detail="API Key not configured in server.")
    
    # Shuffle keys to load balance, but we will iterate through all of them if errors occur
    # Creating a rotation list for this request
    rotation_keys = list(api_keys)
    random.shuffle(rotation_keys)
    
    truncated_text = request.text[:150000]

    prompt = f"""
    Você é um Auditor de Licitações Públicas (Lei 14.133/21).
    ARQUIVOS: {request.filenames}
    CONTEXTO: {truncated_text}
    TAREFA: Auditoria de "Dupla Checagem".
    
    1. HABILITAÇÃO: Cruzar Edital x TR. Listar Atestados.
    2. EQUIPE TÉCNICA: Profissionais (Engenheiros, Técnicos).
    3. ITENS: Especificações linha a linha do TR.
    4. METADADOS: Portal, Valor, Horário.
    5. CITAÇÕES: "Arquivo > Item".
    6. CONDIÇÃO EQUIPAMENTOS: Verificar se é exigido que sejam "Novos/Primeiro Uso" ou se "Usados/Seminovos" são permitidos.
    """

    last_error = None

    # Retry/Rotation Loop
    for key in rotation_keys:
        try:
            client = genai.Client(api_key=key)
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RESPONSE_SCHEMA
                )
            )
            
            if not response.text:
                 raise ValueError("IA retornou resposta vazia.")
                 
            # If successful, return immediately
            return json.loads(response.text)

        except Exception as e:
            print(f"Error with key ...{key[-4:]}: {e}")
            last_error = e
            # Continue to next key in loop
            continue

    # If all keys failed
    error_msg = str(last_error) if last_error else "Unknown error"
    raise HTTPException(status_code=500, detail=f"All API keys failed. Last error: {error_msg}")

# Mount React Static Files (Dist)
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
