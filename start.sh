#!/bin/bash

echo "🔍 Vérification si Docker est en cours d'exécution..."
if ! sudo docker info >/dev/null 2>&1; then
  echo "⚠️ Docker n'est pas en cours d'exécution. Tentative de démarrage..."
  sudo service docker start

  # Attendre que Docker soit réellement disponible avec une boucle de vérification
  echo "⏳ Attente du démarrage de Docker (peut prendre jusqu'à 30 secondes)..."
  attempts=0
  max_attempts=6  # 6 tentatives à 5 secondes = 30 secondes max
  
  while ! sudo docker info >/dev/null 2>&1; do
    attempts=$((attempts+1))
    if [ $attempts -ge $max_attempts ]; then
      echo "❌ Échec du démarrage de Docker après 30 secondes. Vérifiez votre installation."
      echo "   Exécutez la commande: sudo service docker status  "
      exit 1
    fi
    echo "  ⏳ Attente... ($attempts/$max_attempts)"
    sleep 5
  done
fi

echo "✅ Docker est actif."

# Arrêt et suppression des conteneurs existants
echo "🧹 Nettoyage des conteneurs existants..."
docker stop mariadb_container >/dev/null 2>&1 && docker rm mariadb_container --volumes=false >/dev/null 2>&1
docker stop phpmyadmin_container >/dev/null 2>&1 && docker rm phpmyadmin_container --volumes=false >/dev/null 2>&1

# Création des nouveaux conteneurs
echo "🐳 Création et démarrage d'un nouveau conteneur MariaDB..."
sudo docker run -d --name mariadb_container -p 3306:3306 \
  -v mariadb_data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=arbitres \
  -e MYSQL_USER=arbitres \
  -e MYSQL_PASSWORD='rtfgcv' \
  mariadb:latest

echo "🖥️ Création et démarrage de phpMyAdmin..."
sudo docker run -d --name phpmyadmin_container -p 9090:80 \
  --link mariadb_container:db \
  -e PMA_HOST=mariadb_container \
  -e PMA_PORT=3306 \
  -e PMA_USER=arbitres \
  -e PMA_PASSWORD='rtfgcv' \
  phpmyadmin/phpmyadmin


echo "🚀 Lancement de NextJS avec Node..."
pnpm run dev