FROM alicevision/alicevision:develop-a2c32bd3b-ubuntu22.04-cuda12.1.1

# Instalações
RUN apt update && apt install -y python3 python3-pip

# Instala FastAPI + Uvicorn + dependência que faltava
RUN pip3 install fastapi uvicorn[standard] python-multipart

# Cria diretório de trabalho
WORKDIR /app

# Copia arquivos para dentro da imagem
COPY photogrammetry_pipeline.sh /app/photogrammetry_pipeline.sh
COPY app.py /app/app.py

# Dá permissão de execução no script
RUN chmod +x /app/photogrammetry_pipeline.sh

# Expõe a porta
EXPOSE 8090

# Comando para iniciar o servidor
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8090"]