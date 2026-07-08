# Nevermore API (FastAPI)

## Levantar servicio en local (poetry requerido)
1. Renombrar fichero .env_template por .env y rellenar las variables
2. Instalar librerias con poetry: `poetry install` (uso del fichero de configuración pyproject.toml).
También se puede usar un entorno virtual de python e instalar librerías usando el fichero requeriments.txt
   1. Para añadir nuevas libreria ejecutamos `poetry add xxx` siendo 'xxx' el nombre la librería a instalar
   2. Después debemos exportar la librería al fichero requerments.txt (necesario para el despliegue) `poetry export -f requirements.txt --output requirements.txt --without-hashes`
3. Levantar el servicio de Uvicorn usando poetry: `poetry run uvicorn api.main:app --reload`
Sino se uso poetry se puede levantar directamente `uvicorn api.main:app --reload`

## Uso de websocket
Necesario instalar `poetry add uvicorn[standard]`
### Añadir libreria bradcaster con redis
`poetry add broadcaster[redis]`

## Generate model from database
Install 'sqlacodegen-v2' tool: `poetry add sqlacodegen-v2` (no need in deploy)
Excecute command: `poetry run sqlacodegen_v2  --outfile api/models/models.py postgresql://user:pass@host/database`

## Run test with pytest (poetry required)
`poetry run pytest`